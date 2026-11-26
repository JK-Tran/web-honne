import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  UserCheck,
  BarChart3,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ShoppingBag,
  Bell,
  Sparkles,
  ExternalLink,
  List,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { formatCurrencyVND } from '../../../../shared/utils/currency';

interface AdminExecutiveDashboardTabProps {
  metrics: {
    todayRevenue: number;
    monthRevenue: number;
    todayOrders: number;
    totalOrders: number;
    totalCustomers?: number;
    totalStaff?: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
    profitMarginPercent: number;
    avgOrderValue: number;
  };
  orders: any[];
  onSelectTab: (tab: any) => void;
  selectedBranch: string;
}

export const AdminExecutiveDashboardTab: React.FC<AdminExecutiveDashboardTabProps> = ({
  metrics,
  orders,
  onSelectTab,
  selectedBranch
}) => {
  const [chartTimeRange, setChartTimeRange] = useState<'7' | '30' | '90' | '365'>('30');

  // Helper to extract item name
  const getItemName = (it: any) => it?.name || it?.productName || it?.title || it?.product_name || 'Đồ uống HONNE';

  // Map live orders directly from Cloudflare D1
  const displayOrders = orders.slice(0, 5).map((o) => ({
    id: o.id,
    customerName: o.customer?.name || 'Khách vãng lai',
    productName: (o.items && o.items.length > 0)
      ? o.items.map((it: any) => `${getItemName(it)}${it.quantity > 1 ? ` (x${it.quantity})` : ''}`).join(', ')
      : 'Đồ uống HONNE',
    total: o.finalTotal || o.total_amount || o.subtotal || 0,
    status: o.status === 'completed' || o.status === 'delivered' ? 'completed' : o.status === 'cancelled' ? 'cancelled' : 'brewing',
    time: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Hôm nay'
  }));

  // Dynamic Donut Calculations
  const completedDonutCount = orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length;
  const processingDonutCount = orders.filter((o) => 
    o.status === 'brewing' || o.status === 'pending' || o.status === 'confirmed' || 
    o.status === 'shipping' || o.status === 'delivering' || o.status === 'preparing'
  ).length;
  const cancelledDonutCount = orders.filter((o) => o.status === 'cancelled').length;
  const totalDonutCount = orders.length;

  const completedDonutPct = totalDonutCount > 0 ? Math.round((completedDonutCount / totalDonutCount) * 100) : 0;
  const processingDonutPct = totalDonutCount > 0 ? Math.round((processingDonutCount / totalDonutCount) * 100) : 0;
  const cancelledDonutPct = totalDonutCount > 0 ? Math.max(0, 100 - completedDonutPct - processingDonutPct) : 0;

  // Circumference = 2 * PI * 38 = 238.76
  const circumference = 238.76;
  const completedDash = (completedDonutPct / 100) * circumference;
  const processingDash = (processingDonutPct / 100) * circumference;
  const cancelledDash = (cancelledDonutPct / 100) * circumference;
  const processingOffset = -completedDash;
  const cancelledOffset = -(completedDash + processingDash);

  return (
    <div className="space-y-6">
      {/* 1. TOP GREETING HERO BANNER WITH LATTE ART & LEAVES */}
      <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FAF3E7] to-[#F5EAD6] rounded-3xl p-6 sm:p-8 border border-[#EFE4D2] shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#103B27] tracking-tight">
            Xin chào, Trần Minh Quân!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 font-medium leading-relaxed">
            Chúc bạn có một ngày làm việc hiệu quả cùng <strong className="text-[#103B27]">HONNE Coffee</strong>.
          </p>
        </div>

        {/* Studio Cappuccino & Leaves Graphic */}
        <div className="relative flex items-center justify-end shrink-0 z-10">
          <div className="relative w-44 sm:w-56 h-28 sm:h-32 flex items-center justify-end">
            {/* Background Decorative Coffee Leaves SVG */}
            <div className="absolute right-12 top-0 pointer-events-none opacity-90 scale-110">
              <svg width="140" height="100" viewBox="0 0 160 120" fill="none">
                <path
                  d="M10 90 C30 50, 90 30, 150 10 C100 40, 60 70, 10 90 Z"
                  fill="#2D6A4F"
                />
                <path
                  d="M40 105 C60 70, 120 50, 160 30 C120 60, 80 85, 40 105 Z"
                  fill="#52B788"
                />
                <path
                  d="M80 80 C95 50, 140 40, 160 25 C130 50, 105 70, 80 80 Z"
                  fill="#74C69D"
                />
              </svg>
            </div>

            {/* Ceramic Coffee Cup with Latte Art */}
            <div className="relative z-10 w-28 sm:w-32 h-28 sm:h-32 rounded-full shadow-2xl p-1 bg-gradient-to-br from-stone-100 to-stone-300 ring-4 ring-amber-100/60 overflow-hidden flex items-center justify-center">
              <img
                src="/images/assets/admin_banner_cappuccino.png"
                onError={(e) => {
                  // Fallback to crisp coffee cup asset if subagent is still writing
                  (e.target as HTMLElement).style.display = 'none';
                }}
                alt="HONNE Coffee"
                className="w-full h-full object-cover rounded-full"
              />
              {/* Fallback Latte Art in SVG if image is loading */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#5C3D2E] to-[#3B2219] p-3 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-4 border-[#E6CCB2] flex items-center justify-center bg-[#4A2810]">
                  <span className="text-xl">☕</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ROW OF 4 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Tổng Doanh Thu */}
        <div className="bg-white rounded-3xl p-5 border border-[#EDE2D0] shadow-xs hover:border-[#103B27]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Tổng Doanh Thu
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
            </div>
          </div>

          <div className="text-2xl sm:text-[26px] font-black text-[#103B27] mt-2 tracking-tight font-mono">
            {formatCurrencyVND(metrics.monthRevenue || metrics.todayRevenue || 0)}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
            <span className="text-[11px] font-bold text-emerald-700 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12.5%{' '}
              <span className="text-stone-400 font-normal ml-1">so với kỳ trước</span>
            </span>

            {/* Mini Green Sparkline Wave */}
            <svg width="56" height="20" viewBox="0 0 70 24" fill="none">
              <path
                d="M2 18 C15 22, 25 8, 40 14 C55 20, 60 4, 68 2"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Tổng Đơn Hàng */}
        <div className="bg-white rounded-3xl p-5 border border-[#EDE2D0] shadow-xs hover:border-amber-400 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Tổng Đơn Hàng
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-amber-700" />
            </div>
          </div>

          <div className="text-2xl sm:text-[26px] font-black text-stone-900 mt-2 tracking-tight font-mono">
            {(metrics.totalOrders || orders.length || 0).toLocaleString()} đơn
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
            <span className="text-[11px] font-bold text-emerald-700 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +8.2%{' '}
              <span className="text-stone-400 font-normal ml-1">so với kỳ trước</span>
            </span>

            {/* Mini Orange Sparkline Wave */}
            <svg width="56" height="20" viewBox="0 0 70 24" fill="none">
              <path
                d="M2 20 C18 16, 28 22, 42 12 C52 4, 60 14, 68 6"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Khách Hàng */}
        <div className="bg-white rounded-3xl p-5 border border-[#EDE2D0] shadow-xs hover:border-teal-400 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Khách Hàng
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-emerald-700" />
            </div>
          </div>

          <div className="text-2xl sm:text-[26px] font-black text-stone-900 mt-2 tracking-tight font-mono">
            {(metrics.totalCustomers ?? 7).toLocaleString()} khách
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
            <span className="text-[11px] font-bold text-emerald-700 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +10.1%{' '}
              <span className="text-stone-400 font-normal ml-1">so với kỳ trước</span>
            </span>

            {/* Mini Emerald Sparkline Wave */}
            <svg width="56" height="20" viewBox="0 0 70 24" fill="none">
              <path
                d="M2 16 C20 18, 30 6, 45 10 C58 14, 62 4, 68 2"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Nhân Viên */}
        <div className="bg-white rounded-3xl p-5 border border-[#EDE2D0] shadow-xs hover:border-amber-700 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Nhân Viên
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-amber-900" />
            </div>
          </div>

          <div className="text-2xl sm:text-[26px] font-black text-stone-900 mt-2 tracking-tight font-mono">
            {(metrics.totalStaff ?? 10).toLocaleString()} nhân sự
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-500 flex items-center">
              <span className="text-stone-400 mr-1">↑</span> +0.0%{' '}
              <span className="text-stone-400 font-normal ml-1">so với kỳ trước</span>
            </span>

            {/* Mini Bronze Sparkline Wave */}
            <svg width="56" height="20" viewBox="0 0 70 24" fill="none">
              <path
                d="M2 14 C15 14, 30 14, 45 10 C55 8, 62 12, 68 10"
                stroke="#B45309"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION (3 CARDS): LINE CHART, DONUT CHART, PARTNER PROMO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Doanh Thu Theo Thời Gian Line Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-[#EDE2D0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#103B27]" />
                <span>Doanh Thu Theo Thời Gian</span>
              </h3>

              {/* Time Range Filter Pills */}
              <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setChartTimeRange('7')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    chartTimeRange === '7' ? 'bg-[#0A2618] text-white shadow-xs font-black' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  7 ngày
                </button>
                <button
                  onClick={() => setChartTimeRange('30')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    chartTimeRange === '30' ? 'bg-[#0A2618] text-white shadow-xs font-black' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  30 ngày
                </button>
                <button
                  onClick={() => setChartTimeRange('90')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    chartTimeRange === '90' ? 'bg-[#0A2618] text-white shadow-xs font-black' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  90 ngày
                </button>
                <button
                  onClick={() => setChartTimeRange('365')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    chartTimeRange === '365' ? 'bg-[#0A2618] text-white shadow-xs font-black' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  1 năm
                </button>
              </div>
            </div>

            {/* SVG Area Line Chart matching user mockup */}
            <div className="relative pt-6 pb-2">
              <svg viewBox="0 0 540 210" className="w-full h-48 sm:h-52 overflow-visible">
                <defs>
                  <linearGradient id="revenueGreenFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#103B27" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#103B27" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="520" y2="20" stroke="#F0EAE1" strokeDasharray="4 4" />
                <text x="5" y="24" fill="#A8A29E" fontSize="10" fontFamily="sans-serif">500K</text>

                <line x1="40" y1="60" x2="520" y2="60" stroke="#F0EAE1" strokeDasharray="4 4" />
                <text x="5" y="64" fill="#A8A29E" fontSize="10" fontFamily="sans-serif">350K</text>

                <line x1="40" y1="100" x2="520" y2="100" stroke="#F0EAE1" strokeDasharray="4 4" />
                <text x="5" y="104" fill="#A8A29E" fontSize="10" fontFamily="sans-serif">200K</text>

                <line x1="40" y1="140" x2="520" y2="140" stroke="#F0EAE1" strokeDasharray="4 4" />
                <text x="5" y="144" fill="#A8A29E" fontSize="10" fontFamily="sans-serif">100K</text>

                <line x1="40" y1="180" x2="520" y2="180" stroke="#E7DFD5" />
                <text x="20" y="184" fill="#A8A29E" fontSize="10" fontFamily="sans-serif">0đ</text>

                {/* Area Gradient */}
                <path
                  d="M40 150 C 80 135, 110 115, 150 120 C 180 130, 210 100, 240 95 C 270 90, 310 70, 350 65 C 380 80, 420 55, 460 50 C 490 55, 510 45, 520 40 L 520 180 L 40 180 Z"
                  fill="url(#revenueGreenFill)"
                />

                {/* Main Curve Line */}
                <path
                  d="M40 150 C 80 135, 110 115, 150 120 C 180 130, 210 100, 240 95 C 270 90, 310 70, 350 65 C 380 80, 420 55, 460 50 C 490 55, 510 45, 520 40"
                  fill="none"
                  stroke="#103B27"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="40" cy="150" r="3" fill="#103B27" />
                <circle cx="150" cy="120" r="3" fill="#103B27" />
                <circle cx="240" cy="95" r="3" fill="#103B27" />
                <circle cx="350" cy="65" r="4.5" fill="#103B27" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="460" cy="50" r="3" fill="#103B27" />
                <circle cx="520" cy="40" r="3" fill="#103B27" />
              </svg>

              {/* Tooltip Badge Pinned at Current Revenue */}
              <div className="absolute top-2 left-[56%] sm:left-[59%] -translate-x-1/2 bg-white px-2.5 py-1 rounded-xl shadow-lg border border-[#EDE2D0] text-center z-10 pointer-events-none">
                <div className="text-xs font-black text-[#103B27] font-mono leading-tight">
                  {formatCurrencyVND(metrics.todayRevenue || metrics.monthRevenue || 328000)}
                </div>
                <div className="text-[9px] text-stone-500 font-medium">
                  Hôm nay
                </div>
                {/* Small triangle arrow */}
                <div className="w-2 h-2 bg-white border-b border-r border-[#EDE2D0] rotate-45 mx-auto -mb-2 mt-0.5" />
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between px-6 text-[10px] font-mono text-stone-500 mt-2">
                <span>01/11</span>
                <span>07/11</span>
                <span>14/11</span>
                <span>21/11</span>
                <span>30/11</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Trạng Thái Đơn Hàng Donut Chart (3.5 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-[#EDE2D0] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2 pb-4 border-b border-stone-100">
              <ShoppingBag className="w-4 h-4 text-[#103B27]" />
              <span>Trạng Thái Đơn Hàng</span>
            </h3>

            {/* Donut Chart with Center Text & Legend */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#F5EFE6"
                    strokeWidth="12"
                  />
                  {/* Segment 1: Hoàn thành (#103B27) */}
                  {completedDonutPct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#103B27"
                      strokeWidth="12"
                      strokeDasharray={`${completedDash} ${circumference}`}
                      strokeDashoffset="0"
                    />
                  )}
                  {/* Segment 2: Đang xử lý (#F59E0B) */}
                  {processingDonutPct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="12"
                      strokeDasharray={`${processingDash} ${circumference}`}
                      strokeDashoffset={processingOffset}
                    />
                  )}
                  {/* Segment 3: Đã hủy (#EF4444) */}
                  {cancelledDonutPct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="12"
                      strokeDasharray={`${cancelledDash} ${circumference}`}
                      strokeDashoffset={cancelledOffset}
                    />
                  )}
                </svg>

                {/* Donut Center Count */}
                <div className="absolute text-center">
                  <div className="text-xl font-black text-stone-900 tracking-tight font-mono">
                    {orders.length || metrics.totalOrders || 0}
                  </div>
                  <div className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">
                    Đơn hàng
                  </div>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#103B27]" />
                  <span className="text-stone-700 font-bold">Hoàn thành</span>
                  <span className="font-mono font-black text-[#103B27] ml-auto">{completedDonutPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-stone-700 font-bold">Đang xử lý</span>
                  <span className="font-mono font-black text-amber-700 ml-auto">{processingDonutPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-stone-700 font-bold">Đã hủy</span>
                  <span className="font-mono font-black text-rose-700 ml-auto">{cancelledDonutPct}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Partner Promo Banner Card (2.5 Cols) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#FAF3E7] to-[#F1E5D1] rounded-3xl p-5 border border-[#EDE2D0] shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="z-10">
            <h3 className="font-black text-[#103B27] text-base leading-snug">
              Ưu đãi đặc biệt<br />cho đối tác
            </h3>
            <button
              onClick={() => onSelectTab('promotions')}
              className="mt-3.5 px-4 py-2 rounded-xl bg-[#0A2618] hover:bg-[#103B27] text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <span>Xem chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Iced Drink Studio Photo matching user mockup */}
          <div className="mt-4 flex justify-end relative z-10">
            <div className="w-32 h-36 relative flex items-center justify-center">
              <img
                src="/images/assets/admin_partner_iced_cup.png"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/3d_drinks/drink_coffee_muoi.png';
                }}
                alt="HONNE Iced Drink"
                className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition duration-300"
              />
            </div>
          </div>

          {/* Watermark leaf background */}
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-20 translate-x-4 translate-y-4">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
              <path d="M10 80 C40 40, 80 20, 100 0 C70 40, 40 70, 10 80 Z" fill="#103B27" />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: RECENT ORDERS TABLE & SYSTEM NOTIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Đơn Hàng Gần Đây Table (9 Cols) */}
        <div className="lg:col-span-9 bg-white rounded-3xl p-5 sm:p-6 border border-[#EDE2D0] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <List className="w-4 h-4 text-[#103B27]" />
              <span>Đơn Hàng Gần Đây</span>
            </h3>
            <button
              onClick={() => onSelectTab('orders')}
              className="text-xs font-bold text-[#103B27] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="text-stone-400 font-bold border-b border-stone-100">
                <tr>
                  <th className="py-3 px-3">#Đơn hàng</th>
                  <th className="py-3 px-3">Khách hàng</th>
                  <th className="py-3 px-3">Sản phẩm</th>
                  <th className="py-3 px-3">Tổng tiền</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {displayOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#103B27]">
                      #{o.id}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {o.customerName}
                    </td>
                    <td className="py-3 px-3 text-stone-700 font-medium truncate max-w-[180px]">
                      {o.productName}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-stone-900">
                      {formatCurrencyVND(o.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        o.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : o.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}>
                        {o.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {o.status === 'brewing' && <Clock className="w-3 h-3 text-amber-600" />}
                        {o.status === 'cancelled' && <XCircle className="w-3 h-3 text-rose-600" />}
                        <span>
                          {o.status === 'completed' ? 'Hoàn thành' : o.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-stone-500">
                      {o.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Thông Báo Hệ Thống Card (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-[#EDE2D0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#103B27]" />
                <span>Thông báo hệ thống</span>
              </h3>
              <span className="text-[10px] text-stone-400 font-medium">3 phút trước</span>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                </span>
                <p className="text-xs text-stone-700 font-medium leading-relaxed">
                  Đơn hàng <strong>#HN2487</strong> đã được xác nhận thanh toán qua VietQR.
                </p>
              </div>

              <div className="pt-1 text-right">
                <button
                  onClick={() => onSelectTab('orders')}
                  className="text-xs font-bold text-[#103B27] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded-lg bg-amber-100 text-amber-800 mt-0.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                </span>
                <p className="text-xs text-stone-700 font-medium leading-relaxed">
                  Ca sáng 183 Cộng Hòa chuẩn bị chốt sổ doanh thu và bàn giao nguyên liệu.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('orders')}
            className="w-full mt-4 py-3 rounded-2xl bg-[#0A2618] hover:bg-[#103B27] text-[#F5C518] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <span>Mở Bàn Điều Khiển POS Đơn Hàng</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
