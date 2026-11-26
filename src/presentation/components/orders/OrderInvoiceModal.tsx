import React from 'react';
import { X, Printer, CheckCircle2, Coffee, Phone, MapPin, QrCode, Store, Bike } from 'lucide-react';
import { formatCurrencyVND } from '../../../shared/utils/currency';

interface OrderInvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const branchName = order.branchName || 'HONNE 183 Cộng Hòa';
  const branchAddress = order.branchAddress || '183 Cộng Hòa, P.12, Q. Tân Bình, TP.HCM';
  const branchPhone = order.branchPhone || '0909 183 183';
  const pickupCode = order.pickupCode || order.id?.slice(-4) || '8924';
  const isPickup = order.orderMode === 'pickup';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col shadow-xl border border-stone-200 overflow-hidden">
        {/* Top Minimal Action Bar */}
        <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Hóa đơn điện tử</span>
            <span className="font-mono font-bold text-xs text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200">
              #{order.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="In hóa đơn bán lẻ"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>In Bill</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-lg hover:bg-stone-200/80 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Roll Body */}
        <div className="p-6 overflow-y-auto space-y-4 bg-white text-stone-800 font-sans print:p-0">
          {/* Shop Header */}
          <div className="text-center pb-3 border-b border-dashed border-stone-300">
            <h2 className="font-black tracking-wider text-lg text-[#14452F] uppercase">
              HONNE COFFEE & TEA
            </h2>
            <p className="text-xs font-semibold text-stone-800 mt-0.5">{branchName}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">{branchAddress}</p>
            <p className="text-[11px] text-stone-500">Hotline: {branchPhone} • 06:30 - 22:30</p>
          </div>

          {/* Receipt Title & Pickup Code */}
          <div className="text-center py-1">
            <span className="text-xs font-black uppercase tracking-widest text-stone-600">
              PHIẾU HÓA ĐƠN BÁN LẺ
            </span>
            {/* Clean, Non-flashy Pickup Code Badge */}
            <div className="mt-2 py-2 px-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  {isPickup ? 'Mã lấy món tại quầy' : 'Mã đơn giao tận nơi'}
                </span>
                <span className="font-mono text-xl font-black text-[#14452F]">
                  #{pickupCode}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block font-medium">Hình thức</span>
                <span className="text-xs font-bold text-stone-800 inline-flex items-center gap-1">
                  {isPickup ? (
                    <>
                      <Store className="w-3.5 h-3.5 text-stone-500" /> Lấy tại quầy
                    </>
                  ) : (
                    <>
                      <Bike className="w-3.5 h-3.5 text-stone-500" /> Giao tận nơi (≤1km)
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="text-xs space-y-1.5 py-1 text-stone-600 border-b border-dashed border-stone-300 pb-3">
            <div className="flex justify-between">
              <span className="text-stone-500">Thời gian:</span>
              <span className="font-medium text-stone-800">
                {new Date(order.createdAt || Date.now()).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Khách hàng:</span>
              <span className="font-bold text-stone-800">{order.customer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Số điện thoại:</span>
              <span className="font-mono font-medium text-stone-800">{order.customer?.phone}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-stone-500 shrink-0">Địa chỉ:</span>
              <span className="font-medium text-stone-800 text-right line-clamp-2">
                {order.customer?.address}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 border-b border-dashed border-stone-300 pb-3">
            <div className="flex justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <span>Món / Topping</span>
              <span>Thành tiền</span>
            </div>

            <div className="space-y-2 text-xs">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>
                      {item.quantity}x {item.productName} <span className="font-normal text-stone-500">({item.size})</span>
                    </span>
                    <span>{formatCurrencyVND(item.totalPrice)}</span>
                  </div>

                  {item.isCombo && item.comboDetails?.drinks ? (
                    <div className="pl-3 space-y-0.5 text-[11px] text-stone-500">
                      {item.comboDetails.drinks.map((d: any, dIdx: number) => (
                        <div key={dIdx}>
                          • Ly {dIdx + 1}: {d.drinkName} ({d.size}, {d.sugar}, {d.ice}
                          {d.toppings?.length ? `, ${d.toppings.join(', ')}` : ''})
                        </div>
                      ))}
                    </div>
                  ) : (
                    item.toppings &&
                    item.toppings.length > 0 && (
                      <div className="pl-3 text-[11px] text-stone-500">
                        + {item.toppings.map((t: any) => t.name).join(', ')}
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span className="text-stone-500">Tạm tính:</span>
              <span className="font-medium text-stone-800">{formatCurrencyVND(order.subtotal)}</span>
            </div>

            {order.discountVoucher && order.discountVoucher.amount > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Voucher ({order.discountVoucher.code}):</span>
                <span>-{formatCurrencyVND(order.discountVoucher.amount)}</span>
              </div>
            )}

            {order.coinsUsed && order.coinsUsed > 0 ? (
              <div className="flex justify-between text-stone-600">
                <span>Xu tích lũy đã dùng:</span>
                <span>-{formatCurrencyVND(order.coinsUsed)}</span>
              </div>
            ) : null}

            <div className="flex justify-between">
              <span className="text-stone-500">Phí giao hàng:</span>
              <span className="font-medium text-stone-800">0đ (Freeship 1km)</span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 text-sm font-black text-stone-900">
              <span className="uppercase">Tổng cộng:</span>
              <span className="text-base text-[#14452F]">{formatCurrencyVND(order.finalTotal)}</span>
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px] text-stone-500">
              <span>Phương thức:</span>
              <span className="font-medium text-stone-800">
                {order.paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Tiền mặt (COD)'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-stone-500">
              <span>Trạng thái thanh toán:</span>
              <span className="font-bold text-stone-800">
                {order.paymentMethod === 'cod'
                  ? order.status === 'completed'
                    ? '✓ Đã thanh toán khi nhận hàng'
                    : '⏳ Chưa thanh toán (Thu khi nhận món)'
                  : order.paymentStatus === 'paid'
                  ? '✓ Đã thanh toán (VietQR)'
                  : '⏳ Chờ chuyển khoản (VietQR)'}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-dashed border-stone-300 text-[11px] text-stone-500 space-y-0.5">
            <p className="font-medium text-stone-700">
              {isPickup
                ? 'Đọc mã lấy món tại quầy để nhận thức uống.'
                : 'Shipper sẽ liên hệ số điện thoại trước khi giao.'}
            </p>
            <p className="text-[10px] text-stone-400">
              Cảm ơn Quý khách & Chúc Quý khách một ngày tuyệt vời!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};