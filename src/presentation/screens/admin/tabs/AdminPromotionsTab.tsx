import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Tag,
  Plus,
  Trash2,
  Calendar,
  Percent,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';
import { formatCurrencyVND } from '../../../../shared/utils/currency';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDeleteModal } from '../../../components/common/ConfirmDeleteModal';
import { authFetch, API_BASE_URL } from '../../../../shared/utils/api-client';

interface VoucherItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  used_count: number;
  usage_limit: number;
  valid_until?: string;
  is_active: number | boolean;
}

export const AdminPromotionsTab: React.FC = () => {
  const { showToast } = useToast();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add Voucher Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderValue, setMinOrderValue] = useState<number>(50000);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Modal State
  const [deletingVoucher, setDeletingVoucher] = useState<VoucherItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('honne_admin_token') || localStorage.getItem('honne_access_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const loadVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/vouchers`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVouchers(data.data);
      }
    } catch {
      showToast('Lỗi khi tải danh sách mã khuyến mãi từ D1', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleCreateVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      showToast('Vui lòng nhập mã và tiêu đề voucher!', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/vouchers`, {
        method: 'POST',
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          title: title.trim(),
          discountType,
          discountValue: Number(discountValue),
          minOrderValue: Number(minOrderValue),
          usageLimit: Number(usageLimit)
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã tạo mã khuyến mãi ${code.toUpperCase()} thành công!`, 'success');
        setShowAddModal(false);
        setCode('');
        setTitle('');
        await loadVouchers();
      } else {
        showToast(data.message || 'Lỗi khi tạo voucher', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ Cloudflare D1', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteVoucher = async () => {
    if (!deletingVoucher) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/vouchers/${deletingVoucher.code}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã xóa voucher ${deletingVoucher.code} khỏi Cloudflare D1!`, 'info');
        setVouchers((prev) => prev.filter((v) => v.code !== deletingVoucher.code));
        setDeletingVoucher(null);
      } else {
        showToast(data.message || 'Lỗi xóa voucher', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi xóa voucher', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-[#EDE2D0] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#103B27]" />
            <span>Mã Giảm Giá & Chiến Dịch Ưu Đãi</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Dữ liệu khuyến mãi lưu trữ trực tiếp Cloudflare D1 • Áp dụng tự động tại quầy và giỏ hàng trực tuyến
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadVouchers}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
            title="Làm mới từ D1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#103B27]' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#0A2618] hover:bg-[#103B27] text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#F5C518]" />
            <span>Tạo Voucher Mới</span>
          </button>
        </div>
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map((v) => (
          <div
            key={v.id || v.code}
            className="bg-white rounded-3xl p-5 border border-[#EDE2D0] shadow-xs flex flex-col justify-between group hover:border-[#103B27]/40 transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 font-mono font-black text-xs border border-amber-200">
                  {v.code}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Hoạt động
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-stone-900">{v.title}</h4>
              <p className="text-xs text-stone-500 mt-1">
                {v.discount_type === 'percentage'
                  ? `Giảm ${v.discount_value}% đơn từ ${formatCurrencyVND(v.min_order_value)}`
                  : `Giảm ${formatCurrencyVND(v.discount_value)} đơn từ ${formatCurrencyVND(v.min_order_value)}`}
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-mono text-stone-400">
                Đã dùng: <strong>{v.used_count || 0}</strong> / {v.usage_limit || 1000}
              </span>

              <button
                onClick={() => setDeletingVoucher(v)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Xóa voucher"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Voucher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-lg text-stone-900 mb-1">Tạo Mã Khuyến Mãi Mới</h3>
            <p className="text-xs text-stone-500 mb-5">Voucher sẽ lưu trực tiếp vào Cloudflare D1</p>

            <form onSubmit={handleCreateVoucherSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mã Voucher (Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HONNE30"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-900 uppercase focus:outline-hidden focus:border-[#103B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tiêu Đề Voucher *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giảm 30% Đồ Uống Mùa Hè"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#103B27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Loại Giảm Giá</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-hidden"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (₫)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Giá Trị Giảm</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:border-[#103B27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Đơn Tối Thiểu (₫)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Giới Hạn Lượt Dùng</label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-2xl bg-[#0A2618] hover:bg-[#103B27] text-[#F5C518] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Tạo Mã Vào D1</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Voucher Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingVoucher)}
        title="Xác Nhận Xóa Mã Khuyến Mãi"
        itemName={deletingVoucher ? `${deletingVoucher.code} - ${deletingVoucher.title}` : undefined}
        description="Mã ưu đãi này sẽ bị xóa vĩnh viễn khỏi Cloudflare D1 và không còn hiệu lực khi khách hàng nhập mã. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa Voucher"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDeleteVoucher}
        onClose={() => setDeletingVoucher(null)}
      />
    </div>
  );
};
