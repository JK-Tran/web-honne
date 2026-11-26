import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  FileText,
  RefreshCw,
  Bike,
  Store,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrencyVND } from '../../../shared/utils/currency';
import { API_BASE_URL, authFetch } from '../../../shared/utils/api-client';
import { OrderInvoiceModal } from '../../components/orders/OrderInvoiceModal';
import { OrderReviewModal } from '../../components/orders/OrderReviewModal';

export interface OrderRecord {
  id: string;
  userId?: string;
  pickupCode?: string;
  branchId?: string;
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;
  orderMode?: 'pickup' | 'delivery';
  customer: {
    name: string;
    phone: string;
    address: string;
    district?: string;
    note?: string;
  };
  items: {
    productId: string;
    productName: string;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    sugarLevel?: number | string;
    iceLevel?: string;
    toppings?: { name: string; price: number }[];
    isCombo?: boolean;
    comboDetails?: any;
  }[];
  subtotal: number;
  discountVoucher?: { code: string; amount: number };
  coinsUsed?: number;
  coinsDiscountAmount?: number;
  shippingFee?: number;
  finalTotal: number;
  paymentMethod?: 'cod' | 'vietqr';
  paymentStatus?: 'unpaid' | 'paid';
  status: 'pending' | 'brewing' | 'shipping' | 'completed' | 'cancelled';
  distanceKm?: number;
  createdAt: string;
}

export const OrderHistoryScreen: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, accessToken } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderRecord | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<OrderRecord | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleOpenReview = (order: OrderRecord) => {
    setSelectedReviewOrder(order);
    setIsReviewModalOpen(true);
  };

  // Lấy đơn hàng DUY NHẤT từ Cloudflare D1 Database (Không đọc local mock để đảm bảo khớp 100%)
  const loadOrders = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    setRefreshing(true);

    try {
      // 1. Xóa toàn bộ cache localStorage không đồng bộ
      try {
        localStorage.removeItem('honne_customer_orders');
      } catch (e) {
        console.error('Error clearing localStorage orders:', e);
      }

      // 2. Fetch danh sách đơn hàng thực tế từ Cloudflare Workers D1 database
      let remoteOrders: OrderRecord[] = [];
      try {
        const res = await authFetch(`${API_BASE_URL}/orders`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const allOrders: OrderRecord[] = data.data;
          if (user) {
            // Lọc các đơn thuộc về user hiện tại (theo id, số điện thoại, hoặc họ tên)
            const matched = allOrders.filter(
              (o) =>
                (user.id && o.userId === user.id) ||
                (user.phone && o.customer?.phone === user.phone) ||
                (user.name && o.customer?.name === user.name)
            );
            remoteOrders = matched.length > 0 ? matched : allOrders;
          } else {
            remoteOrders = allOrders;
          }
        }
      } catch (err) {
        console.warn('Lỗi kết nối Cloudflare D1:', err);
      }

      setOrders(remoteOrders);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders(true);
  }, [user]);

  const handleOpenInvoice = (order: OrderRecord) => {
    setSelectedInvoiceOrder(order);
    setIsInvoiceModalOpen(true);
  };

  const handleTrackLive = (orderId: string) => {
    navigate(`/theo-doi-don-hang/${orderId}`);
  };

  const handleReorder = (order: OrderRecord) => {
    try {
      order.items.forEach((item) => {
        addItem(
          {
            id: item.productId,
            name: item.productName,
            price: item.unitPrice,
            category: 'coffee',
            subtitle: 'HONNE Special',
            description: '',
            rating: 5,
            reviewCount: 10,
            image:
              'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
            isFeatured: false,
            isNew: false,
            availableSizes: ['M', 'L'],
            customizationRules: {
              allowedSugarLevels: [0, 30, 50, 70, 100],
              allowedIceLevels: ['Không đá', '50% đá', '100% đá'],
              allowedToppings: []
            },
            reviews: []
          } as any,
          (item.size as any) || 'M',
          item.quantity,
          (item.toppings as any) || []
        );
      });
      showToast(`Đã thêm ${order.items.length} món từ đơn #${order.id} vào giỏ hàng!`, 'success');
      navigate('/gio-hang');
    } catch {
      showToast('Đã thêm các món vào giỏ hàng!', 'success');
      navigate('/gio-hang');
    }
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'brewing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Đang pha chế tại quầy
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-semibold border border-sky-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Đang giao hàng siêu tốc
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Đã hoàn tất
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200/80">
            Đã hủy đơn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
            Chờ xác nhận
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8] py-5 sm:py-10 px-3 sm:px-6 lg:px-8 w-full overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
        {/* Clean Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Lịch Sử Đơn Hàng
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Theo dõi trực tiếp tiến trình đơn hàng, xem mã lấy món tại quầy và in bill hóa đơn.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => loadOrders(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs border border-stone-300 transition cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Làm mới danh sách đơn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Đang cập nhật...' : 'Làm mới'}</span>
            </button>

            {!isAuthenticated && (
              <button
                onClick={openAuthModal}
                className="px-3 py-1.5 rounded-lg bg-[#14452F] hover:bg-[#185338] text-white font-bold text-xs transition cursor-pointer shadow-2xs"
              >
                Đăng nhập tài khoản
              </button>
            )}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-2xs space-y-3">
            <div className="w-8 h-8 border-3 border-[#14452F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-stone-500 text-xs font-medium">Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6 text-stone-500" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Bạn chưa có đơn hàng nào</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Khi bạn đặt cà phê hoặc trà sữa, thông tin đơn hàng và mã nhận món sẽ xuất hiện tại đây.
            </p>
            <div className="pt-2">
              <Link
                to="/san-pham"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#14452F] hover:bg-[#185338] text-white font-bold text-xs transition shadow-2xs"
              >
                <span>Khám phá thực đơn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPickup = order.orderMode === 'pickup';
              const pickupCode = order.pickupCode || order.id.slice(-4);
              const branchName = order.branchName || 'HONNE 183 Cộng Hòa';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-xs transition-all space-y-3.5"
                >
                  {/* Top Bar: Clean Meta & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-stone-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md">
                        #{order.id}
                      </span>

                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {isPickup ? (
                          <>
                            <Store className="w-3 h-3 text-stone-500" />
                            <span>Lấy tại quầy</span>
                          </>
                        ) : (
                          <>
                            <Bike className="w-3 h-3 text-stone-500" />
                            <span>Giao tận nơi (≤1km)</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Clean Callout: Pickup Code & Destination */}
                  <div className="rounded-xl bg-stone-50/90 border border-stone-200/70 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#14452F] text-white flex items-center justify-center shrink-0">
                        {isPickup ? <Store className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                            {isPickup ? 'Mã lấy món tại quầy:' : 'Mã đơn ship:'}
                          </span>
                          <span className="font-mono text-base font-black text-[#14452F]">
                            #{pickupCode}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">
                          {isPickup
                            ? `Đọc mã tại quầy ${branchName} để nhận nước.`
                            : `Giao đến: ${order.customer?.address || 'Địa chỉ khách'} • SĐT: ${order.customer?.phone || ''}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs sm:text-right shrink-0">
                      <span className="text-stone-400 text-[11px] block">Thanh toán</span>
                      {order.paymentMethod === 'cod' ? (
                        order.status === 'completed' ? (
                          <span className="font-semibold text-emerald-700">
                            Tiền mặt (COD) • Đã thanh toán khi nhận
                          </span>
                        ) : (
                          <span className="font-semibold text-stone-700">
                            Tiền mặt (COD) • Thanh toán khi nhận hàng
                          </span>
                        )
                      ) : (
                        order.paymentStatus === 'paid' ? (
                          <span className="font-semibold text-emerald-700">
                            VietQR • Đã thanh toán
                          </span>
                        ) : (
                          <span className="font-semibold text-amber-700">
                            VietQR • Chờ chuyển khoản
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Drinks Items */}
                  <div className="space-y-1.5 py-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <span className="font-semibold text-stone-900">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-stone-500 ml-1.5">
                            (Size {item.size})
                          </span>

                          {item.isCombo && item.comboDetails?.drinks ? (
                            <div className="pl-3 mt-0.5 space-y-0.5 text-[11px] text-stone-500">
                              {item.comboDetails.drinks.map((d: any, dIdx: number) => (
                                <div key={dIdx}>
                                  • Ly {dIdx + 1}: {d.drinkName} ({d.size}, {d.sugar}, {d.ice}
                                  {d.toppings?.length ? `, +${d.toppings.join(', ')}` : ''})
                                </div>
                              ))}
                            </div>
                          ) : (
                            item.toppings &&
                            item.toppings.length > 0 && (
                              <span className="text-[11px] text-stone-500 block truncate">
                                + {item.toppings.map((t) => t.name).join(', ')}
                              </span>
                            )
                          )}
                        </div>

                        <span className="font-semibold text-stone-800 shrink-0">
                          {formatCurrencyVND(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Actions Bar */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-stone-500">Tổng thanh toán:</span>
                        <span className="text-base font-black text-stone-900">
                          {formatCurrencyVND(order.finalTotal)}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          (Freeship 1km)
                        </span>
                      </div>
                      {order.discountVoucher && order.discountVoucher.amount > 0 && (
                        <span className="text-[11px] text-stone-500">
                          Đã giảm voucher: -{formatCurrencyVND(order.discountVoucher.amount)}
                        </span>
                      )}
                    </div>

                    {/* Clean Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handleReorder(order)}
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs border border-stone-200 transition cursor-pointer"
                      >
                        Đặt lại
                      </button>

                      <button
                        onClick={() => handleOpenReview(order)}
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-[#F5C518] hover:bg-[#ffd54f] text-[#14452F] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Star className="w-3.5 h-3.5 fill-[#14452F]" />
                        <span>Đánh giá</span>
                      </button>

                      <button
                        onClick={() => handleOpenInvoice(order)}
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-300 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-stone-600" />
                        <span>In Hóa Đơn</span>
                      </button>

                      <button
                        onClick={() => handleTrackLive(order.id)}
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg bg-[#14452F] hover:bg-[#185338] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        <span>Theo dõi đơn</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Electronic Invoice Modal */}
        {selectedInvoiceOrder && (
          <OrderInvoiceModal
            order={selectedInvoiceOrder}
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
          />
        )}

        {/* Customer Review Modal */}
        {selectedReviewOrder && (
          <OrderReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            orderId={selectedReviewOrder.id}
            branchName={selectedReviewOrder.branchName || '183 Cộng Hòa'}
            items={selectedReviewOrder.items.map((i) => ({
              productId: i.productId,
              productName: i.productName
            }))}
            onReviewSubmitted={() => loadOrders(false)}
          />
        )}
      </div>
    </div>
  );
};