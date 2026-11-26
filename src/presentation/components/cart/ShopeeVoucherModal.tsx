import React, { useState } from 'react';
import { X, Check, AlertCircle, Tag, Clock, ArrowRight, ShieldCheck, Lock, User, Plus } from 'lucide-react';
import { formatCurrencyVND } from '../../../shared/utils/currency';
import { useAuth } from '../../context/AuthContext';

export interface VoucherOption {
  code: string;
  title: string;
  description: string;
  badge: string;
  discountDisplay: string;
  minOrder: number;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  validTo: string;
  requireMember?: boolean;
}

export const AVAILABLE_VOUCHERS: VoucherOption[] = [
  {
    code: 'HONNE20',
    title: 'Giảm 20% Cho Bạn Mới',
    description: 'Áp dụng cho đơn hàng đầu tiên trải nghiệm HONNE, tối đa 40.000đ',
    badge: 'BẠN MỚI',
    discountDisplay: 'GIẢM 20%',
    discountType: 'percent',
    discountValue: 20,
    maxDiscount: 40000,
    minOrder: 49000,
    validTo: '31/12/2026',
    requireMember: true
  },
  {
    code: 'FREESHIP',
    title: 'Miễn Phí Giao Hàng Toàn Tân Bình',
    description: 'Freeship tối đa 25.000đ cho đơn hàng từ 99.000đ',
    badge: 'FREESHIP',
    discountDisplay: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 25000,
    minOrder: 99000,
    validTo: '31/12/2026'
  },
  {
    code: 'HONNE30K',
    title: 'Giảm 30.000đ Đơn Từ 149K',
    description: 'Áp dụng cho mọi thức uống cà phê và trà từ 149.000đ',
    badge: 'ĐƠN TỪ 149K',
    discountDisplay: 'GIẢM 30K',
    discountType: 'fixed',
    discountValue: 30000,
    minOrder: 149000,
    validTo: '30/11/2026'
  },
  {
    code: 'HONNE50K',
    title: 'Giảm 50.000đ Tiệc Trà Đơn Từ 249K',
    description: 'Ưu đãi đặt nhóm văn phòng hoặc gia đình từ 249.000đ',
    badge: 'TIỆC TRÀ NHÓM',
    discountDisplay: 'GIẢM 50K',
    discountType: 'fixed',
    discountValue: 50000,
    minOrder: 249000,
    validTo: '30/11/2026'
  },
  {
    code: 'HONNEVIP50',
    title: 'Giảm 50% Đặc Quyền Điểm Danh 7 Ngày',
    description: 'Quà tri ân khách hàng điểm danh chăm chỉ liên tiếp 7 ngày',
    badge: 'ĐẶC QUYỀN VIP',
    discountDisplay: 'GIẢM 50%',
    discountType: 'percent',
    discountValue: 50,
    maxDiscount: 50000,
    minOrder: 60000,
    validTo: '31/12/2026',
    requireMember: true
  }
];

interface ShopeeVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  currentVoucherCode?: string;
  onApplyVoucher: (code: string) => void;
  onRemoveVoucher: () => void;
}

export const ShopeeVoucherModal: React.FC<ShopeeVoucherModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  currentVoucherCode,
  onApplyVoucher,
  onRemoveVoucher
}) => {
  const { user, isAuthenticated, openAuthModal, claimVoucher } = useAuth();
  const [activeTab, setActiveTab] = useState<'wallet' | 'all'>('wallet');
  const [inputCode, setInputCode] = useState('');
  const [selectedCode, setSelectedCode] = useState<string>(currentVoucherCode || '');
  const [customError, setCustomError] = useState<string>('');

  if (!isOpen) return null;

  // Filter vouchers belonging to the user's wallet
  const userWalletCodes = user?.savedVouchers || [];
  const walletVouchers = AVAILABLE_VOUCHERS.filter((v) =>
    userWalletCodes.includes(v.code)
  );

  const displayedVouchers =
    activeTab === 'wallet' && isAuthenticated ? walletVouchers : AVAILABLE_VOUCHERS;

  const handleApplyInput = () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      setCustomError('Vui lòng nhập mã voucher!');
      return;
    }

    const matched = AVAILABLE_VOUCHERS.find((v) => v.code === code);
    if (!matched) {
      setCustomError(`Mã "${code}" không tồn tại hoặc đã hết hạn.`);
      return;
    }

    if (matched.requireMember && !isAuthenticated) {
      setCustomError(`Mã "${code}" chỉ dành cho thành viên đã đăng nhập.`);
      return;
    }

    if (subtotal < matched.minOrder) {
      const diff = matched.minOrder - subtotal;
      setCustomError(`Đơn hàng chưa đạt tối thiểu ${formatCurrencyVND(matched.minOrder)}. Cần mua thêm ${formatCurrencyVND(diff)}.`);
      return;
    }

    setSelectedCode(code);
    setCustomError('');
    setInputCode('');
  };

  const handleConfirm = () => {
    if (selectedCode) {
      onApplyVoucher(selectedCode);
    } else {
      onRemoveVoucher();
    }
    onClose();
  };

  // Calculate discount estimate for currently selected voucher
  const selectedVoucher = AVAILABLE_VOUCHERS.find((v) => v.code === selectedCode);
  let estimatedDiscount = 0;
  if (selectedVoucher && subtotal >= selectedVoucher.minOrder) {
    if (selectedVoucher.discountType === 'percent') {
      estimatedDiscount = (subtotal * selectedVoucher.discountValue) / 100;
      if (selectedVoucher.maxDiscount) {
        estimatedDiscount = Math.min(estimatedDiscount, selectedVoucher.maxDiscount);
      }
    } else {
      estimatedDiscount = selectedVoucher.discountValue;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#14452F] text-amber-400 flex items-center justify-center text-lg">
              🎟️
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">HONNE Voucher</h3>
              <p className="text-xs text-stone-500">Chỉ chọn áp dụng 01 mã ưu đãi cho đơn hàng này</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Voucher Code Box */}
        <div className="p-4 bg-amber-50/50 border-b border-amber-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã voucher khác..."
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setCustomError('');
              }}
              className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-semibold tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-[#14452F]"
            />
            <button
              onClick={handleApplyInput}
              className="px-5 py-2.5 bg-[#14452F] hover:bg-[#153e28] text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Áp dụng
            </button>
          </div>
          {customError && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{customError}</span>
            </div>
          )}
        </div>

        {/* Tab Selection: Ví Voucher Của Bạn vs Tất Cả */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'wallet'
                ? 'border-[#14452F] text-[#14452F]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Ví voucher của bạn</span>
            {isAuthenticated && (
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[10px]">
                {walletVouchers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'border-[#14452F] text-[#14452F]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Tất cả voucher ({AVAILABLE_VOUCHERS.length})</span>
          </button>
        </div>

        {/* Vouchers List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* Prompt if user is on wallet tab but not logged in */}
          {activeTab === 'wallet' && !isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-lg">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">Đăng nhập để xem Kho Voucher của bạn</h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                Các mã bạn đã nhận hoặc quà tặng thành viên sẽ được lưu an toàn tại đây.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal();
                }}
                className="px-5 py-2 rounded-xl bg-[#14452F] text-amber-400 font-bold text-xs"
              >
                Đăng nhập ngay (+500 Xu)
              </button>
            </div>
          )}

          {displayedVouchers.map((voucher) => {
            const isEligible = subtotal >= voucher.minOrder;
            const isSelected = selectedCode === voucher.code;
            const diffAmount = voucher.minOrder - subtotal;
            const isSaved = user?.savedVouchers.includes(voucher.code);

            return (
              <div
                key={voucher.code}
                onClick={() => {
                  if (isEligible) {
                    if (isSelected) {
                      setSelectedCode('');
                    } else {
                      setSelectedCode(voucher.code);
                    }
                  }
                }}
                className={`relative flex items-stretch border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isEligible
                    ? isSelected
                      ? 'border-[#14452F] bg-amber-50/40 ring-2 ring-[#14452F] cursor-pointer shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-400 cursor-pointer'
                    : 'border-stone-200 bg-stone-100/70 opacity-70 cursor-not-allowed'
                }`}
              >
                {/* Left Ticket Stub */}
                <div
                  className={`w-24 sm:w-28 flex flex-col items-center justify-center p-3 text-center border-r border-dashed ${
                    isEligible
                      ? 'bg-gradient-to-br from-[#14452F] to-[#1c472d] text-white'
                      : 'bg-stone-300 text-stone-600'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 mb-1">
                    {voucher.badge}
                  </span>
                  <span className="font-black text-sm sm:text-base leading-tight text-amber-300">
                    {voucher.discountDisplay}
                  </span>
                </div>

                {/* Right Info Content with Detailed Conditions */}
                <div className="flex-1 p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm leading-snug">
                          {voucher.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {voucher.code}
                          </span>
                          {voucher.maxDiscount && (
                            <span className="text-[10px] text-stone-500 font-medium">
                              (Tối đa {formatCurrencyVND(voucher.maxDiscount)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Radio Circle */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[#14452F] bg-[#14452F] text-amber-400'
                            : isEligible
                            ? 'border-stone-300 hover:border-stone-500'
                            : 'border-stone-200 bg-stone-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                      {voucher.description}
                    </p>
                  </div>

                  {/* Explicit Condition & Real-Time Qualification Status */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-col gap-1 text-[11px]">
                    <div className="flex items-center justify-between text-stone-500">
                      <span>Đơn tối thiểu: <strong>{formatCurrencyVND(voucher.minOrder)}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> HSD: {voucher.validTo}
                      </span>
                    </div>

                    {isEligible ? (
                      <div className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>Đủ điều kiện áp dụng cho đơn này</span>
                      </div>
                    ) : (
                      <div className="text-red-600 font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>
                          Mua thêm <strong>{formatCurrencyVND(diffAmount)}</strong> để dùng mã này
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-stone-500">
              {selectedCode ? (
                <>Đã chọn: <span className="font-mono font-bold text-stone-900">{selectedCode}</span></>
              ) : (
                'Chưa chọn voucher nào'
              )}
            </div>
            {estimatedDiscount > 0 && (
              <div className="text-sm font-bold text-emerald-700">
                Tiết kiệm: -{formatCurrencyVND(estimatedDiscount)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedCode && (
              <button
                type="button"
                onClick={() => setSelectedCode('')}
                className="px-3.5 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                Bỏ chọn
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-[#14452F] hover:bg-[#153e28] text-amber-400 font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Đồng ý</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
