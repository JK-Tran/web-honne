import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  MapPin,
  Award,
  Coins,
  Gift,
  Check,
  Flame,
  Star,
  Tag,
  Ticket,
  Users,
  Bike
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../hooks/useProducts';
import { useRewards } from '../../context/RewardContext';
import { useLocation } from '../../context/LocationContext';
import { ProductCard } from '../../components/product/ProductCard';
import { formatCurrencyVND } from '../../../shared/utils/currency';

interface VoucherItem {
  code: string;
  badge: string;
  title: string;
  sub: string;
}

const FEATURED_VOUCHERS: VoucherItem[] = [
  {
    code: 'HONNE20',
    badge: 'BẠN MỚI',
    title: 'Giảm 20% Đơn Đầu Tiên',
    sub: 'Tối đa 40k • Cho mọi món nước'
  },
  {
    code: 'FREESHIP',
    badge: 'GIAO TẬN TAY',
    title: 'Freeship Bán Kính 1km',
    sub: 'Đơn từ 0đ • Nhân viên quán mang tới'
  },
  {
    code: 'HONNE30K',
    badge: 'ĐƠN TỪ 89K',
    title: 'Giảm 30.000đ Combo Nước',
    sub: 'Áp dụng mọi chi nhánh Tân Bình'
  },
  {
    code: 'HONNEVIP50',
    badge: 'VIP REWARDS',
    title: 'Giảm 50.000đ Đơn Từ 120k',
    sub: 'Đặc quyền thành viên điểm danh'
  }
];

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts('all');
  const { coins, streak, isCheckedInToday, setOpenCheckInModal, saveVoucher, savedVouchers } = useRewards();
  const { setIsLocationModalOpen } = useLocation();

  // Top best sellers for homepage
  const bestSellerProducts = products
    .filter((p) => p.isFeatured || p.isBestSeller)
    .slice(0, 8);

  const scrollToBestSellers = () => {
    const el = document.getElementById('best-sellers-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900">
      {/* 1. ARTISANAL STOREFRONT HERO SECTION (Balanced Editorial Left, Showcase Kiosk Right) */}
      <section className="relative bg-gradient-to-br from-[#0A2618] via-[#0F3723] to-[#14452F] text-white border-b border-[#206645] overflow-hidden w-full">
        {/* Subtle ambient lighting */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#F5C518]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center">
            
            {/* CỘT TRÁI: Editorial Story & Action CTAs (Chữ bên trái) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 flex flex-col justify-center space-y-3.5 sm:space-y-4 text-center lg:text-left order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-900/90 border border-emerald-400/30 text-[#F5C518] text-[10px] sm:text-xs font-black tracking-widest uppercase w-fit mx-auto lg:mx-0 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#F5C518] shrink-0" />
                <span>4 CHI NHÁNH TÂN BÌNH • PHA CHẾ THỦ CÔNG</span>
              </div>

              <div className="space-y-1 sm:space-y-1.5">
                <div className="text-[11px] sm:text-sm font-black tracking-[0.2em] sm:tracking-[0.25em] text-[#F5C518] uppercase">
                  HONNE COFFEE & TEA
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-black text-white leading-tight tracking-tight">
                  Cà Phê Rang Mộc & <br className="hidden sm:inline" />
                  <span className="text-[#F5C518]">Trà Tươi Đậm Vị Sài Gòn</span>
                </h1>
              </div>

              <p className="text-stone-200 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                Chắt lọc từ hạt Robusta Tây Nguyên rang mộc không tẩm bơ và búp trà Oolong sao lửa đậm đà. Đặt món trực tiếp qua web quán để nhận ưu đãi thành viên, Freeship 1km tận tay nhanh chóng trong 15-20 phút!
              </p>

              {/* CTAs */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 w-full">
                <Link
                  to="/san-pham"
                  className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] active:scale-98 text-[#14452F] font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  Khám phá thực đơn đồ uống <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/cua-hang"
                  className="w-full sm:w-auto px-5 py-3 sm:px-5 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm tracking-wide transition-all border border-white/20 text-center cursor-pointer"
                >
                  Hệ thống 4 cửa hàng
                </Link>
              </div>

              {/* Compact Trust Highlights */}
              <div className="pt-2.5 sm:pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 sm:gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-emerald-200/90 font-medium border-t border-white/10">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#F5C518]" />
                  100% Cà phê rang mộc tự nhiên
                </span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-[#F5C518]" />
                  Freeship 0đ bán kính 1km
                </span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
                  Giao tươi 15-20 phút
                </span>
              </div>
            </motion.div>

            {/* CỘT PHẢI: Hình Ảnh Quán Kiosk HONNE Được Bo Góc Đẹp Mắt (Hình ảnh bên phải) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 relative order-1 lg:order-2 w-full"
            >
              {/* Golden Ambient Glow */}
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-75 pointer-events-none" />

              <div className="relative w-full h-[220px] sm:h-[320px] lg:h-[400px] xl:h-[440px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-emerald-400/30 group bg-stone-900">
                <img
                  src="/images/assets/honne_kiosk_original.jpg"
                  alt="Không gian quầy Kiosk HONNE Coffee & Tea"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 select-none"
                />

                {/* Subtle top and bottom dark gradient overlays */}
                <div className="absolute inset-x-0 top-0 h-20 sm:h-24 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />

                {/* Floating Store Rating Badge - Top Right */}
                <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10 bg-black/65 backdrop-blur-md text-white border border-[#F5C518]/50 shadow-lg px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] sm:text-xs font-bold">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F5C518] fill-[#F5C518] shrink-0" />
                  <span>4.9/5 • 1.800+ Khách quen</span>
                </div>

                {/* Floating Store Status - Bottom */}
                <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3.5 sm:inset-x-3.5 z-10 bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-xl px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center justify-between text-[11px] sm:text-xs">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#F5C518] animate-pulse shrink-0" />
                    <span className="font-bold text-stone-100 truncate">Kiosk chuẩn HONNE</span>
                  </div>
                  <span className="text-amber-300 font-semibold shrink-0 ml-1">06:30 - 22:30</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. SHOPEE-STYLE VOUCHER STRIP (Lưu mã ngay tại trang chủ) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-5 sm:mt-6 w-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#14452F] to-[#185338] text-white rounded-2xl p-3.5 sm:p-5 shadow-lg border border-emerald-600/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5C518] shrink-0" />
              <h3 className="font-black text-white text-xs sm:text-base tracking-tight truncate">
                Mã Ưu Đãi Hôm Nay • Thu thập dùng ngay
              </h3>
            </div>
            <Link
              to="/uu-dai"
              className="text-[#F5C518] hover:underline text-[11px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1 shrink-0 ml-2"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {FEATURED_VOUCHERS.map((v) => {
              const isSaved = savedVouchers.includes(v.code);
              return (
                <div
                  key={v.code}
                  className="bg-white text-stone-900 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-xs border border-stone-200"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                        {v.badge}
                      </span>
                      <strong className="text-xs font-black text-[#14452F]">{v.code}</strong>
                    </div>
                    <div className="text-xs font-extrabold truncate text-stone-900">{v.title}</div>
                    <div className="text-[10px] text-stone-500 truncate">{v.sub}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => saveVoucher(v.code)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition cursor-pointer ${
                      isSaved
                        ? 'bg-stone-100 text-emerald-700 border border-emerald-300'
                        : 'bg-[#14452F] hover:bg-[#185338] text-[#F5C518] shadow-xs active:scale-95'
                    }`}
                  >
                    {isSaved ? 'Đã lưu ✓' : 'Lưu mã'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS SECTION (Không tabs danh mục - Thuần món bán chạy nhất) */}
      <section id="best-sellers-section" className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 pb-3 border-b border-stone-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black tracking-widest text-[#14452F] uppercase mb-1">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
              <span>TOP SELECTIONS • BEST SELLERS</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Món Bán Chạy Nhất Tại Quán 🔥
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5 sm:mt-1">
              Những thức uống signature đậm vị được khách hàng Tân Bình gọi nhiều nhất mỗi ngày
            </p>
          </div>

          <Link
            to="/san-pham"
            className="text-xs sm:text-sm font-bold text-[#14452F] hover:underline flex items-center gap-1 shrink-0"
          >
            Xem toàn bộ {products.length} món <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
          {bestSellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <Link
            to="/san-pham"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl border-2 border-[#14452F] text-[#14452F] hover:bg-[#14452F] hover:text-[#F5C518] font-black text-xs sm:text-sm tracking-wide transition-all shadow-xs w-full sm:w-auto"
          >
            Xem toàn bộ menu thức uống ({products.length} món) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 6. COMBO TIẾT KIỆM (Thuần cà phê và trà tươi - Không trà sữa) */}
      <section className="px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-10 sm:mb-14 w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase text-emerald-800 tracking-wider block">
              TIẾT KIỆM TỐI ƯU
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-stone-900">
              Combo Thức Uống Đôi & Nhóm 👥
            </h3>
          </div>
          <Link
            to="/san-pham?category=combo"
            className="text-xs sm:text-sm font-bold text-[#14452F] hover:underline flex items-center gap-1 shrink-0"
          >
            Tất cả combo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Combo 1: Cà phê Năng Lượng Đôi */}
          <div className="bg-gradient-to-br from-[#14452F] to-[#185338] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-emerald-600/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 group">
            <div className="space-y-2 sm:space-y-2.5 w-full">
              <span className="bg-[#F5C518] text-[#14452F] font-black text-[9px] sm:text-[10px] uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full inline-block">
                BÁN CHẠY NHẤT • TIẾT KIỆM 11K
              </span>
              <h3 className="text-base sm:text-xl font-black text-white leading-snug">
                Combo Cà Phê Năng Lượng Đôi (02 Ly)
              </h3>
              <p className="text-xs text-stone-200 leading-relaxed max-w-sm font-normal">
                01 Cà phê Muối Cố Đô sánh mịn + 01 Cà phê Sữa Tươi Thanh Trùng đánh thức ngày mới.
              </p>
              <div className="flex items-baseline gap-2 pt-0.5 sm:pt-1">
                <span className="text-xl sm:text-2xl font-black text-[#F5C518]">39.000đ</span>
                <span className="text-xs text-stone-300 line-through">50.000đ</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/san-pham?category=combo')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] text-[#14452F] font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Tùy chỉnh & Đặt combo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-24 h-28 sm:w-32 sm:h-36 shrink-0 flex items-center justify-center p-2 bg-white/10 rounded-2xl border border-white/20 group-hover:scale-105 transition-transform">
              <img
                src="/images/assets/drink_coffee_muoi.png"
                alt="Combo cà phê muối"
                className="max-h-full max-w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* Combo 2: Trà Trái Cây Thanh Nhiệt */}
          <div className="bg-gradient-to-br from-[#14452F] to-[#185338] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-emerald-600/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 group">
            <div className="space-y-2 sm:space-y-2.5 w-full">
              <span className="bg-[#F5C518] text-[#14452F] font-black text-[9px] sm:text-[10px] uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full inline-block">
                GIẢI NHIỆT MÙA NẮNG • TIẾT KIỆM 11K
              </span>
              <h3 className="text-base sm:text-xl font-black text-white leading-snug">
                Combo Trà Trái Cây Thanh Nhiệt (02 Ly)
              </h3>
              <p className="text-xs text-stone-200 leading-relaxed max-w-sm font-normal">
                01 Trà Đào Cam Sả Tươi + 01 Trà Vải Hoa Lài Thanh Mát, tặng kèm đào miếng giòn ngọt.
              </p>
              <div className="flex items-baseline gap-2 pt-0.5 sm:pt-1">
                <span className="text-xl sm:text-2xl font-black text-[#F5C518]">45.000đ</span>
                <span className="text-xs text-stone-300 line-through">56.000đ</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/san-pham?category=combo')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] text-[#14452F] font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Tùy chỉnh & Đặt combo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-24 h-28 sm:w-32 sm:h-36 shrink-0 flex items-center justify-center p-2 bg-white/10 rounded-2xl border border-white/20 group-hover:scale-105 transition-transform">
              <img
                src="/images/assets/drink_peach_tea_honne.png"
                alt="Combo trà đào cam sả"
                className="max-h-full max-w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Hệ thống 4 cửa hàng Tân Bình Snapshot */}
      <section className="px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12 sm:mb-16 w-full">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 text-center md:text-left">
            <span className="text-[10px] sm:text-xs font-black uppercase text-[#14452F] tracking-wider block">
              Trải nghiệm thực tế
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-stone-900">
              Ghé thăm 4 chi nhánh HONNE tại Tân Bình
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-lg font-normal">
              183 Cộng Hòa • Số 2 Quách Văn Tuấn • 121 Cộng Hòa • 22A Cộng Hòa. Phục vụ tại quầy và giao tận nơi siêu tốc trong bán kính 1km.
            </p>
          </div>

          <Link
            to="/cua-hang"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#14452F] hover:bg-[#185338] text-[#F5C518] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shrink-0 transition cursor-pointer text-center"
          >
            <MapPin className="w-4 h-4" /> Mở bản đồ 4 chi nhánh
          </Link>
        </div>
      </section>
    </div>
  );
};
