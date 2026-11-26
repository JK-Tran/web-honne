import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, Phone, Mail, MapPin, Check } from 'lucide-react';
import { BRAND_INFO } from '../../../shared/constants/contact';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Cảm ơn bạn đã đăng ký nhận đặc quyền từ HONNE!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-[#103523] text-stone-300 border-t border-[#184F34] relative w-full overflow-hidden">
      {/* Newsletter Section */}
      <div className="border-b border-[#184F34] py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-2xl font-black text-white flex items-center justify-center md:justify-start gap-2">
              <span className="text-[#F5C518]">HONNE</span> Club & Đặc quyền thành viên
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm mt-1">
              Đăng ký để nhận voucher ưu đãi 20% và thông tin món mới đặc biệt theo mùa
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#0B2619] text-white placeholder-stone-400 border border-[#206645] focus:outline-none focus:ring-1 focus:ring-[#F5C518] text-xs sm:text-sm"
            />
            <button
              type="submit"
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] text-[#14452F] font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4" /> Đã gửi
                </>
              ) : (
                <>
                  Đăng ký <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#F5C518] text-[#0A1C12] flex items-center justify-center font-black">
                <Coffee className="w-5 h-5 text-[#0A1C12]" />
              </div>
              <span className="font-black tracking-widest text-2xl text-[#F5C518] uppercase">
                HONNE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Thương hiệu cà phê rang mộc và trà xanh cao cấp. Mang đến những khoảnh khắc an nhiên, thư thái giữa nhịp sống đô thị hiện đại.
            </p>
            <p className="text-xs font-bold text-[#F5C518] tracking-widest uppercase">
              {BRAND_INFO.subSlogan}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-extrabold mb-4 text-sm uppercase tracking-wider">Khám phá HONNE</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-stone-400 hover:text-[#F5C518] transition">Trang chủ</Link>
              </li>
              <li>
                <Link to="/san-pham" className="text-stone-400 hover:text-[#F5C518] transition">Thực đơn đặc sắc</Link>
              </li>
              <li>
                <Link to="/uu-dai" className="text-stone-400 hover:text-[#F5C518] transition">Combo & Ưu đãi</Link>
              </li>
              <li>
                <Link to="/uu-dai" className="text-stone-400 hover:text-[#F5C518] transition">Ưu đãi & Điểm danh nhận Xu</Link>
              </li>
              <li>
                <Link to="/cua-hang" className="text-stone-400 hover:text-[#F5C518] transition">Hệ thống 4 cửa hàng Tân Bình</Link>
              </li>
              <li>
                <Link to="/lien-he" className="text-stone-400 hover:text-[#F5C518] transition">Góp ý & Chat Zalo</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-extrabold mb-4 text-sm uppercase tracking-wider">Liên hệ hợp tác</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F5C518] shrink-0 mt-0.5" />
                <span>{BRAND_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F5C518] shrink-0" />
                <a href={`tel:${BRAND_INFO.hotline}`} className="hover:text-white transition">
                  {BRAND_INFO.hotline}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F5C518] shrink-0" />
                <a href={`mailto:${BRAND_INFO.email}`} className="hover:text-white transition">
                  {BRAND_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-white font-extrabold mb-4 text-sm uppercase tracking-wider">Giờ hoạt động</h4>
            <div className="bg-[#0B2619] p-4 rounded-xl border border-[#184F34] space-y-2 text-xs">
              <div className="flex justify-between text-stone-300">
                <span>Thứ 2 - Chủ Nhật:</span>
                <span className="font-extrabold text-[#F5C518]">07:00 - 22:30</span>
              </div>
              <p className="text-stone-300 pt-2 border-t border-[#14452F]">
                Phục vụ tại chỗ, mua mang đi và giao hàng tận nơi qua hotline.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-[#184F34] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© 2026 HONNE COFFEE & TEA. Bản quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="hover:text-[#F5C518] text-stone-400 transition-colors flex items-center gap-1.5 font-medium"
            >
              <span>Cổng Quản Trị Hệ Thống</span>
            </Link>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <p className="text-[#F5C518] font-bold tracking-wide">More Coffee, More Happiness!</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
