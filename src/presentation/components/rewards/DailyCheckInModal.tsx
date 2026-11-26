import React from 'react';
import { X, Sparkles, Gift, Check, Coins, Lock, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewards, CHECKIN_DAYS } from '../../context/RewardContext';
import { useAuth } from '../../context/AuthContext';

export const DailyCheckInModal: React.FC = () => {
  const {
    openCheckInModal,
    setOpenCheckInModal,
    coins,
    streak,
    isCheckedInToday,
    checkIn
  } = useRewards();
  const { isAuthenticated, user, openAuthModal } = useAuth();

  if (!openCheckInModal) return null;

  // Calculate upcoming coin reward for today
  const todayDayNumber = isCheckedInToday ? streak : streak + 1;
  const todayConfig = CHECKIN_DAYS.find((d) => d.day === (todayDayNumber > 7 ? 1 : todayDayNumber)) || CHECKIN_DAYS[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#FCFBF7] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 text-stone-900"
        >
          {/* 1. Header Banner */}
          <div className="bg-gradient-to-br from-[#103824] via-[#14452F] to-[#0A2618] text-white p-4 sm:p-6 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5C518]/15 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => setOpenCheckInModal(false)}
              className="absolute top-3.5 right-3.5 p-2 rounded-full text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 transition cursor-pointer z-10"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-400/30 text-[#F5C518] text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-2">
              <Gift className="w-3.5 h-3.5 text-[#F5C518]" />
              <span>HONNE LOYALTY REWARDS</span>
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <span>Điểm Danh Nhận Xu & Quà VIP</span>
            </h3>
            <p className="text-xs text-stone-300 mt-1 max-w-md font-normal leading-relaxed">
              Tích lũy Xu hàng ngày trừ trực tiếp vào đơn hàng và nhận <strong>Voucher VIP 50%</strong> khi hoàn thành chuỗi 7 ngày!
            </p>

            {/* Current Balance & Streak Card */}
            <div className="mt-3.5 sm:mt-4 bg-black/35 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5C518] text-[#14452F] flex items-center justify-center font-black shadow-xs shrink-0">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] text-stone-300 uppercase tracking-wider block font-bold">
                    Số dư tích lũy:
                  </span>
                  <span className="text-sm sm:text-lg font-black text-[#F5C518] truncate block">
                    {coins.toLocaleString('vi-VN')} Xu{' '}
                    <span className="text-[10px] sm:text-[11px] text-stone-300 font-normal">
                      (= {coins.toLocaleString('vi-VN')}đ)
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] sm:text-[10px] text-stone-300 uppercase tracking-wider block font-bold">
                  Chuỗi điểm danh:
                </span>
                <span className="font-black text-emerald-300 text-xs sm:text-base">
                  {streak}/7 Ngày
                </span>
                <div className="w-16 sm:w-20 bg-white/20 h-1.5 rounded-full mt-1 overflow-hidden ml-auto">
                  <div
                    className="bg-[#F5C518] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((streak / 7) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Modal Body */}
          <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
            {/* 7 Days Reward Roadmap */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-stone-500">
                  Lộ trình tích lũy 7 ngày:
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-800 font-bold">
                  1 Xu = 1 VNĐ
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {CHECKIN_DAYS.map((item) => {
                  const isPast = item.day < streak || (item.day === streak && isCheckedInToday);
                  const isCurrent = !isCheckedInToday && item.day === (streak >= 7 ? 1 : streak + 1);
                  const isDay7 = item.day === 7;

                  return (
                    <div
                      key={item.day}
                      className={`py-1.5 px-0.5 sm:py-2 sm:px-1 rounded-lg sm:rounded-xl border text-center flex flex-col items-center justify-between select-none relative ${
                        isPast
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                          : isCurrent
                          ? 'bg-[#FFFDF0] border-2 border-[#F5C518] text-[#14452F] shadow-sm ring-2 ring-[#F5C518]/20'
                          : isDay7
                          ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                          : 'bg-white border-stone-200 text-stone-500'
                      }`}
                    >
                      <span className="text-[9px] sm:text-[10px] font-bold block mb-0.5 sm:mb-1">
                        N.{item.day}
                      </span>

                      {/* Icon */}
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center my-0.5 sm:my-1">
                        {isPast ? (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                          </div>
                        ) : isDay7 ? (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F5C518] text-[#14452F] flex items-center justify-center shadow-xs">
                            <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#14452F]" />
                          </div>
                        ) : (
                          <Coins className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCurrent ? 'text-amber-500' : 'text-stone-300'}`} />
                        )}
                      </div>

                      {/* Coins Label */}
                      <span
                        className={`text-[9px] sm:text-[11px] font-black ${
                          isPast
                            ? 'text-emerald-700'
                            : isCurrent
                            ? 'text-[#14452F]'
                            : isDay7
                            ? 'text-amber-800'
                            : 'text-stone-500'
                        }`}
                      >
                        +{item.coins}
                      </span>

                      {/* VIP Tag on Day 7 */}
                      {isDay7 && (
                        <span className="text-[7px] sm:text-[8px] font-black uppercase text-[#F5C518] bg-[#14452F] px-0.5 py-0.5 rounded-xs mt-0.5 tracking-tighter leading-none">
                          VIP 50%
                        </span>
                      )}

                      {/* Current Day Label */}
                      {isCurrent && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] sm:text-[8px] font-black uppercase text-white bg-[#14452F] px-1 rounded-sm whitespace-nowrap">
                          Hôm nay
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Member Privileges Card */}
            {!isAuthenticated ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-3.5 text-xs text-stone-700 space-y-1.5">
                <div className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Đăng nhập để lưu chuỗi & mở khóa Điểm danh</span>
                </div>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Thành viên HONNE được tặng ngay <strong className="text-amber-900">500 Xu chào mừng</strong> và dùng Xu thanh toán trực tiếp cho tất cả thức uống trên web!
                </p>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-700 space-y-2 shadow-2xs">
                <div className="font-extrabold text-[#14452F] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Đặc quyền thành viên {user?.name || 'HONNE Member'}:</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-[11px] text-stone-600">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14452F] shrink-0" />
                    <span><strong>1 Xu = 1 VNĐ</strong>, dùng trừ thẳng vào tiền mọi đơn hàng khi đặt món.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14452F] shrink-0" />
                    <span>Điểm danh đủ 7 ngày liên tiếp tặng ngay <strong>Voucher 50% (HONNEVIP50)</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14452F] shrink-0" />
                    <span>Số dư Xu đồng bộ tự động với SĐT <strong>{user?.phone || '0379 467 986'}</strong>.</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Action CTA Button */}
            <div className="pt-1">
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpenCheckInModal(false);
                    openAuthModal();
                  }}
                  className="w-full py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition shadow-md flex items-center justify-center gap-2 bg-[#14452F] hover:bg-[#113B26] text-[#F5C518] active:scale-98 cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#F5C518]" />
                  <span>Đăng nhập để nhận ngay 500 Xu & Điểm danh</span>
                </button>
              ) : isCheckedInToday ? (
                <div className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>Đã điểm danh hôm nay (+{todayConfig.coins} Xu) • Hẹn gặp bạn ngày mai!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => checkIn()}
                  className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide transition shadow-md flex items-center justify-center gap-2 bg-[#F5C518] hover:bg-[#ffd54f] text-[#14452F] active:scale-98 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#14452F]" />
                  <span>Điểm danh nhận ngay +{todayConfig.coins} Xu hôm nay!</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
