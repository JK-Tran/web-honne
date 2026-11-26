import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Phone,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
  MapPin,
  Coffee,
  HeartHandshake
} from 'lucide-react';

export const ContactScreen: React.FC = () => {
  const navigate = useNavigate();
  const HOTLINE_PHONE = '0379467986';
  const HOTLINE_DISPLAY = '0379 467 986';
  const ZALO_URL = `https://zalo.me/${HOTLINE_PHONE}`;
  const ZALO_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(ZALO_URL)}&color=14-69-47&bgcolor=ffffff`;

  const handleOpenZalo = () => {
    window.open(ZALO_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 pb-20 relative overflow-hidden select-none w-full">
      
      {/* Subtle organic brand ambient background */}
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-[380px] h-[380px] bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* 1. EDITORIAL HEADER SECTION */}
      <section className="bg-gradient-to-b from-[#14452F] via-[#103B27] to-[#0D3020] text-white pt-8 pb-14 sm:pt-12 sm:pb-20 px-3 sm:px-6 lg:px-8 relative border-b border-[#1E5239] w-full">
        <div className="max-w-4xl mx-auto text-center space-y-3.5 sm:space-y-4 relative z-10">
          
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#F5C518] text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-[#F5C518]" />
            <span>HONNE Luôn Lắng Nghe & Đồng Hành</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-tight">
            Góp Ý & Phản Hồi Trực Tiếp
          </h1>

          <p className="text-xs sm:text-base text-emerald-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Mỗi lời nhận xét chân thật từ bạn là động lực quý giá giúp HONNE hoàn thiện chất lượng thức uống, tốc độ phục vụ và trải nghiệm mỗi ngày.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2 text-[11px] sm:text-xs text-emerald-200">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F5C518]" />
              Tiếp nhận: 06:30 - 22:30 mỗi ngày
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5C518]" />
              Quản lý quán phản hồi trực tiếp
            </span>
          </div>

        </div>
      </section>

      {/* 2. MAIN INTERACTION CONTAINER (Overlap Hero for depth) */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20 space-y-6 sm:space-y-8 w-full">
        
        {/* Core Letter & Feedback Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-[0_12px_40px_rgba(20,69,47,0.06)] p-4 sm:p-10 space-y-6 sm:space-y-8">
          
          {/* Sincere Note from Founder / Store Manager */}
          <div className="space-y-3 border-b border-stone-100 pb-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[#14452F] font-bold text-xs uppercase tracking-wider">
              <Coffee className="w-4 h-4 text-[#14452F]" />
              <span>Gửi đến Quý khách hàng của HONNE</span>
            </div>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              Tụi mình hiểu rằng một ly nước ngon không chỉ nằm ở công thức chuẩn, mà ở sự thấu hiểu khẩu vị của bạn. Dù là một lời khen ngợi động viên hay một điều bạn chưa ưng ý (độ ngọt, lượng đá, độ đậm của trà hay thái độ phục vụ), tụi mình luôn sẵn lòng lắng nghe và điều chỉnh ngay lập tức.
            </p>
          </div>

          {/* Action Area: Zalo & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Action Box: Direct Zalo & Hotline */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                  Kênh tiếp nhận nhanh nhất
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                  Nhắn tin trực tiếp qua Zalo
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Bấm nút bên dưới để mở khung chat Zalo với quản lý quán. Tụi mình sẵn sàng lắng nghe mọi ý kiến từ bạn.
                </p>
              </div>

              {/* Big tactile Zalo CTA */}
              <button
                type="button"
                onClick={handleOpenZalo}
                className="w-full py-4 px-6 rounded-2xl bg-[#0068FF] hover:bg-[#0058D9] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>Gửi Góp Ý Qua Zalo ({HOTLINE_DISPLAY})</span>
                <ArrowUpRight className="w-4 h-4 opacity-80 shrink-0" />
              </button>

              {/* Secondary Direct Call Button */}
              <div className="pt-1 flex items-center justify-between text-xs text-stone-600 bg-stone-50 border border-stone-200/80 rounded-xl px-4 py-3">
                <span className="flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Hoặc gọi trực tiếp Hotline CSKH:</span>
                </span>
                <a
                  href={`tel:${HOTLINE_PHONE}`}
                  className="font-black text-[#14452F] hover:underline text-sm"
                >
                  {HOTLINE_DISPLAY}
                </a>
              </div>
            </div>

            {/* Right QR Box: Scan on desktop */}
            <div className="md:col-span-5 bg-[#FAFBF9] border border-stone-200/80 rounded-2xl p-5 flex flex-col items-center text-center space-y-3">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                <img
                  src={ZALO_QR_URL}
                  alt="Mã QR Zalo HONNE Coffee"
                  className="w-32 h-32 object-contain rounded-lg"
                  loading="lazy"
                />
              </div>

              <div className="space-y-1">
                <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#14452F]" />
                  <span>Quét mã QR bằng điện thoại</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Mở camera điện thoại hoặc Zalo quét mã để chat ngay mà không cần lưu danh bạ.
                </p>
              </div>
            </div>

          </div>

          {/* 3 Core Commitments (Clean & Quiet) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-100">
            <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-1">
              <span className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Lắng nghe chân thật
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Mọi góp ý về độ ngọt, đá hay cách phục vụ đều được quản lý ghi nhận nghiêm túc.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-1">
              <span className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Xử lý tận tâm
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Cam kết phản hồi và pha lại món mới ngay lập tức nếu quý khách chưa hài lòng.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-1">
              <span className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#14452F]" />
                Tri ân gắn kết
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Gửi tặng Xu thưởng hoặc voucher tri ân tới từng khách hàng đóng góp ý kiến.
              </p>
            </div>
          </div>

        </div>

        {/* 3. STORE NETWORK QUICK LINKS */}
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14452F] text-[#F5C518] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#F5C518]" />
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm">
                Bạn muốn ghé trực tiếp quầy quán?
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                HONNE có 4 chi nhánh tại trục đường Cộng Hòa & Quách Văn Tuấn, Q. Tân Bình.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/cua-hang')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-[#14452F] hover:text-[#F5C518] text-stone-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Xem hệ thống 4 cửa hàng</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </section>

      </main>

    </div>
  );
};
