import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  Check,
  Coins,
  Sparkles,
  ChevronRight,
  Bike,
  Store,
  MapPin,
  RefreshCw,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useRewards } from '../../context/RewardContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useOrderLocation } from '../../context/LocationContext';
import { formatCurrencyVND } from '../../../shared/utils/currency';
import { IdGenerator } from '../../../shared/utils/id-generator';
import { useToast } from '../../context/ToastContext';
import { ShopeeVoucherModal } from '../../components/cart/ShopeeVoucherModal';
import { EditCartItemModal } from '../../components/cart/EditCartItemModal';
import { CartItem } from '../../../core/entities/cart';

export const CartScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    discount,
    total,
    voucher,
    updateQuantity,
    updateCartItem,
    removeItem,
    applyVoucher,
    removeVoucher,
    clearCart
  } = useCart();
  const { coins, redeemCoins } = useRewards();
  const { user, isAuthenticated, openAuthModal, deductCoins } = useAuth();
  const {
    orderMode,
    currentAddress,
    selectedBranch,
    setIsLocationModalOpen,
    distanceKm
  } = useOrderLocation();
  const { showToast } = useToast();

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [useCoins, setUseCoins] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Edit item state
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  // Form states for checkout
  const [customerName, setCustomerName] = useState(user?.name || currentAddress?.receiverName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || currentAddress?.receiverPhone || '');
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'sepay'>('cod');

  // Shipping Fee calculation: Freeship 0đ for delivery <= 2km, or pickup
  const isTooFar = orderMode === 'delivery' && distanceKm > 2.0;
  const shippingFee = 0; // Luôn miễn phí giao hàng 0đ trong bán kính 2km

  const availableCoins = user ? user.coins : coins;
  const maxCoinsRedeemable = Math.min(availableCoins, Math.floor(subtotal * 0.5));
  const coinDiscount = useCoins ? maxCoinsRedeemable : 0;
  const finalTotal = Math.max(0, subtotal - discount - coinDiscount + shippingFee);

  const handleCoinsToggle = (checked: boolean) => {
    if (checked && !isAuthenticated) {
      showToast('Vui lòng Đăng nhập thành viên để sử dụng số Xu tích lũy!', 'info');
      openAuthModal();
      return;
    }
    setUseCoins(checked);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTooFar) {
      showToast(`Khoảng cách từ ${selectedBranch.name} đến địa chỉ nhận là ${distanceKm.toFixed(1)}km (vượt quá 1km). Quán chỉ giao miễn phí trong 1km để nhân viên mang tới nhanh, nước không tan đá. Vui lòng chọn chi nhánh gần hơn hoặc chọn 'Lấy tại quầy'!`, 'error');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Vui lòng điền họ tên và số điện thoại giao hàng', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (useCoins && coinDiscount > 0) {
        redeemCoins(coinDiscount);
        if (user) {
          deductCoins(coinDiscount);
        }
      }

      const finalReceiverName = customerName.trim() || currentAddress.receiverName;
      const finalReceiverPhone = customerPhone.trim() || currentAddress.receiverPhone;
      const finalAddress =
        orderMode === 'delivery'
          ? currentAddress.addressDetail
          : `Nhận tại quầy ${selectedBranch.name} (${selectedBranch.address}, ${selectedBranch.ward})`;

      const orderId = IdGenerator.order();
      const pickupCode = IdGenerator.pickupCode();

      // ĐƠN MỚI TẠO LUÔN LÀ 'unpaid':
      // - Tiền mặt (COD): Thu tiền mặt khi shipper giao nước tận tay hoặc thu ngân trao tại quầy
      // - VietQR: Chưa thanh toán cho đến khi quét mã chuyển khoản thành công
      const orderData = {
        id: orderId,
        userId: user?.id || '',
        pickupCode,
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
        branchAddress: `${selectedBranch.address}, ${selectedBranch.ward}, Tân Bình`,
        branchPhone: selectedBranch.phone,
        orderMode,
        customer: {
          name: finalReceiverName,
          phone: finalReceiverPhone,
          address: finalAddress,
          district: 'Tân Bình',
          note: customerNote
        },
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          size: i.size,
          sugarLevel: 100,
          iceLevel: 'Bình thường',
          toppings: i.toppings,
          unitPrice: i.itemPrice,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
          isCombo: i.isCombo,
          comboDetails: i.comboDetails
        })),
        subtotal,
        discountVoucher: voucher ? { code: voucher.code, amount: discount } : undefined,
        coinsUsed: useCoins ? coinDiscount : 0,
        coinsDiscountAmount: coinDiscount,
        shippingFee,
        finalTotal,
        paymentMethod,
        paymentStatus: 'unpaid', // Chuẩn logic: COD hay VietQR ban đầu đều là unpaid
        distanceKm: orderMode === 'delivery' ? distanceKm : 0,
        status: 'brewing',
        createdAt: new Date().toISOString()
      };

      // Đồng bộ bắt buộc vào Cloudflare D1 Database
      const res = await fetch('https://api-honne.hanhan02102012.workers.dev/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Không thể lưu đơn hàng vào hệ thống Cloudflare D1.');
      }

      // Broadcast real-time order signal to Admin POS Dashboard
      try {
        const bc = new BroadcastChannel('honne_realtime_orders');
        bc.postMessage({
          type: 'NEW_ORDER',
          order: { id: orderId, total: finalTotal, customerName }
        });
        bc.close();
      } catch {}
      try {
        localStorage.setItem('honne_new_order_event', Date.now().toString());
      } catch {}

      // Xóa cache cũ không đồng bộ khỏi localStorage
      try {
        localStorage.removeItem('honne_customer_orders');
      } catch {}

      // Fire celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // If customer chooses SePay Payment Gateway -> Redirect to SePay Checkout
      if (paymentMethod === 'sepay') {
        showToast('Đang chuyển hướng tới Cổng thanh toán SePay...', 'info');
        try {
          const sepayRes = await fetch('https://api-honne.hanhan02102012.workers.dev/api/sepay/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              amount: finalTotal,
              description: `HONNE ${orderId}`
            })
          });
          const sepayData = await sepayRes.json();
          if (sepayData.success && sepayData.checkoutUrl && sepayData.fields) {
            clearCart();
            // Automatically post form to SePay checkout
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = sepayData.checkoutUrl;
            for (const [key, val] of Object.entries(sepayData.fields)) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = String(val);
              form.appendChild(input);
            }
            document.body.appendChild(form);
            form.submit();
            return;
          }
        } catch (sepayErr) {
          console.error('SePay gateway redirect error:', sepayErr);
        }
      }

      clearCart();
      showToast('Đặt hàng thành công! Đồ uống sẽ được giao trong 15 phút.', 'success');
      navigate(`/theo-doi-don-hang/${orderId}`);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi gửi đơn hàng đến máy chủ. Vui lòng thử lại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-5 sm:py-8 px-3 sm:px-6 lg:px-8 text-stone-900 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-[#14452F] via-[#185338] to-[#113B26] rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white mb-5 sm:mb-6 border border-[#206645] shadow-lg flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-10 w-64 h-64 bg-[#F5C518]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 text-[#F5C518] text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
              HONNE ORDER & CART
            </div>
            <h1 className="text-xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-[#F5C518]" />
              Giỏ Hàng Của Bạn
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-0.5 sm:mt-1">
              Kiểm tra các món đã chọn, tùy chỉnh khẩu vị và áp dụng mã ưu đãi tiết kiệm
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 border border-white/20 items-center justify-center text-[#F5C518] shadow-md relative z-10">
            <ShoppingBag className="w-8 h-8" />
          </div>
        </div>

        {/* Global Delivery / Branch Status Card (GrabFood / ShopeeFood style) */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-stone-200/90 shadow-xs mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#14452F] text-[#F5C518] flex items-center justify-center shrink-0 font-bold shadow-xs">
              {orderMode === 'delivery' ? <Bike className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-[#14452F] uppercase tracking-wider">
                  {orderMode === 'delivery' ? '🛵 Giao tận nơi' : '🏢 Lấy tại quầy'}
                </span>
                {orderMode === 'delivery' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Khoảng cách: ~{distanceKm.toFixed(1)} km ({shippingFee === 0 ? 'Freeship' : 'Phí 15k'})
                  </span>
                )}
              </div>
              <p className="font-extrabold text-stone-900 text-xs sm:text-sm mt-0.5 truncate">
                {orderMode === 'delivery'
                  ? currentAddress.addressDetail
                  : `${selectedBranch.name} • ${selectedBranch.address}, ${selectedBranch.ward}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-stone-200 text-[#14452F] border border-stone-200 font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
            <span>Đổi {orderMode === 'delivery' ? 'địa chỉ' : 'chi nhánh'}</span>
          </button>
        </div>

        {orderSuccess ? (
          /* Order success state */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-md border border-stone-200 space-y-4 max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#14452F] flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-stone-900">Đặt hàng thành công!</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Cảm ơn <strong>{customerName}</strong>! HONNE đã tiếp nhận đơn hàng của bạn và đang tiến hành pha chế các ly nước thơm mát nhất. Barista sẽ liên hệ qua SĐT <strong>{customerPhone}</strong> để xác nhận.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  navigate('/san-pham');
                }}
                className="px-6 py-3 rounded-full bg-[#14452F] text-amber-300 font-black text-sm hover:bg-[#185338] transition cursor-pointer"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty cart state */
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-stone-200 space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-stone-800">Giỏ hàng của bạn đang trống</h2>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Hãy chọn những món cà phê rang mộc, trà sữa Oolong hay trà trái cây tươi mát từ thực đơn HONNE nhé!
            </p>
            <div className="pt-3">
              <Link
                to="/san-pham"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#14452F] text-amber-300 font-black text-sm hover:bg-[#185338] transition shadow-md"
              >
                Khám phá thực đơn ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Content: Item List + Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-black text-stone-800 uppercase tracking-wider">
                  Món đã chọn ({items.length} món)
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  Nhấn "Chỉnh sửa" để đổi khẩu vị
                </span>
              </div>

              {/* Items Card List (Grab / ShopeeFood style) */}
              <div className="space-y-3.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 hover:border-emerald-300 shadow-xs transition-all space-y-3"
                  >
                    {/* Item Main Row: Image + Name + Price + Delete */}
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-50 p-2 flex items-center justify-center shrink-0 border border-stone-200">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.isCombo ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                              🌟 Combo tiết kiệm
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                              Thức uống
                            </span>
                          )}
                        </div>

                        <h4 className="font-black text-stone-900 text-sm sm:text-base mt-1 line-clamp-2">
                          {item.product.name}
                        </h4>

                        {!item.isCombo && (
                          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-stone-600">
                            <span className="font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800">
                              Size {item.size}
                            </span>
                            {item.toppings && item.toppings.length > 0 && (
                              <span>
                                Topping: {item.toppings.map((t) => t.name).join(', ')}
                              </span>
                            )}
                          </div>
                        )}

                        <span className="font-black text-[#14452F] text-base block mt-1.5">
                          {formatCurrencyVND(item.itemPrice)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                        title="Xóa món khỏi giỏ hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* COMBO DRINKS BREAKDOWN (Clean, readable mini cards) */}
                    {item.isCombo && item.comboDetails && (
                      <div className="mt-2 space-y-2 border-t border-stone-100 pt-3">
                        <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 block">
                          Chi tiết các ly trong Combo ({item.comboDetails.drinks.length} ly):
                        </span>
                        <div className="space-y-1.5">
                          {item.comboDetails.drinks.map((d, dIdx) => (
                            <div
                              key={dIdx}
                              className="bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200/70 flex items-start gap-2.5 text-xs"
                            >
                              <span className="w-5 h-5 rounded-md bg-[#14452F] text-amber-300 text-[11px] font-black flex items-center justify-center shrink-0">
                                {dIdx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-stone-900 truncate">
                                    {d.drinkName}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-200 text-stone-800 shrink-0">
                                    Size {d.size}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                  <span className="text-[10px] text-stone-600 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                                    Đường: {d.sugar}
                                  </span>
                                  <span className="text-[10px] text-stone-600 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                                    Đá: {d.ice}
                                  </span>
                                  {d.toppings &&
                                    d.toppings.map((top, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                          top.includes('0đ')
                                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                                            : 'bg-amber-50 text-amber-900 border-amber-200'
                                        }`}
                                      >
                                        + {top}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions Row: Edit Button + Quantity Stepper + Line Subtotal */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-2 flex-wrap">
                      {/* Edit Button (Grab / ShopeeFood style) */}
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#14452F] border border-amber-300/80 font-bold text-xs transition cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Chỉnh sửa {item.isCombo ? 'combo' : 'món'}</span>
                      </button>

                      {/* Quantity Stepper & Subtotal */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                            aria-label="Giảm"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-black text-xs text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                            aria-label="Tăng"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-black text-stone-900 text-sm sm:text-base min-w-[75px] text-right">
                          {formatCurrencyVND(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shopee-style Voucher Card */}
              <div
                onClick={() => setIsVoucherModalOpen(true)}
                className="bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 rounded-2xl p-4 sm:p-5 shadow-xs border border-amber-300/90 hover:border-amber-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#14452F] text-amber-400 flex items-center justify-center text-lg shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      🎟️
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <span>HONNE Voucher</span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-medium">
                          Tối đa 1 mã
                        </span>
                      </div>
                      {voucher ? (
                        <div className="text-sm font-bold text-emerald-800 flex items-center gap-2 mt-0.5 truncate">
                          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-xs font-mono font-bold">
                            {voucher.code}
                          </span>
                          <span>Đã giảm -{formatCurrencyVND(discount)}</span>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-stone-600 truncate mt-0.5">
                          Chọn hoặc nhập mã giảm giá (Shopee voucher)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-[#14452F] bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl shrink-0 transition-colors">
                    <span>{voucher ? 'Đổi mã' : 'Chọn mã'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {voucher && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-between text-xs text-stone-600">
                    <span className="truncate">{voucher.description}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVoucher();
                      }}
                      className="text-rose-600 hover:text-rose-700 font-bold shrink-0 ml-2 cursor-pointer"
                    >
                      Gỡ bỏ
                    </button>
                  </div>
                )}
              </div>

              {/* Shopee Voucher Modal */}
              <ShopeeVoucherModal
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
                subtotal={subtotal}
                currentVoucherCode={voucher?.code}
                onApplyVoucher={(code) => applyVoucher(code)}
                onRemoveVoucher={removeVoucher}
              />
            </div>

            {/* Right Summary Column (Sticky) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-stone-200/90 space-y-4">
                <h3 className="font-black text-stone-900 text-base pb-3 border-b border-stone-100">
                  Tóm Tắt Thanh Toán
                </h3>

                {/* Coin redemption toggle */}
                <div
                  onClick={() => !isAuthenticated && handleCoinsToggle(true)}
                  className="p-3 rounded-2xl bg-[#FFFDF2] border border-[#F5C518] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="font-extrabold text-stone-900">Dùng Xu tích lũy</span>
                      <span className="text-[11px] text-stone-500 block">
                        {isAuthenticated
                          ? `(Đang có ${availableCoins.toLocaleString('vi-VN')} Xu)`
                          : '(Đăng nhập để dùng Xu)'}
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCoins}
                      onChange={(e) => handleCoinsToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#14452F]"></div>
                  </label>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Tạm tính</span>
                    <span className="font-bold text-stone-900">{formatCurrencyVND(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Voucher giảm giá</span>
                      <span className="font-bold text-emerald-700">-{formatCurrencyVND(discount)}</span>
                    </div>
                  )}

                  {coinDiscount > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Xu giảm trừ</span>
                      <span className="font-bold text-amber-600">-{formatCurrencyVND(coinDiscount)}</span>
                    </div>
                  )}

                  {!isTooFar && (
                    <div className="flex justify-between text-stone-600">
                      <span>Phí giao hàng</span>
                      <span
                        className={`font-bold ${
                          shippingFee === 0 ? 'text-emerald-700' : 'text-stone-900'
                        }`}
                      >
                        {shippingFee === 0 ? 'Miễn phí (0đ)' : formatCurrencyVND(shippingFee)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                    <span className="font-black text-stone-900 text-base">Tổng thanh toán</span>
                    <span className="font-black text-2xl text-[#14452F]">
                      {formatCurrencyVND(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger or Checkout Form */}
                {!isCheckingOut ? (
                  <div className="pt-3 space-y-2.5">
                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#F5C518] hover:bg-[#ffd54f] text-[#103B27] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                    >
                      Tiến hành thanh toán <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigate('/san-pham')}
                      className="w-full py-2.5 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition cursor-pointer"
                    >
                      Tiếp tục chọn thêm món
                    </button>
                  </div>
                ) : (
                  /* Checkout Form inside Summary */
                  <form
                    onSubmit={handleCheckoutSubmit}
                    className="pt-3 space-y-3 border-t border-stone-100 animate-in fade-in"
                  >
                    {/* Synchronized Address & Store Setup Card */}
                    <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-emerald-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#14452F] uppercase flex items-center gap-1">
                          {orderMode === 'delivery' ? (
                            <Bike className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Store className="w-3.5 h-3.5 text-emerald-700" />
                          )}
                          {orderMode === 'delivery' ? 'Giao hàng tận nơi' : 'Lấy tại quầy'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsLocationModalOpen(true)}
                          className="text-xs font-bold text-[#14452F] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-emerald-700" />
                          <span>Đổi địa chỉ</span>
                        </button>
                      </div>

                      <div className="text-xs text-stone-800">
                        {orderMode === 'delivery' ? (
                          <>
                            <div className="font-extrabold text-stone-900">
                              {currentAddress.receiverName} • {currentAddress.receiverPhone}
                            </div>
                            <div className="text-stone-600 mt-0.5 font-medium line-clamp-2">
                              {currentAddress.addressDetail}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-bold mt-1">
                              {distanceKm <= 1.0
                                ? `✓ Freeship 0đ (Bán kính ${distanceKm.toFixed(1)}km từ ${selectedBranch.name})`
                                : `⚠️ Khoảng cách ${distanceKm.toFixed(1)}km (Vượt quá 1km)`}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-extrabold text-stone-900">
                              {selectedBranch.name}
                            </div>
                            <div className="text-stone-600 mt-0.5 font-medium">
                              {selectedBranch.address}, {selectedBranch.ward}
                            </div>
                            <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                              Giờ mở cửa: {selectedBranch.openingHours} • Hotline: {selectedBranch.phone}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Họ tên người nhận *"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Số điện thoại *"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Ghi chú thêm (VD: Ít đá, giao trước 11h...)"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />

                    {/* Too Far Warning Banner (1km Rule) */}
                    {isTooFar && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs leading-relaxed space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-rose-800">
                          ⚠️ Khoảng cách {distanceKm.toFixed(1)}km (Vượt quá 1km):
                        </div>
                        <p>
                          Để đảm bảo trà & cà phê giữ nguyên lớp kem béo mịn, không tan đá mất vị ngon (do nhân viên quán tự mang trực tiếp), HONNE chỉ nhận giao miễn phí trong <strong>bán kính 1km</strong> từ chi nhánh. Bạn vui lòng bấm <strong>"Đổi địa chỉ"</strong> để chọn chi nhánh gần hơn hoặc chuyển sang <strong>"Lấy tại quầy"</strong> nhé!
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-stone-600 mb-1.5 uppercase tracking-wider">
                        Phương thức thanh toán:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-3 rounded-2xl border font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                            paymentMethod === 'cod'
                              ? 'border-[#14452F] bg-[#14452F] text-amber-300 ring-2 ring-amber-400/40'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">💵</span>
                            <span className="font-extrabold text-xs">Khi nhận đồ uống</span>
                          </div>
                          <span
                            className={`text-[10px] mt-1 ${
                              paymentMethod === 'cod' ? 'text-emerald-100' : 'text-stone-400'
                            }`}
                          >
                            Tiền mặt hoặc Quét QR khi giao tới
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('sepay')}
                          className={`p-3 rounded-2xl border font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                            paymentMethod === 'sepay'
                              ? 'border-[#14452F] bg-[#14452F] text-amber-300 ring-2 ring-amber-400/40'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">📱</span>
                              <span className="font-extrabold text-xs">Cổng SePay QR</span>
                            </div>
                            <span className="text-[9px] bg-amber-400 text-stone-900 px-1.5 py-0.5 rounded font-black">
                              Sandbox
                            </span>
                          </div>
                          <span
                            className={`text-[10px] mt-1 ${
                              paymentMethod === 'sepay' ? 'text-emerald-100' : 'text-stone-400'
                            }`}
                          >
                            Quét QR Napas 24/7 tự động xác nhận
                          </span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isTooFar || isSubmitting}
                      className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition mt-3 ${
                        isTooFar || isSubmitting
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                          : 'bg-[#F5C518] hover:bg-[#ffd54f] text-[#14452F] cursor-pointer active:scale-98'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#14452F] border-t-transparent rounded-full animate-spin" />
                          <span>Đang gửi đơn hàng tới Barista...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>
                            {isTooFar
                              ? 'Quá 1km (Đổi chi nhánh hoặc Lấy tại quầy)'
                              : `Hoàn tất đặt hàng (${formatCurrencyVND(finalTotal)})`}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="w-full text-xs text-stone-500 hover:underline text-center pt-1 cursor-pointer"
                    >
                      Quay lại xem giỏ hàng
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Item Edit Modal (GrabFood / ShopeeFood style) */}
      <EditCartItemModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(updated) => {
          if (editingItem) {
            updateCartItem(editingItem.id, updated);
          }
        }}
      />
    </div>
  );
};
