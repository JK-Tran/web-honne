import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { IdGenerator } from '../../shared/utils/id-generator';
import {
  API_BASE_URL,
  authFetch,
  refreshAccessToken as apiRefreshAccessToken,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  isTokenExpired
} from '../../shared/utils/api-client';

export type MemberTier = 'Bronze' | 'Silver' | 'Gold' | 'VIP';
export type UserRole = 'customer' | 'admin' | 'manager' | 'staff' | 'barista' | 'cashier';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  district?: string;
  role: UserRole;
  branchId?: string | null;
  tier: MemberTier;
  coins: number;
  savedVouchers: string[];
  streakDays: number;
  totalSpent: number;
  orderCount: number;
  avatar?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (identifier: string, pass?: string) => Promise<boolean>;
  register: (name: string, phone: string, email?: string, password?: string) => Promise<boolean>;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  claimVoucher: (code: string) => Promise<boolean>;
  isVoucherClaimed: (code: string) => boolean;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  setAuthState?: (state: { token: string; user: UserProfile; isAuthenticated: boolean; isAdmin: boolean }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      if (isAdminRoute) {
        const adminStored = localStorage.getItem('honne_admin_user') || localStorage.getItem('honne_user');
        if (adminStored) {
          const parsed = JSON.parse(adminStored);
          if (parsed && parsed.role && parsed.role !== 'customer') {
            return parsed;
          }
        }
      }
      const stored = localStorage.getItem('honne_auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        // CRITICAL: Internal admin/manager/staff cannot be active as a customer on client portal
        if (parsed.role && parsed.role !== 'customer') {
          localStorage.removeItem('honne_auth_user');
          return null;
        }
        // Normalize any test phone to official hotline phone
        if (parsed.phone === '0901234183' || parsed.phone === '0901344756' || !parsed.phone) {
          parsed.phone = '0379467986';
        }
        // If this is the reset user account USR_CUS_0001, ensure fresh 0-coin base
        if (parsed.id === 'USR_CUS_0001') {
          return {
            ...parsed,
            coins: 0,
            streakDays: 0,
            totalSpent: 0,
            orderCount: 0,
            savedVouchers: ['HONNE20', 'FREESHIP']
          };
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return getStoredAccessToken();
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return getStoredRefreshToken();
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync state with storage and handle cross-tab or async refresh events
  useEffect(() => {
    const handleRefreshed = (e: any) => {
      if (e.detail?.accessToken) {
        setAccessToken(e.detail.accessToken);
      }
      if (e.detail?.refreshToken) {
        setRefreshToken(e.detail.refreshToken);
      }
    };

    const handleExpired = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    };

    window.addEventListener('honne:token_refreshed', handleRefreshed);
    window.addEventListener('honne:auth_expired', handleExpired);

    return () => {
      window.removeEventListener('honne:token_refreshed', handleRefreshed);
      window.removeEventListener('honne:auth_expired', handleExpired);
    };
  }, []);

  // Proactive Token Refresh check upon initial load (if expired but has 7-day refresh token)
  useEffect(() => {
    const token = getStoredAccessToken();
    const rToken = getStoredRefreshToken();
    if (rToken && isTokenExpired(token)) {
      apiRefreshAccessToken().then((newToken) => {
        if (newToken) {
          setAccessToken(newToken);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('honne_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('honne_auth_user');
    }
  }, [user]);

  // Sync latest authoritative data from Cloudflare D1 with automatic token refresh
  useEffect(() => {
    if (user?.id) {
      authFetch(`${API_BASE_URL}/users/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.user) {
            setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
          }
        })
        .catch(() => {});
    }
  }, [user?.id, accessToken]);

  const saveTokens = (access?: string, refresh?: string) => {
    if (access) setAccessToken(access);
    if (refresh) setRefreshToken(refresh);
    setStoredTokens(access, refresh);
  };

  const clearTokens = () => {
    setAccessToken(null);
    setRefreshToken(null);
    clearStoredTokens();
    localStorage.removeItem('honne_admin_token');
    localStorage.removeItem('honne_admin_user');
    localStorage.removeItem('honne_user');
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const newTok = await apiRefreshAccessToken();
    if (newTok) {
      setAccessToken(newTok);
      setRefreshToken(getStoredRefreshToken());
    }
    return newTok;
  }, []);

  const login = async (identifier: string, pass = ''): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass })
      });
      const data = await res.json();

      if (data.success && data.user) {
        if (data.user.role && data.user.role !== 'customer') {
          showToast('Tài khoản Quản trị vui lòng truy cập Cổng Quản Trị Hệ Thống (/admin/login) để đăng nhập!', 'info');
          closeAuthModal();
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 600);
          return false;
        }
        setUser(data.user);
        saveTokens(data.accessToken || data.token, data.refreshToken);
        showToast(data.message || `Đăng nhập thành công! Chào ${data.user.name}`, 'success');
        closeAuthModal();
        return true;
      } else {
        if (data.code === 'INTERNAL_ACCOUNT_REDIRECT') {
          showToast(data.message, 'info');
          closeAuthModal();
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 800);
          return false;
        }
        showToast(data.message || 'Tài khoản hoặc mật khẩu không chính xác.', 'error');
        return false;
      }
    } catch {
      showToast('Lỗi kết nối máy chủ. Vui lòng thử lại!', 'error');
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    try {
      await authFetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, ...updates })
      });
    } catch {
      // ignore
    }

    showToast('Cập nhật thông tin hồ sơ thành công!', 'success');
    return true;
  };

  const register = async (name: string, phone: string, email = '', pass = ''): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password: pass })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        saveTokens(data.accessToken || data.token, data.refreshToken);
        showToast(data.message, 'success');
        closeAuthModal();
        return true;
      } else {
        showToast(data.message || 'Đăng ký không thành công.', 'error');
        return false;
      }
    } catch {
      showToast('Lỗi kết nối máy chủ. Vui lòng thử lại!', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    clearTokens();
    showToast('Đã đăng xuất tài khoản.', 'info');
  };

  const claimVoucher = async (code: string): Promise<boolean> => {
    if (!user) {
      openAuthModal();
      showToast('Vui lòng Đăng nhập để lưu voucher vào ví!', 'info');
      return false;
    }

    const upper = code.toUpperCase();
    if (user.savedVouchers.includes(upper)) {
      showToast(`Mã ${upper} đã có sẵn trong ví của bạn!`, 'info');
      return true;
    }

    const updatedVouchers = [...user.savedVouchers, upper];
    setUser({ ...user, savedVouchers: updatedVouchers });

    // Sync to backend worker with authFetch
    try {
      authFetch(`${API_BASE_URL}/users/vouchers/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, code: upper })
      }).catch(() => {});
    } catch {
      // ignore
    }

    showToast(`Đã lưu voucher ${upper} vào ví! Mã sẽ tự động xuất hiện tại giỏ hàng.`, 'success');
    return true;
  };

  const isVoucherClaimed = (code: string): boolean => {
    if (!user) return false;
    return user.savedVouchers.includes(code.toUpperCase());
  };

  const addCoins = (amount: number) => {
    if (!user) return;
    const newCoins = user.coins + amount;
    setUser({ ...user, coins: newCoins });
    authFetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.id, coins: newCoins })
    }).catch(() => {});
  };

  const deductCoins = (amount: number): boolean => {
    if (!user || user.coins < amount) return false;
    const newCoins = Math.max(0, user.coins - amount);
    setUser({ ...user, coins: newCoins });
    authFetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.id, coins: newCoins })
    }).catch(() => {});
    return true;
  };

  const setAuthState = (state: { token: string; user: UserProfile; isAuthenticated: boolean; isAdmin: boolean }) => {
    setUser(state.user);
    setAccessToken(state.token);
    saveTokens(state.token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'manager',
        accessToken,
        refreshToken,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        refreshAccessToken,
        logout,
        updateProfile,
        claimVoucher,
        isVoucherClaimed,
        addCoins,
        deductCoins,
        setAuthState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
