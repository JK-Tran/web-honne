import React from 'react';
import {
  ShieldCheck,
  Lock,
  Crown,
  UserCheck,
  Coffee,
  CheckCircle,
  XCircle,
  KeyRound
} from 'lucide-react';

export const AdminPermissionsTab: React.FC = () => {
  const roles = [
    {
      role: 'Super Admin (Ban Giám Đốc)',
      badge: 'Toàn quyền',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'Quản trị tối cao toàn bộ hệ sinh thái 4 chi nhánh Tân Bình, tạo tài khoản quản lý và xem báo cáo tài chính P&L.',
      permissions: [
        'Toàn quyền tạo/xóa tài khoản nhân sự & quản lý',
        'Xem và can thiệp sổ thu chi, lợi nhuận ròng toàn hệ thống',
        'Thay đổi bảng giá menu và chính sách chiết khấu',
        'Bật/tắt bảo mật và phân quyền API Workers'
      ]
    },
    {
      role: 'Cửa Hàng Trưởng (Store Manager)',
      badge: 'Quản lý điểm bán',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'Phụ trách 1 chi nhánh (183 Cộng Hòa, 2 Quách Văn Tuấn, 121 Cộng Hòa hoặc 22A Cộng Hòa).',
      permissions: [
        'Tiếp nhận, xử lý và hủy đơn hàng của chi nhánh phụ trách',
        'Bật/tắt trạng thái món khi hết nguyên liệu tại quán',
        'Ghi nhận chi phí mua sắm nguyên vật liệu phụ trong ca',
        'Xem báo cáo doanh số ca của chi nhánh phụ trách'
      ]
    },
    {
      role: 'Barista (Pha Chế)',
      badge: 'Vận hành quầy',
      color: 'bg-sky-100 text-sky-900 border-sky-300',
      description: 'Chuyên trách quầy pha chế, màn hình Kitchen Display (KDS).',
      permissions: [
        'Xem danh sách đơn món chờ pha chế theo thời gian thực',
        'Chuyển trạng thái đơn sang "Đang pha chế" & "Đã pha xong"',
        'In phiếu bill chế biến (K80)',
        'Xem công thức và định lượng định mức món'
      ]
    },
    {
      role: 'Thu Ngân / Shipper (Cashier / Delivery)',
      badge: 'Bán hàng & Giao nhận',
      color: 'bg-stone-200 text-stone-800 border-stone-300',
      description: 'Thu tiền mặt COD, kiểm tra mã VietQR và giao thức uống đến tận tay khách.',
      permissions: [
        'Xác nhận đã thu tiền đơn hàng COD',
        'Cập nhật tiến trình shipper đang di chuyển giao hàng',
        'Báo hoàn tất đơn hàng giao thành công'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs">
        <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#103B27]" />
          <span>Ma Trận Phân Quyền Hệ Thống (RBAC Matrix)</span>
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Cơ chế phân quyền nhiều lớp bảo vệ toàn vẹn dữ liệu kinh doanh và quy trình vận hành quán
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {roles.map((r, i) => (
            <div key={i} className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200/80 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-stone-900">{r.role}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${r.color}`}>
                    {r.badge}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">{r.description}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-stone-200/60">
                <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
                  Quyền Hạn Cho Phép
                </span>
                {r.permissions.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
