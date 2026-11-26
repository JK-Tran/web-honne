import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Coffee,
  Clock,
  ArrowUpRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Award,
  Flame,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { formatCurrencyVND } from '../../../../shared/utils/currency';

interface AdminOverviewTabProps {
  metrics: {
    todayRevenue: number;
    monthRevenue: number;
    todayOrders: number;
    totalOrders: number;
    totalCustomers?: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
    profitMarginPercent: number;
    avgOrderValue: number;
    fulfillmentRate?: number;
  };
  orders: any[];
  onSelectTab: (tab: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
}

// 4 Tan Binh branches data
const BRANCH_METRICS = [
  {
    id: 'branch-183-cong-hoa',
    name: 'HONNE 183 Cộng Hòa',
    address: '183/12 Cộng Hòa, P.12, Tân Bình',
    manager: 'Trần Minh Quân',
    phone: '0379 467 986',
    status: 'online',
    shift: 'Ca sáng (06:30 - 14:30)',
    todayOrders: 42,
    todayRevenue: 2150000,
    targetRevenue: 2500000,
    peakHour: '08:00 - 09:30'
  },
  {
    id: 'branch-2-quach-van-tuan',
    name: 'HONNE Số 2 Quách Văn Tuấn',
    address: 'Số 2 Quách Văn Tuấn, P.12, Tân Bình',
    manager: 'Lê Hoàng Long',
    phone: '0909 183 183',
    status: 'online',
    shift: 'Ca sáng (06:30 - 14:30)',
    todayOrders: 35,
    todayRevenue: 1780000,
    targetRevenue: 2000000,
    peakHour: '11:30 - 13:00'
  },
  {
    id: 'branch-121-cong-hoa',
    name: 'HONNE 121 Cộng Hòa',
    address: '121 Cộng Hòa, P.12, Tân Bình',
    manager: 'Nguyễn Thị Hương',
    phone: '0908 765 432',
    status: 'online',
    shift: 'Ca sáng (06:30 - 14:30)',
    todayOrders: 28,
    todayRevenue: 1420000,
    targetRevenue: 1800000,
    peakHour: '07:30 - 09:00'
  },
  {
    id: 'branch-22a-cong-hoa',
    name: 'HONNE 22A Cộng Hòa (HONNE 3)',
    address: '22A Cộng Hòa, P.4, Tân Bình',
    manager: 'Đỗ Tiến Đạt',
    phone: '0903 112 233',
    status: 'online',
    shift: 'Ca sáng (06:30 - 14:30)',
    todayOrders: 48,
    todayRevenue: 2450000,
    targetRevenue: 2500000,
    peakHour: '12:00 - 13:30'
  }
];

// Hourly sales pattern in Tan Binh
const HOURLY_SALES = [
  { hour: '06:30', cups: 18, revenue: 450000, peak: false, tag: 'Mở ca' },
  { hour: '07:30', cups: 45, revenue: 1125000, peak: true, tag: 'Cao điểm sáng' },
  { hour: '09:00', cups: 38, revenue: 950000, peak: true, tag: 'Văn phòng' },
  { hour: '10:30', cups: 22, revenue: 580000, peak: false, tag: 'Giữa ca' },
  { hour: '11:45', cups: 52, revenue: 1456000, peak: true, tag: 'Cao điểm trưa' },
  { hour: '13:30', cups: 30, revenue: 810000, peak: false, tag: 'Sau trưa' },
  { hour: '15:30', cups: 36, revenue: 980000, peak: true, tag: 'Trà chiều' },
  { hour: '17:30', cups: 25, revenue: 650000, peak: false, tag: 'Tan tầm' },
  { hour: '19:30', cups: 20, revenue: 520000, peak: false, tag: 'Ca tối' }
];

// Top Best Sellers Leaderboard
const TOP_PRODUCTS = [
  {
    id: 'cf-muoi',
    name: 'Cà phê Muối Biển Macchiato',
    category: 'Cà phê rang mộc',
    image: 'https://api-honne.hanhan02102012.workers.dev/api/images/drink_coffee_muoi.png',
    cups: 68,
    revenue: 2380000,
    percent: 32,
    badge: 'Best Seller #1'
  },
  {
    id: 'tra-dao',
    name: 'Trà Đào Cam Sả Tươi',
    category: 'Trà trái cây tươi',
    image: 'https://api-honne.hanhan02102012.workers.dev/api/images/drink_tra_traicay.png',
    cups: 52,
    revenue: 1456000,
    percent: 24,
    badge: 'Bán chạy #2'
  },
  {
    id: 'cf-sua',
    name: 'Cà phê Sữa Đá Sài Gòn',
    category: 'Cà phê rang mộc',
    image: 'https://api-honne.hanhan02102012.workers.dev/api/images/drink_coffee_muoi.png',
    cups: 45,
    revenue: 990000,
    percent: 18,
    badge: 'Bán chạy #3'
  },
  {
    id: 'cacao-kem',
    name: 'Cacao Đắk Lắk Macchiato',
    category: 'Cacao Đắk Lắk',
    image: 'https://api-honne.hanhan02102012.workers.dev/api/images/drink_cacao.png',
    cups: 38,
    revenue: 1064000,
    percent: 15,
    badge: 'Hot Trend'
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte Yến Mạch Nhật Bản',
    category: 'Matcha Nhật Bản',
    image: 'https://api-honne.hanhan02102012.workers.dev/api/images/drink_matcha.png',
    cups: 32,
    revenue: 1120000,
    percent: 11,
    badge: 'VIP Member'
  }
];

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  metrics,
  orders,
  onSelectTab,
  selectedBranch,
  setSelectedBranch
}) => {
  const maxHourlyRevenue = Math.max(...HOURLY_SALES.map((h) => h.revenue));

  return (
    <div className="space-y-6">
      {/* 1. TOP EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh Thu Hôm Nay */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-[#14452F]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Doanh Thu Hôm Nay
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-[#14452F]">
              <DollarSign className="w-4 h-4 text-[#14452F]" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#14452F] mt-2 tracking-tight">
            {formatCurrencyVND(metrics.todayRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +18.4%
            </span>
            <span className="text-[11px] text-stone-500 font-medium">so với cùng kỳ hôm qua</span>
          </div>
          <div className="mt-3 w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#14452F] h-full rounded-full" style={{ width: '84%' }} />
          </div>
        </div>

        {/* Số Đơn & Tỷ Lệ Hoàn Tất */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-amber-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Đơn Hàng Hôm Nay
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-800">
              <ShoppingBag className="w-4 h-4 text-amber-700" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 tracking-tight">
            {metrics.todayOrders || 153}{' '}
            <span className="text-xs font-bold text-stone-400 font-normal">đơn</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 mr-0.5" /> 98.4%
            </span>
            <span className="text-[11px] text-stone-500 font-medium">hoàn tất đúng giờ (TB 4.2p)</span>
          </div>
          <div className="mt-3 w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Giá Trị Đơn Trung Bình (AOV) */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Giá Trị Đơn TB (AOV)
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-800">
              <TrendingUp className="w-4 h-4 text-blue-700" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 tracking-tight">
            {formatCurrencyVND(metrics.avgOrderValue || 54000)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              +6.2%
            </span>
            <span className="text-[11px] text-stone-500 font-medium">nhờ upsell Topping & Size L</span>
          </div>
          <div className="mt-3 w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Lợi Nhuận Ròng Ước Tính */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Lợi Nhuận Ròng (Net)
            </span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-2 tracking-tight">
            {formatCurrencyVND(metrics.netProfit || 18200000)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] font-bold text-stone-700">
              Biên LN: <strong className="text-emerald-700 font-black">{metrics.profitMarginPercent || 65}%</strong>
            </span>
            <span className="text-[11px] text-stone-400 font-medium">• COGS minh bạch</span>
          </div>
          <div className="mt-3 w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '65%' }} />
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: HOURLY SALES CHART & BEST SELLERS LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hourly Sales Visual Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#14452F]" />
                  <span>Phân Bổ Doanh Thu Theo Khung Giờ (Tân Bình)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Thống kê lượng ly & doanh thu ca sáng, trưa văn phòng, và trà chiều
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live: Ca Đang Hoạt Động
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {HOURLY_SALES.map((item, idx) => {
                  const heightPercent = Math.round((item.revenue / maxHourlyRevenue) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 bg-stone-900 text-white text-[10px] py-1.5 px-2.5 rounded-xl shadow-xl whitespace-nowrap">
                        <div className="font-bold">{item.tag} ({item.hour})</div>
                        <div className="text-amber-300 font-mono font-black">{formatCurrencyVND(item.revenue)}</div>
                        <div className="text-stone-300">{item.cups} ly đã pha chế</div>
                      </div>

                      {/* Bar Value on top of peak bars */}
                      {item.peak && (
                        <span className="text-[10px] font-black text-[#14452F] mb-1 font-mono hidden sm:block">
                          {Math.round(item.revenue / 1000)}k
                        </span>
                      )}

                      {/* Animated Bar */}
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          item.peak
                            ? 'bg-gradient-to-t from-[#0B281A] to-[#16462D] group-hover:to-amber-500 shadow-md'
                            : 'bg-stone-200 group-hover:bg-[#14452F]/70'
                        }`}
                        style={{ height: `${Math.max(heightPercent, 12)}%` }}
                      />

                      {/* Hour label */}
                      <span className={`text-[11px] font-bold mt-2 font-mono ${
                        item.peak ? 'text-[#14452F]' : 'text-stone-500'
                      }`}>
                        {item.hour}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Highlights Footer */}
          <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-stone-50">
              <div className="text-[11px] text-stone-500 font-bold uppercase">Peak Sáng (07h-09h)</div>
              <div className="text-sm font-black text-[#14452F] mt-0.5">83 ly cà phê rang mộc</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-stone-50">
              <div className="text-[11px] text-stone-500 font-bold uppercase">Peak Trưa (11h-13h)</div>
              <div className="text-sm font-black text-amber-700 mt-0.5">74 ly trà trái cây & cacao</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-stone-50">
              <div className="text-[11px] text-stone-500 font-bold uppercase">Peak Chiều (15h-17h)</div>
              <div className="text-sm font-black text-emerald-800 mt-0.5">36 ly combo bánh nước</div>
            </div>
          </div>
        </div>

        {/* Right: Best Sellers Leaderboard (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Top 5 Món Bán Chạy Nhất</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Thống kê đồ uống đóng góp doanh thu lớn nhất</p>
              </div>
              <button
                onClick={() => onSelectTab('products')}
                className="text-xs font-bold text-[#14452F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Thực đơn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 mt-2">
              {TOP_PRODUCTS.map((prod, idx) => (
                <div key={prod.id} className="py-3 flex items-center gap-3 group">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                    idx === 0 ? 'bg-[#F5C518] text-[#103B27] shadow-sm' :
                    idx === 1 ? 'bg-stone-200 text-stone-700' :
                    idx === 2 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {idx + 1}
                  </span>

                  <div className="w-11 h-11 rounded-xl bg-stone-50 p-1 border border-stone-100 shrink-0 flex items-center justify-center overflow-hidden">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-stone-900 truncate group-hover:text-[#14452F] transition">
                        {prod.name}
                      </h4>
                      <span className="text-xs font-mono font-black text-[#14452F] shrink-0">
                        {formatCurrencyVND(prod.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-stone-500 font-medium">
                        {prod.cups} ly đã bán
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        {prod.percent}% tổng bán
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-[#14452F] h-full rounded-full"
                        style={{ width: `${prod.percent * 2.8}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-900">
                Cà phê Muối Biển đạt kỷ lục 68 ly trong ngày
              </span>
            </div>
            <span className="text-[11px] font-black text-[#14452F] bg-white px-2 py-0.5 rounded-lg border border-amber-200">
              #1 Drink
            </span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: 4 TAN BINH BRANCHES MATRIX & RECENT LIVE FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4 Tân Bình Branches Live Performance (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#14452F]" />
                <span>Hiệu Suất Vận Hành 4 Chi Nhánh Tân Bình</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Giám sát trực tiếp doanh số, ca trực và tải đơn của từng điểm bán
              </p>
            </div>
            <span className="text-xs font-bold text-stone-500">
              Chỉ tiêu ngày: <strong>8.800.000đ</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {BRANCH_METRICS.map((branch) => {
              const progress = Math.min(100, Math.round((branch.todayRevenue / branch.targetRevenue) * 100));
              const isSelected = selectedBranch === branch.id;

              return (
                <div
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#14452F] bg-[#F4F8F5] shadow-xs'
                      : 'border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <h4 className="font-bold text-sm text-stone-900">{branch.name}</h4>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{branch.address}</p>
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded-lg border border-stone-200 shrink-0">
                      {branch.todayOrders} đơn
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] text-stone-500 font-medium">Doanh thu hôm nay</div>
                      <div className="text-lg font-black text-[#14452F]">
                        {formatCurrencyVND(branch.todayRevenue)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-emerald-700">Đạt {progress}%</div>
                      <div className="text-[11px] text-stone-400">Target: {Math.round(branch.targetRevenue / 1000000)}tr</div>
                    </div>
                  </div>

                  <div className="mt-2 w-full bg-stone-200/70 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#14452F] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200/50 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Quản lý: <strong>{branch.manager}</strong></span>
                    <span className="text-amber-700 font-semibold">{branch.shift}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Real-Time Order Stream (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#14452F]" />
                  <span>Đơn Hàng Gần Nhất</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Cập nhật liên tục từ khách hàng</p>
              </div>
              <button
                onClick={() => onSelectTab('orders')}
                className="text-xs font-bold text-[#14452F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 mt-2 space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="pt-2 pb-1 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs text-[#14452F]">
                        #{order.id?.slice(-8) || order.id}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'shipping' ? 'bg-sky-100 text-sky-800' :
                        order.status === 'brewing' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {order.status === 'completed' ? 'Hoàn tất' :
                         order.status === 'shipping' ? 'Đang giao' :
                         order.status === 'brewing' ? 'Pha chế' : 'Mới'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-stone-800 mt-0.5">
                      {order.customer?.name || 'Khách vãng lai'}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {order.items?.length || 1} món • {order.branchName || 'HONNE 183 Cộng Hòa'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-black text-[#14452F]">
                      {formatCurrencyVND(order.finalTotal || 45000)}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {order.orderMode === 'pickup' ? 'Lấy tại quầy' : 'Giao tận nơi'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTab('orders')}
            className="w-full mt-4 py-3 rounded-2xl bg-[#0B281A] hover:bg-[#14452F] text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <span>Mở Bàn Điều Khiển POS Đơn Hàng</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
