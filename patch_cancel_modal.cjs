const fs = require('fs');
const filePath = 'c:/Users/lenovo/OneDrive/Desktop/web_honne/src/presentation/screens/admin/tabs/AdminOrdersTab.tsx';
let code = fs.readFileSync(filePath, 'utf8');
const isCrlf = code.includes('\r\n');
if (isCrlf) code = code.replace(/\r\n/g, '\n');

// 1. Update onUpdateStatus signature in AdminOrdersTabProps
code = code.replace(
  'onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;',
  'onUpdateStatus: (orderId: string, newStatus: string, reason?: string) => Promise<void>;'
);

// 2. Add cancelReason states in component
const oldCancelState = `  const [cancellingOrder, setCancellingOrder] = useState<OrderRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);`;

const newCancelState = `  const [cancellingOrder, setCancellingOrder] = useState<OrderRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReasonOption, setCancelReasonOption] = useState<string>('Hết nguyên liệu / Món tạm ngưng phục vụ');
  const [cancelCustomReason, setCancelCustomReason] = useState<string>('');`;

if (code.includes(oldCancelState)) {
  code = code.replace(oldCancelState, newCancelState);
  console.log('Added cancel reason states');
}

// 3. Replace ConfirmDeleteModal with CancelOrderModal
const oldModalTarget = `      {/* Confirm Cancel Order Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(cancellingOrder)}
        title="Xác Nhận Hủy Đơn Hàng"
        itemName={cancellingOrder ? \`Đơn hàng #\${cancellingOrder.id} - \${cancellingOrder.customer?.name} (\${formatCurrencyVND(cancellingOrder.finalTotal)})\` : undefined}
        description="Đơn hàng này sẽ được chuyển sang trạng thái Đã Hủy trong cơ sở dữ liệu Cloudflare D1. Bạn có chắc chắn muốn hủy đơn không?"
        confirmText="Hủy Đơn Hàng"
        isDeleting={isCancelling}
        onConfirm={async () => {
          if (!cancellingOrder) return;
          setIsCancelling(true);
          try {
            await onUpdateStatus(cancellingOrder.id.replace('HN', 'ORD_'), 'cancelled');
            setCancellingOrder(null);
          } finally {
            setIsCancelling(false);
          }
        }}
        onClose={() => setCancellingOrder(null)}
      />`;

const newModalTarget = `      {/* Modal Hủy Đơn Hàng Có Lý Do Bắt Buộc (Chuẩn Nghiệp Vụ F&B - Không Tính Doanh Thu) */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base">Hủy Đơn Hàng</h3>
                  <p className="text-xs text-stone-500 font-mono">#{cancellingOrder.id} • {cancellingOrder.customer?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 text-xs text-rose-900 space-y-1">
              <span className="font-bold block">⚠️ Lưu ý nghiệp vụ tài chính:</span>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                Đơn hàng bị hủy sẽ <strong>KHÔNG được cộng vào Doanh thu</strong> và sẽ ghi nhận lý do vào hệ thống Cloudflare D1 để đối soát cuối ca.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800">
                Chọn lý do hủy đơn <span className="text-rose-600">*</span>:
              </label>
              <div className="space-y-1.5">
                {[
                  'Hết nguyên liệu / Món tạm ngưng phục vụ',
                  'Khách hàng gọi điện xin hủy đơn',
                  'Không liên lạc được khách hàng (Boom hàng)',
                  'Khoảng cách quá xa / Không có người giao',
                  'Lý do khác'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={\`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition \${
                      cancelReasonOption === reason
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-1 ring-rose-300'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }\`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={cancelReasonOption === reason}
                      onChange={() => setCancelReasonOption(reason)}
                      className="accent-rose-600 cursor-pointer"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReasonOption === 'Lý do khác' && (
                <div className="pt-1.5">
                  <textarea
                    rows={2}
                    value={cancelCustomReason}
                    onChange={(e) => setCancelCustomReason(e.target.value)}
                    placeholder="Nhập lý do chi tiết..."
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                Giữ lại đơn
              </button>
              <button
                type="button"
                disabled={isCancelling || (cancelReasonOption === 'Lý do khác' && !cancelCustomReason.trim())}
                onClick={async () => {
                  if (!cancellingOrder) return;
                  setIsCancelling(true);
                  const finalReason = cancelReasonOption === 'Lý do khác' ? cancelCustomReason.trim() : cancelReasonOption;
                  try {
                    await onUpdateStatus(cancellingOrder.id, 'cancelled', finalReason);
                    showToast(\`Đã hủy đơn #\${cancellingOrder.id} (Lý do: \${finalReason})!\`, 'info');
                    setCancellingOrder(null);
                  } catch {
                    showToast('Lỗi khi hủy đơn hàng', 'error');
                  } finally {
                    setIsCancelling(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Đang xử lý...' : 'Xác Nhận Hủy Đơn'}
              </button>
            </div>
          </div>
        </div>
      )}`;

if (code.includes(oldModalTarget)) {
  code = code.replace(oldModalTarget, newModalTarget);
  console.log('Successfully replaced ConfirmDeleteModal with CancelOrderModal');
} else {
  console.warn('Could not find oldModalTarget');
}

if (isCrlf) code = code.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, code, 'utf8');
console.log('Finished updating AdminOrdersTab.tsx with cancel modal');
