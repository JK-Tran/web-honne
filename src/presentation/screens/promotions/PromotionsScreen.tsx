import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  ArrowRight,
  Sparkles,
  Coins,
  Gift,
  CheckCircle2,
  Bike,
  Users,
  ShoppingBag,
  Info,
  ShieldCheck,
  Ticket
} from 'lucide-react';
import { useRewards } from '../../context/RewardContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrencyVND } from '../../../shared/utils/currency';

interface VoucherItem {
  code: string;
  title: string;
  description: string;
  badge: string;
  category: 'welcome' | 'order' | 'vip';
  discountDisplay: string;
  minOrder: number;
  validTo: string;
}

const ALL_VOUCHERS: VoucherItem[] = [
  {
    code: 'HONNE20',
    title: 'Giảm 20% Cho Bạn Mới',
    description: 'Dành tặng khách hàng mới đặt món qua website HONNE, tối đa 40.000đ.',
    badge: 'BẠN MỚI',
    category: 'welcome',
    discountDisplay: 'GIẢM 20%',
    minOrder: 49000,
    validTo: '31/12/2026'
  },
  {
    code: 'FREESHIP',
    title: 'Miễn Phí Giao Hàng Bán Kính 1km',
    description: 'Freeship tận nơi trong bán kính ≤ 1km do nhân viên quán tự mang siêu tốc.',
    badge: 'GIAO TẬN TAY',
    category: 'welcome',
    discountDisplay: 'FREESHIP',
    minOrder: 0,
    validTo: '31/12/2026'
  },
  {
    code: 'HONNE30K',
    title: 'Giảm 30.000đ Đơn Từ 89K',
    description: 'Ưu đãi dành cho đơn đặt thức uống hoặc combo nước nhóm từ 89.000đ.',
    badge: 'ĐƠN TỪ 89K',
    category: 'order',
    discountDisplay: 'GIẢM 30K',
    minOrder: 89000,
    validTo: '31/12/2026'
  },
  {
    code: 'HONNE50K',
    title: 'Giảm 50.000đ Tiệc Trà Đơn Từ 249K',
    description: 'Ưu đãi đặt nhóm văn phòng hoặc gia đình thưởng thức trà sữa & trà trái cây.',
    badge: 'TIỆC TRÀ NHÓM',
    category: 'order',
    discountDisplay: 'GIẢM 50K',
    minOrder: 249000,
    validTo: '31/12/2026'
  },
  {
    code: 'HONNEVIP50',
    title: 'Giảm 50% Đặc Quyền Điểm Danh 7 Ngày',
    description: 'Món quà tri ân thành viên tích cực điểm danh liên tiếp đủ 7 ngày tại HONNE.',
    badge: 'ĐẶC QUYỀN VIP',
    category: 'vip',
    discountDisplay: 'GIẢM 50%',
    minOrder: 60000,
    validTo: '31/12/2026'
  }
];

export const PromotionsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { coins, streak, isCheckedInToday, setOpenCheckInModal, saveVoucher, savedVouchers } = useRewards();
  const { showToast } = useToast();
  const [filterCategory, setFilterCategory] = useState<'all' | 'welcome' | 'order' | 'vip'>('all');

  const filteredVouchers =
    filterCategory === 'all'
      ? ALL_VOUCHERS
      : ALL_VOUCHERS.filter((v) => v.category === filterCategory);

  const handleUseNow = (code: string) => {
    saveVoucher(code);
    showToast(`Đã chọn mã ${code}! Vào Thực Đơn chọn món, mã sẽ sẵn sàng áp dụng tại Giỏ Hàng.`, 'success');
    navigate('/san-pham');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 pb-24 select-none w-full overflow-hidden">
      
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-r from-[#14452F] via-[#185338] to-[#103824] text-white py-6 sm:py-10 px-3 sm:px-6 lg:px-8 border-b border-[#206645] relative overflow-hidden w-full">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F5C518] text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 sm:mb-2 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
              <span>HONNE REWARDS & ƯU ĐÃI</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Ưu Đãi & Xu Thành Viên
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl font-normal leading-relaxed">
              Điểm danh nhận Xu mỗi ngày (1 Xu = 1 VNĐ), áp dụng trực tiếp tại giỏ hàng và tận hưởng Freeship 1km giao nhanh từ quán.
            </p>
          </div>

          {/* Member reward coin quick card */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 shrink-0 self-stretch md:self-auto shadow-md">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F5C518] text-[#14452F] flex items-center justify-center font-black text-base sm:text-lg shadow-sm shrink-0">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-[#14452F]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] sm:text-[11px] text-emerald-100 font-semibold">Ví Xu tích lũy:</div>
              <div className="text-sm sm:text-lg font-black text-[#F5C518] leading-tight truncate">
                {coins.toLocaleString('vi-VN')} Xu
                <span className="text-[10px] sm:text-xs text-stone-300 font-normal ml-1">(= {coins.toLocaleString('vi-VN')}đ)</span>
              </div>
              <div className="text-[10px] text-emerald-200 mt-0.5">Chuỗi điểm danh: {streak}/7 ngày</div>
            </div>
            <button
              type="button"
              onClick={() => setOpenCheckInModal(true)}
              className="ml-1 sm:ml-2 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] text-[#14452F] font-black text-[11px] sm:text-xs transition shadow-sm cursor-pointer active:scale-95 shrink-0"
            >
              {isCheckedInToday ? 'Đã nhận' : 'Điểm danh'}
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        
        {/* 2. SIMPLE HOW-TO-USE BANNER */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#14452F] flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-emerald-800" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-stone-900 text-sm">
                Áp dụng ưu đãi tự động tại Giỏ Hàng
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Khi thanh toán, bạn chỉ cần bấm nút <strong>"Chọn Voucher"</strong> và gạt <strong>"Dùng Xu"</strong>. Hệ thống sẽ tự động trừ tiền ngay mà không cần gõ mã thủ công!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/san-pham')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#14452F] hover:bg-[#185338] text-[#F5C518] font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Vào Thực Đơn Đặt Món</span>
          </button>
        </div>

        {/* 3. VOUCHER LIST */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-3">
            <div>
              <span className="text-xs font-black tracking-widest uppercase text-emerald-800 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-emerald-700" />
                <span>MÃ KHUYẾN MÃI HONNE</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Ưu Đãi Sẵn Sàng Áp Dụng
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Bấm lưu mã hoặc đặt món ngay để hưởng trọn ưu đãi từ HONNE
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'welcome', label: 'Bạn mới' },
                { key: 'order', label: 'Đơn hàng' },
                { key: 'vip', label: 'Đặc quyền VIP' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterCategory(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterCategory === tab.key
                      ? 'bg-[#14452F] text-[#F5C518] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Vouchers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVouchers.map((v) => {
              const isClaimed = savedVouchers.includes(v.code);

              return (
                <div
                  key={v.code}
                  className="bg-white rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex overflow-hidden group"
                >
                  {/* Left Ticket Stub */}
                  <div className="w-32 bg-gradient-to-br from-[#14452F] to-[#185338] text-white p-4 flex flex-col items-center justify-center text-center relative border-r border-dashed border-stone-300 shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FDFBF7] absolute -top-2 -right-2 border-b border-stone-300" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FDFBF7] absolute -bottom-2 -right-2 border-t border-stone-300" />

                    <span className="text-[10px] font-black tracking-wider uppercase text-[#F5C518] mb-0.5">
                      {v.badge}
                    </span>
                    <span className="text-base sm:text-lg font-black text-white leading-tight">
                      {v.discountDisplay}
                    </span>
                    <span className="mt-2 text-[10px] px-2 py-0.5 rounded bg-white/15 font-mono font-bold text-amber-200">
                      {v.code}
                    </span>
                  </div>

                  {/* Right Ticket Body */}
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm truncate">
                        {v.title}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                        {v.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-500 font-medium">
                        <span className="font-bold text-stone-700">
                          {v.minOrder > 0 ? `Đơn từ ${formatCurrencyVND(v.minOrder)}` : 'Đơn từ 0đ'}
                        </span>
                        <span>•</span>
                        <span>HSD: {v.validTo}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-3">
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã lưu</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => saveVoucher(v.code)}
                          className="px-3.5 py-1.5 bg-[#14452F] hover:bg-[#1A573B] text-[#F5C518] rounded-xl text-xs font-black transition shadow-xs active:scale-95 cursor-pointer"
                        >
                          Lưu mã
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleUseNow(v.code)}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-[#14452F] hover:text-[#F5C518] text-stone-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Đặt món ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. COMBO CALLOUT */}
        <div className="bg-gradient-to-r from-emerald-50 via-[#EAF4ED] to-amber-50 border border-emerald-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#14452F] text-[#F5C518] flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-6 h-6 text-[#F5C518]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                TÍNH NĂNG MỚI TRONG THỰC ĐƠN
              </span>
              <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                Bạn muốn đặt Combo 2 Ly hoặc Tiệc Trà Nhóm 5 Ly?
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Các combo tiết kiệm đã được đưa vào <strong>danh mục Combo trong Thực Đơn</strong> để bạn dễ dàng chọn món và thêm topping cùng lúc!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/san-pham?category=combo')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#14452F] hover:bg-[#185338] text-[#F5C518] font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Xem Menu Combo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5. 3 CORE BENEFITS */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#14452F] flex items-center justify-center shrink-0 font-black">
                <Bike className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm">Freeship Bán Kính ≤ 1km</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Đơn hàng giao trong 1km từ 4 chi nhánh Tân Bình luôn miễn phí 100%. Nhân viên quán trực tiếp mang tới để đảm bảo kem béo không tan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 font-black">
                <Coins className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm">Điểm Danh Nhận Xu Đổi Thưởng</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  1 Xu = 1 VNĐ. Duy trì chuỗi 7 ngày liên tiếp để nhận thưởng lớn và voucher VIP. Điểm danh đều đặn mỗi sáng nhé!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 font-black">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm">Đến Lấy Tại Quầy Tiện Lợi</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Đặt trước qua web, chọn giờ ghé lấy. Barista pha sẵn đúng khẩu vị, bạn chỉ cần đọc 4 số cuối mã đơn là nhận nước ngay!
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
