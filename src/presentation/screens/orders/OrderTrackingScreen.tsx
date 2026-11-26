import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Coffee,
  Bike,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  QrCode,
  Check,
  FileText,
  Store,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrencyVND } from '../../../shared/utils/currency';
import { useToast } from '../../context/ToastContext';
import { OrderInvoiceModal } from '../../components/orders/OrderInvoiceModal';
import { OrderReviewModal } from '../../components/orders/OrderReviewModal';

const API_BASE_URL = 'https://api-honne.hanhan02102012.workers.dev/api';

export const OrderTrackingScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const paymentSuccess = searchParams.get('payment') === 'success';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<any>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (paymentSuccess) {
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
      showToast('🎉 Thanh toán qua Cổng SePay thành công! Đơn hàng đã được xác nhận tự động.', 'success');
    }
  }, [paymentSuccess]);

  const fetchTracking = async () => {
    if (!id) return;
    try {
      // Query trực tiếp từ Cloudflare D1 Database
      const res = await fetch(`${API_BASE_URL}/orders/${id}/track`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data.order);
      } else {
        setOrder(null);
      }
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();

    // Dừng polling nếu đơn hàng đã hoàn tất hoặc đã bị hủy
    if (order?.status === 'delivered' || order?.status === 'cancelled') {
      return;
    }

    // Polling thông minh mỗi 10s (chỉ chạy khi tab đang mở)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchTracking();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [id, order?.status]);

  // Load VietQR info if unpaid
  useEffect(() => {
    if (order && order.paymentMethod === 'vietqr' && order.paymentStatus !== 'paid' && !qrData) {
      fetch(`${API_BASE_URL}/payments/vietqr/${order.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setQrData(data.data);
          }
        })
        .catch(() => {});
    }
  }, [order?.id, order?.paymentMethod, order?.paymentStatus, qrData]);

  const handleManualConfirmPayment = async () => {
    if (!order) return;
    setCheckingPayment(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      });
      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, paymentStatus: 'paid', status: 'brewing' });
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch {}
        showToast('Thanh toán thành công! Barista đang pha chế thức uống cho bạn.', 'success');
      }
    } catch {
      showToast('Đang kiểm tra giao dịch chuyển khoản...', 'info');
    } finally {
      setCheckingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#14452F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-500 font-medium text-xs">Đang tải trạng thái đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border border-stone-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-stone-800">Không tìm thấy đơn #{id}</h2>
          <Link
            to="/san-pham"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14452F] text-white font-semibold text-xs"
          >
            Quay lại thực đơn
          </Link>
        </div>
      </div>
    );
  }

  // Calculate current stage step
  let currentStep = 1;
  if (order.status === 'confirmed') currentStep = 1;
  else if (order.status === 'brewing') currentStep = 2;
  else if (order.status === 'shipping') currentStep = 3;
  else if (order.status === 'completed') currentStep = 4;

  const isPickup = order.orderMode === 'pickup';
  const pickupCode = order.pickupCode || order.id?.slice(-4) || '8924';
  const branchName = order.branchName || 'HONNE 183 Cộng Hòa';

  return (
    <div className="min-h-screen bg-[#F9F9F8] py-5 sm:py-8 px-3 sm:px-6 lg:px-8 w-full overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-1">
          <Link
            to="/lich-su-don-hang"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả đơn hàng</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInvoiceModal(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold transition shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-stone-600" />
              <span>In Hóa Đơn / Bill</span>
            </button>
            <span className="text-[11px] text-stone-400 hidden sm:flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-[#14452F]" /> Trực tiếp
            </span>
          </div>
        </div>

        {/* Unified Hero Tracking Card */}
        <div className="bg-[#14452F] rounded-2xl p-5 sm:p-7 text-white shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold mb-1.5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  {currentStep === 1 && 'Đã nhận đơn'}
                  {currentStep === 2 && 'Đang pha chế tại quầy'}
                  {currentStep === 3 && 'Đang giao hàng siêu tốc'}
                  {currentStep === 4 && 'Đã giao thành công'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Đơn hàng #{order.id}
              </h1>
              <p className="text-xs text-stone-300 mt-0.5">
                Chi nhánh tiếp nhận: {branchName}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-stone-300 block">Dự kiến nhận món</span>
              <span className="text-lg sm:text-xl font-bold text-amber-300">
                {currentStep === 4 ? 'Đã nhận' : '15 - 20 phút'}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="pt-2 pb-2">
            <div className="grid grid-cols-4 gap-2 text-center relative z-10">
              {/* Step 1: Confirmed */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep >= 1
                      ? 'bg-amber-400 text-[#14452F] shadow-xs'
                      : 'bg-white/10 text-stone-400'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold mt-2 text-white">Đã nhận</span>
                <span className="text-[10px] text-stone-300 hidden sm:block">Chi nhánh xác nhận</span>
              </div>

              {/* Step 2: Brewing */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep >= 2
                      ? 'bg-amber-400 text-[#14452F] shadow-xs'
                      : 'bg-white/10 text-stone-400'
                  }`}
                >
                  <Coffee className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold mt-2 text-white">Pha chế</span>
                <span className="text-[10px] text-stone-300 hidden sm:block">Giữ lạnh, đá riêng</span>
              </div>

              {/* Step 3: Shipping */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep >= 3
                      ? 'bg-amber-400 text-[#14452F] shadow-xs'
                      : 'bg-white/10 text-stone-400'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold mt-2 text-white">Giao hàng</span>
                <span className="text-[10px] text-stone-300 hidden sm:block">Nhân viên quán giao</span>
              </div>

              {/* Step 4: Completed */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep >= 4
                      ? 'bg-emerald-400 text-[#14452F] shadow-xs'
                      : 'bg-white/10 text-stone-400'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold mt-2 text-white">Hoàn tất</span>
                <span className="text-[10px] text-stone-300 hidden sm:block">Thưởng thức món</span>
              </div>
            </div>

            {/* Connecting line */}
            <div className="w-3/4 mx-auto h-0.5 bg-white/20 -mt-8 relative z-0">
              <div
                className="h-full bg-amber-400 transition-all duration-700"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Integrated Pickup / Delivery Info Strip */}
          <div className="rounded-xl bg-white/10 border border-white/15 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-amber-300 shrink-0">
                {isPickup ? <Store className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
              </span>
              <div>
                <span className="text-stone-300">
                  {isPickup ? 'Mã lấy món tại quầy: ' : 'Mã nhận đơn: '}
                </span>
                <span className="font-mono font-black text-amber-300 text-sm">
                  #{pickupCode}
                </span>
                <p className="text-[11px] text-stone-300">
                  {isPickup
                    ? `Đọc mã cho Barista tại ${branchName} để nhận nước.`
                    : `Địa chỉ: ${order.customer?.address || ''}`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] text-stone-300">
              <span>Người nhận: </span>
              <strong className="text-white">{order.customer?.name}</strong> •{' '}
              <span className="font-mono">{order.customer?.phone}</span>
            </div>
          </div>
        </div>

        {/* Post-Delivery / Completion Review Prompt Banner */}
        <div className="bg-gradient-to-r from-[#14452F] to-[#185338] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-600/30 flex flex-col sm:flex-row items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5C518] text-[#14452F] flex items-center justify-center font-black shrink-0 shadow-xs">
              <Star className="w-5 h-5 fill-[#14452F]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-[#F5C518] tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3" /> ĐẶC QUYỀN ĐÁNH GIÁ MÓN
              </div>
              <h4 className="font-black text-sm sm:text-base text-white">
                {currentStep >= 4 ? 'Đơn hàng đã hoàn tất! Bạn thấy món thế nào?' : 'Đánh giá món & nhận ngay 50 Xu tích lũy!'}
              </h4>
              <p className="text-xs text-stone-200 mt-0.5">
                Đánh giá trải nghiệm thực tế giúp HONNE hoàn thiện và nhận ngay <strong>+50 Xu</strong> vào tài khoản!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] active:scale-98 text-[#14452F] font-black text-xs sm:text-sm transition shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-[#14452F]" />
            <span>Đánh giá món (+50 Xu)</span>
          </button>
        </div>

        {/* VietQR Dynamic Payment Card (If paying by VietQR and unpaid) */}
        {order.paymentMethod === 'vietqr' && (
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-stone-700" />
                <h3 className="font-bold text-stone-900 text-sm">
                  Thanh Toán VietQR Napas 247
                </h3>
              </div>
              {order.paymentStatus === 'paid' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Đã thanh toán
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Chờ chuyển khoản
                </span>
              )}
            </div>

            {order.paymentStatus !== 'paid' && qrData && (
              <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                {/* Real Dynamic VietQR Image */}
                <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs shrink-0">
                  <img
                    src={qrData.qrUrl}
                    alt="Mã QR Napas"
                    className="w-40 h-40 object-contain"
                  />
                  <span className="text-[10px] text-stone-400 block text-center mt-1">
                    Quét qua App ngân hàng
                  </span>
                </div>

                {/* Transfer Details */}
                <div className="flex-1 space-y-2 text-xs w-full">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Ngân hàng:</span>
                      <strong className="text-stone-900">{qrData.bankName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Số tài khoản:</span>
                      <strong className="font-mono text-stone-900 text-sm">{qrData.accountNo}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Chủ tài khoản:</span>
                      <strong className="text-stone-900">{qrData.accountName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Số tiền:</span>
                      <strong className="text-sm text-stone-900 font-bold">
                        {formatCurrencyVND(qrData.amount)}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-stone-200">
                      <span className="text-stone-500">Nội dung CK:</span>
                      <strong className="font-mono bg-stone-200 text-stone-900 px-2 py-0.5 rounded text-xs">
                        {qrData.transferMemo}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={handleManualConfirmPayment}
                    disabled={checkingPayment}
                    className="w-full py-2 rounded-xl bg-[#14452F] hover:bg-[#185338] text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{checkingPayment ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Items & Support Details */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-100">
            Danh Sách Món Đã Đặt
          </h3>

          <div className="space-y-2 text-xs">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-semibold text-stone-900">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="text-stone-500 ml-1.5">Size {item.size}</span>
                  {item.toppings && item.toppings.length > 0 && (
                    <span className="text-[11px] text-stone-500 block truncate">
                      + {item.toppings.map((t: any) => t.name).join(', ')}
                    </span>
                  )}
                </div>

                <span className="font-semibold text-stone-800 shrink-0">
                  {formatCurrencyVND(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery & Shipper Info (Clean 2-column) */}
          <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-0.5">
              <span className="font-semibold text-stone-800 flex items-center gap-1 text-[11px]">
                <MapPin className="w-3 h-3 text-stone-400" /> Địa chỉ nhận:
              </span>
              <p className="text-stone-700 font-medium">{order.customer?.address}</p>
              <p className="text-stone-500 text-[11px]">{order.customer?.name} - {order.customer?.phone}</p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-0.5">
              <span className="font-semibold text-stone-800 flex items-center gap-1 text-[11px]">
                <Phone className="w-3 h-3 text-stone-400" /> Chi nhánh phụ trách:
              </span>
              <p className="text-stone-700 font-medium">{branchName}</p>
              <a
                href="tel:0379467986"
                className="text-stone-600 hover:text-stone-900 font-medium text-[11px] block"
              >
                Hotline hỗ trợ: 0379 467 986
              </a>
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-stone-100 space-y-1 text-xs text-stone-600">
            <div className="flex justify-between">
              <span className="text-stone-500">Tạm tính:</span>
              <span className="font-medium text-stone-800">{formatCurrencyVND(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Phí giao hàng:</span>
              <span className="font-medium text-stone-800">0đ (Freeship 1km)</span>
            </div>
            {order.discountVoucher && order.discountVoucher.amount > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Voucher giảm giá ({order.discountVoucher.code}):</span>
                <span>-{formatCurrencyVND(order.discountVoucher.amount)}</span>
              </div>
            )}
            {order.coinsUsed && order.coinsUsed > 0 ? (
              <div className="flex justify-between text-stone-600">
                <span>Xu tích lũy đã dùng:</span>
                <span>-{formatCurrencyVND(order.coinsUsed)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>Tổng thanh toán:</span>
              <span className="text-base text-[#14452F]">{formatCurrencyVND(order.finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retail Invoice / Bill Modal */}
      <OrderInvoiceModal
        order={order}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />

      {/* Customer Review Modal */}
      <OrderReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        orderId={order.id}
        branchName={branchName}
        items={(order.items || []).map((i: any) => ({
          productId: i.productId || i.id,
          productName: i.productName || i.name
        }))}
      />
    </div>
  );
};