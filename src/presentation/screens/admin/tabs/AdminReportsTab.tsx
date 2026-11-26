import React from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Flame,
  Clock,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { formatCurrencyVND } from '../../../../shared/utils/currency';

export const AdminReportsTab: React.FC = () => {
  const cogsBreakdown = [
    { item: 'Hạt Robusta Tây Nguyên Mộc (100% tự nhiên)', cost: 42500000, percent: 28.5 },
    { item: 'Sữa tươi thanh trùng DalatMilk & Sữa đặc', cost: 35800000, percent: 24.0 },
    { item: 'Ly giấy, nắp cầu, ống hút giấy & túi mang đi', cost: 22400000, percent: 15.0 },
    { item: 'Đá viên tinh khiết & siro đào/cam sả', cost: 16800000, percent: 11.3 },
    { item: 'Chi phí nhân sự pha chế & phục vụ ca', cost: 31488000, percent: 21.2 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#103B27]" />
            <span>Báo Cáo Hoạt Động & Chi Phí Sản Xuất F&B</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Phân tích tỷ trọng giá vốn hàng bán (COGS), hao hụt nguyên vật liệu và biên lợi nhuận
          </p>
        </div>

        <button className="px-4 py-2.5 rounded-2xl bg-[#0A2618] text-[#F5C518] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs">
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel</span>
        </button>
      </div>

      {/* COGS Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs space-y-4">
        <h3 className="font-extrabold text-stone-900 text-base">Cơ Cấu Giá Vốn Hàng Bán (COGS Chi Tiết)</h3>
        <p className="text-xs text-stone-500">Tổng chi phí định mức theo 1,248 đơn hàng trong tháng</p>

        <div className="space-y-3 pt-2">
          {cogsBreakdown.map((row, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-stone-900 truncate">{row.item}</h4>
                  <span className="font-mono font-black text-xs text-stone-900">{formatCurrencyVND(row.cost)}</span>
                </div>
                <div className="mt-1.5 w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#103B27] h-full rounded-full" style={{ width: `${row.percent * 2.5}%` }} />
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                {row.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
