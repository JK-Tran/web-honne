import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Coffee, Award, Heart, MapPin, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { BRAND_INFO } from '../../../shared/constants/contact';

export const AboutScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBFBF9] pb-20 text-[#1A1A1A] w-full overflow-hidden">
      {/* 1. Hero Section - Architectural Designer Aesthetics */}
      <section className="bg-gradient-to-b from-[#103B27] via-[#14452F] to-[#0A1D13] text-white py-8 sm:py-20 px-3 sm:px-6 lg:px-8 relative overflow-hidden border-b border-[#206645] w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#103824] border border-[#1C4A2E] text-[#F5C518] text-[10px] sm:text-xs font-black uppercase tracking-widest">
              <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5C518]" /> Câu chuyện thương hiệu HONNE
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-2xl sm:text-5xl font-black text-[#F5C518] tracking-tight uppercase">
                HONNE COFFEE & TEA
              </h2>
              <h1 className="text-xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Hơn cả một ly cà phê, <br />
                <span className="text-stone-300 font-extrabold">đó là trải nghiệm an nhiên</span>
              </h1>
            </div>

            <p className="text-stone-300 text-xs sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              HONNE Coffee & Tea được sáng lập với khát vọng lưu giữ nét mộc mạc nguyên bản của hạt cà phê cao nguyên và lá trà xanh tươi mát, mang đến không gian thư thái giữa nhịp sống bận rộn tại Sài Gòn.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
              <Link
                to="/san-pham"
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] active:scale-98 text-[#103B27] font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                Khám phá thức uống <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cua-hang"
                className="w-full sm:w-auto px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white font-bold text-xs sm:text-sm transition-all border border-stone-400 hover:border-white text-center"
              >
                4 Chi nhánh Tân Bình
              </Link>
            </div>
          </motion.div>

          {/* Right: Flagship Kiosk Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md bg-[#103824] rounded-xl p-2 border border-emerald-600/30 shadow-2xl overflow-hidden">
              <img
                src="/images/assets/honne_kiosk_original.jpg"
                alt="HONNE Kiosk 3D Flagship"
                className="w-full h-auto object-cover rounded-lg"
              />
              <div className="p-3 text-center">
                <span className="text-xs font-black text-[#F5C518] uppercase tracking-wider block">
                  Quầy Kiosk tiêu chuẩn HONNE
                </span>
                <span className="text-[11px] text-stone-400">
                  Thiết kế hiện đại, mộc mạc và thân thiện
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Key Metrics - Crisp Clean Hairline */}
      <section className="bg-white border-b border-stone-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-3 border-r border-stone-100 last:border-none">
            <span className="text-3xl sm:text-4xl font-black text-[#14452F] block">100%</span>
            <span className="text-xs font-bold text-stone-600 mt-1 block">Hạt Robusta mộc Đắk Lắk</span>
          </div>
          <div className="text-center p-3 border-r border-stone-100 last:border-none">
            <span className="text-3xl sm:text-4xl font-black text-[#14452F] block">4</span>
            <span className="text-xs font-bold text-stone-600 mt-1 block">Chi nhánh tại Quận Tân Bình</span>
          </div>
          <div className="text-center p-3 border-r border-stone-100 last:border-none">
            <span className="text-3xl sm:text-4xl font-black text-[#14452F] block">50.000+</span>
            <span className="text-xs font-bold text-stone-600 mt-1 block">Ly phục vụ mỗi tháng</span>
          </div>
          <div className="text-center p-3">
            <span className="text-3xl sm:text-4xl font-black text-[#14452F] block">4.9 ★</span>
            <span className="text-xs font-bold text-stone-600 mt-1 block">Đánh giá trung bình từ khách hàng</span>
          </div>
        </div>
      </section>

      {/* 3. Triết lý hạt cà phê & lá trà */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
        <div className="bg-white rounded-xl p-6 sm:p-12 shadow-xs border border-stone-200">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#14452F]">
              🌿 Khởi nguồn đam mê
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              Hành trình tạo nên tách đồ uống trọn vẹn
            </h2>
            <div className="w-12 h-0.5 bg-[#F5C518] mx-auto" />
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Cái tên <strong>&ldquo;HONNE&rdquo;</strong> (本音) trong tiếng Nhật có nghĩa là cảm xúc và sự chân thật tự đáy lòng. Với chúng tôi, sự chân thật bắt đầu từ việc lựa chọn những hạt cà phê chín mọng, từng lá trà được nâng niu và quy trình pha chế giữ trọn hương vị mộc mạc tự nhiên.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-[#FAFBF9] border border-stone-200 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#E5ECE7] text-[#14452F] flex items-center justify-center font-bold">
                <Award className="w-6 h-6 text-[#14452F]" />
              </div>
              <h4 className="font-black text-stone-900 text-base">Hạt cà phê chọn lọc</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Được thu hái thủ công từ vùng đất đỏ bazan Buôn Ma Thuột, rang mộc vừa tới để đánh thức tầng hương socola và hậu vị ngọt thanh tự nhiên.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#FAFBF9] border border-stone-200 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#E5ECE7] text-[#14452F] flex items-center justify-center font-bold">
                <Leaf className="w-6 h-6 text-[#14452F]" />
              </div>
              <h4 className="font-black text-stone-900 text-base">Lá trà sương sớm</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Búp trà xanh Oolong và trà lài được ủ lạnh chiết xuất chậm theo từng mẻ nhỏ, giữ trọn vẹn tinh dầu trà thơm ngát và hoạt chất chống oxy hóa.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#FAFBF9] border border-stone-200 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#E5ECE7] text-[#14452F] flex items-center justify-center font-bold">
                <Heart className="w-6 h-6 text-[#14452F]" />
              </div>
              <h4 className="font-black text-stone-900 text-base">Tận tâm phục vụ</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Mỗi Barista tại HONNE luôn tươi cười và lắng nghe khẩu vị riêng của bạn: từ mức đường, lượng đá đến từng lớp kem muối béo ngậy.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Bottom Brand Banner */}
        <div className="bg-[#14452F] text-white rounded-xl p-8 sm:p-12 text-center shadow-xl border border-[#163D26] space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#F5C518] font-black text-lg tracking-widest uppercase">
            <Coffee className="w-6 h-6 text-[#F5C518]" /> HONNE COFFEE & TEA
          </div>
          <h3 className="text-2xl sm:text-4xl font-black italic tracking-wide text-white">
            &ldquo;More Coffee, More Happiness!&rdquo;
          </h3>
          <p className="text-stone-300 text-sm max-w-lg mx-auto">
            Ghé thăm một trong 4 chi nhánh tại Tân Bình (183 Cộng Hòa, 2 Quách Văn Tuấn, 121 Cộng Hòa, 22A Cộng Hòa) hoặc đặt trực tuyến để thưởng thức ngay!
          </p>
          <div className="pt-2">
            <Link
              to="/cua-hang"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-[#F5C518] hover:bg-[#ffd54f] text-[#103B27] font-black text-sm transition-all shadow-md"
            >
              Xem hệ thống 4 cửa hàng <Store className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
