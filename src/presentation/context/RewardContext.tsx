import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { API_BASE_URL, authFetch } from '../../shared/utils/api-client';

export interface CheckInDayConfig {
  day: number;
  coins: number;
  voucherCode?: string;
}

export const CHECKIN_DAYS: CheckInDayConfig[] = [
  { day: 1, coins: 50 },
  { day: 2, coins: 50 },
  { day: 3, coins: 100 },
  { day: 4, coins: 50 },
  { day: 5, coins: 100 },
  { day: 6, coins: 100 },
  { day: 7, coins: 500, voucherCode: 'HONNEVIP50' }
];

interface RewardContextType {
  coins: number;
  streak: number;
  lastCheckInDate: string | null;
  savedVouchers: string[];
  isCheckedInToday: boolean;
  checkIn: () => boolean;
  redeemCoins: (amount: number) => number;
  saveVoucher: (code: string) => void;
  openCheckInModal: boolean;
  setOpenCheckInModal: (open: boolean) => void;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

const STORAGE_KEY = 'honne_rewards_profile';

// Get YYYY-MM-DD in local time
const getLocalDayStr = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getCalendarDaysDiff = (earlierStr: string, laterStr: string): number => {
  const [y1, m1, d1] = earlierStr.split('-').map(Number);
  const [y2, m2, d2] = laterStr.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
};

export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { user, addCoins: authAddCoins, deductCoins: authDeductCoins, updateProfile, accessToken } = useAuth();
  const [coins, setCoins] = useState<number>(0);
  const [rawStreak, setRawStreak] = useState<number>(0);
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);
  const [savedVouchers, setSavedVouchers] = useState<string[]>([]);
  const [openCheckInModal, setOpenCheckInModal] = useState<boolean>(false);

  // Load from localStorage on mount & auto-sync with user
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If logged in as USR_CUS_0001, reset stale cached 600 Xu to 0
        if (user?.id === 'USR_CUS_0001') {
          setCoins(0);
          setRawStreak(0);
          setSavedVouchers(user.savedVouchers || ['HONNE20', 'FREESHIP']);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            coins: 0,
            streak: 0,
            lastCheckInDate: parsed.lastCheckInDate || null,
            savedVouchers: user.savedVouchers || ['HONNE20', 'FREESHIP']
          }));
        } else {
          setCoins(parsed.coins || 0);
          setRawStreak(parsed.streak || 0);
          setLastCheckInDate(parsed.lastCheckInDate || null);
          setSavedVouchers(parsed.savedVouchers || []);
        }
      }
    } catch (e) {
      console.error('Failed to load rewards from storage', e);
    }
  }, [user?.id]);

  // Keep local coins synced when user coins update
  useEffect(() => {
    if (user) {
      setCoins(user.coins);
      if (user.streakDays !== undefined) {
        setRawStreak(user.streakDays);
      }
    }
  }, [user?.coins, user?.streakDays]);

  // Save to localStorage whenever state changes
  const saveToStorage = (newCoins: number, newStreak: number, newDate: string | null, newVouchers: string[]) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          coins: newCoins,
          streak: newStreak,
          lastCheckInDate: newDate,
          savedVouchers: newVouchers
        })
      );
    } catch (e) {
      console.error('Failed to save rewards to storage', e);
    }
  };

  const todayStr = getLocalDayStr();
  const isCheckedInToday = lastCheckInDate === todayStr;

  // Streak calculation: if user missed a day (diff > 1), streak resets to 0 (next is Day 1)
  const streak = (() => {
    if (!lastCheckInDate) return rawStreak > 0 ? rawStreak : 0;
    if (lastCheckInDate === todayStr) return rawStreak;
    const diff = getCalendarDaysDiff(lastCheckInDate, todayStr);
    if (diff === 1) return rawStreak; // Yesterday was checked in, streak is still maintained
    return 0; // Missed yesterday or more -> streak broken, resets to 0!
  })();

  const effectiveCoins = user ? user.coins : coins;

  const checkIn = (): boolean => {
    if (isCheckedInToday) {
      showToast('Bạn đã điểm danh nhận xu hôm nay rồi! Quay lại vào ngày mai nhé.', 'info');
      return false;
    }

    let nextStreak = 1;
    if (lastCheckInDate) {
      const diff = getCalendarDaysDiff(lastCheckInDate, todayStr);
      if (diff === 1) {
        // Continuous streak
        nextStreak = rawStreak >= 7 ? 1 : rawStreak + 1;
      } else {
        // Streak broken -> reset back to Day 1
        nextStreak = 1;
      }
    } else if (rawStreak > 0) {
      nextStreak = rawStreak >= 7 ? 1 : rawStreak + 1;
    }

    const config = CHECKIN_DAYS.find((d) => d.day === nextStreak) || CHECKIN_DAYS[0];
    const earnedCoins = config.coins;
    const newCoins = effectiveCoins + earnedCoins;
    const newVouchers = [...savedVouchers];

    if (config.voucherCode && !newVouchers.includes(config.voucherCode)) {
      newVouchers.push(config.voucherCode);
    }

    setCoins(newCoins);
    setRawStreak(nextStreak);
    setLastCheckInDate(todayStr);
    setSavedVouchers(newVouchers);
    saveToStorage(newCoins, nextStreak, todayStr, newVouchers);

    // Synchronize with AuthContext and backend worker
    if (user) {
      authAddCoins(earnedCoins);
      updateProfile({ streakDays: nextStreak, coins: newCoins }).catch(() => {});
      authFetch(`${API_BASE_URL}/rewards/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, displayName: user.name })
      }).catch(() => {});
    }

    // Fire festive confetti!
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F5C518', '#14452F', '#52B788']
    });

    showToast(
      `Điểm danh Ngày ${nextStreak} thành công! Nhận được +${earnedCoins} Xu HONNE!`,
      'success'
    );

    return true;
  };

  const redeemCoins = (amount: number): number => {
    if (amount <= 0 || effectiveCoins <= 0) return 0;
    const actualRedeem = Math.min(amount, effectiveCoins);
    const newCoins = effectiveCoins - actualRedeem;
    setCoins(newCoins);
    if (user) {
      authDeductCoins(actualRedeem);
    }
    saveToStorage(newCoins, streak, lastCheckInDate, savedVouchers);
    return actualRedeem;
  };

  const saveVoucher = (code: string) => {
    if (!savedVouchers.includes(code)) {
      const updated = [...savedVouchers, code];
      setSavedVouchers(updated);
      saveToStorage(effectiveCoins, streak, lastCheckInDate, updated);
      showToast(`Đã lưu mã ${code} vào ví ưu đãi của bạn!`, 'success');
    } else {
      showToast(`Mã ${code} đã có trong ví của bạn.`, 'info');
    }
  };

  return (
    <RewardContext.Provider
      value={{
        coins: effectiveCoins,
        streak,
        lastCheckInDate,
        savedVouchers,
        isCheckedInToday,
        checkIn,
        redeemCoins,
        saveVoucher,
        openCheckInModal,
        setOpenCheckInModal
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};

export const useRewards = (): RewardContextType => {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error('useRewards must be used within a RewardProvider');
  }
  return context;
};
