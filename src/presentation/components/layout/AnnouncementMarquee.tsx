import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  text: string;
  badge?: string;
  link?: string;
  is_active?: number;
  sort_order?: number;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'anc-1',
    text: 'Nhập mã HONNE20 giảm ngay 20% cho đơn hàng đầu tiên qua website!',
    badge: 'ƯU ĐÃI',
    link: '/uu-dai'
  },
  {
    id: 'anc-2',
    text: 'Freeship 0đ tận tay trong bán kính 1km từ 4 chi nhánh Tân Bình',
    badge: 'FREESHIP',
    link: '/san-pham'
  },
  {
    id: 'anc-3',
    text: 'Điểm danh liên tiếp 7 ngày nhận ngay Voucher 50% và tích lũy Xu mỗi ngày',
    badge: 'VIP REWARD',
    link: '/uu-dai'
  },
  {
    id: 'anc-4',
    text: 'Đặt trước qua web - Nhận nước pha sẵn tại quầy siêu tốc chỉ trong 15 phút!',
    badge: 'TIỆN LỢI',
    link: '/san-pham'
  }
];

export const AnnouncementMarquee: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('https://api-honne.hanhan02102012.workers.dev/api/announcements');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAnnouncements(data.data);
        }
      } catch (err) {
        console.warn('Could not fetch announcements from API, using fallback defaults', err);
      }
    };
    fetchAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotate announcement every 5 seconds if not paused
  useEffect(() => {
    if (announcements.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length, isPaused]);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex] || announcements[0];

  const handleItemClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(link);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-gradient-to-r from-[#0C2E1D] via-[#103824] to-[#0A2618] text-white py-1.5 sm:py-2 px-3 sm:px-6 border-b border-[#1A4F34] select-none text-xs relative overflow-hidden transition-colors w-full"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
        
        {/* Left: Ticker Lead Tag */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#F5C518] animate-ping" />
          <span className="font-black text-[#F5C518] text-[10px] sm:text-[11px] uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F5C518]" /> TIN KHUYẾN MÃI:
          </span>
        </div>

        {/* Center: Current Announcement (Smooth transition on index change) */}
        <div
          onClick={() => handleItemClick(current.link)}
          className="flex-1 min-w-0 flex items-center justify-start gap-1.5 sm:gap-2 cursor-pointer hover:opacity-95 transition-opacity py-0.5 group overflow-hidden"
          title="Nhấn để xem chi tiết chương trình khuyến mãi"
        >
          {current.badge && (
            <span className="shrink-0 bg-[#F5C518] text-[#103B27] font-black text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs group-hover:scale-105 transition-transform">
              {current.badge}
            </span>
          )}

          <p className="truncate text-stone-100 font-medium text-[11px] sm:text-xs group-hover:text-amber-200 transition-colors flex-1 min-w-0">
            {current.text}
          </p>

          <span className="hidden md:inline-flex items-center text-[10px] font-bold text-[#F5C518] group-hover:translate-x-0.5 transition-transform shrink-0">
            Xem ngay <ArrowRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        {/* Right: Controls & Indicators */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[9px] sm:text-[10px] text-emerald-200/70 font-mono hidden sm:inline">
            {currentIndex + 1}/{announcements.length}
          </span>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded hover:bg-white/10 text-emerald-200 hover:text-white transition cursor-pointer"
              title="Thông báo trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded hover:bg-white/10 text-emerald-200 hover:text-white transition cursor-pointer"
              title="Thông báo kế tiếp"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
