const fs = require('fs');
const filePath = 'c:/Users/lenovo/OneDrive/Desktop/web_honne/src/presentation/screens/admin/tabs/AdminOrdersTab.tsx';
let code = fs.readFileSync(filePath, 'utf8');
const isCrlf = code.includes('\r\n');
if (isCrlf) code = code.replace(/\r\n/g, '\n');

// 1. Add Zap icon and helper
if (!code.includes('Zap,')) {
  code = code.replace('CheckCircle2,', 'CheckCircle2,\n  Zap,');
}

// 2. Add getItemName helper function and replace defaultMockOrders
const oldMockTarget = `  // Default mock fallback orders if database has few
  const defaultMockOrders: OrderRecord[] = [`;

const oldMockEnd = `  // Deduplicate by ID
  const uniqueOrders = Array.from(new Map(allOrdersList.map((o) => [o.id, o])).values());`;

const newOrdersBinding = `  // Helper to extract product name safely (fixing undefined issue)
  const getItemName = (it: any) => it?.name || it?.productName || it?.title || it?.product_name || 'Đồ uống HONNE';

  // 1-Click Status Advance state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleAdvanceStatus = async (order: OrderRecord, nextStatus: string) => {
    setUpdatingOrderId(order.id);
    try {
      await onUpdateStatus(order.id, nextStatus);
      playPosChime();
      const statusLabel = nextStatus === 'brewing' ? 'Đang pha chế' : nextStatus === 'shipping' ? 'Đang giao hàng' : nextStatus === 'completed' ? 'Hoàn thành' : nextStatus;
      showToast(\`Đã chuyển đơn #\${order.id} sang "\${statusLabel}"!\`, 'success');
      if (selectedOrderForDetail && selectedOrderForDetail.id === order.id) {
        setSelectedOrderForDetail({
          ...selectedOrderForDetail,
          status: nextStatus as any
        });
      }
    } catch {
      showToast('Lỗi khi cập nhật trạng thái', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Real orders exclusively from Cloudflare D1 (NO MOCK DATA)
  const allOrdersList: OrderRecord[] = orders.map((o) => ({
    ...o,
    id: o.id,
    finalTotal: o.finalTotal || (o as any).total_amount || o.subtotal || 0,
    branchName: o.branchName || (o as any).branch_name || 'HONNE 183 Cộng Hòa'
  }));

  // Deduplicate by ID
  const uniqueOrders = Array.from(new Map(allOrdersList.map((o) => [o.id, o])).values());`;

const mockStartIndex = code.indexOf(oldMockTarget);
const mockEndIndex = code.indexOf(oldMockEnd);

if (mockStartIndex !== -1 && mockEndIndex !== -1) {
  code = code.slice(0, mockStartIndex) + newOrdersBinding + code.slice(mockEndIndex + oldMockEnd.length);
  console.log('Successfully replaced defaultMockOrders with real D1 binding and advance handler');
} else {
  console.warn('Could not find mock orders section boundaries');
}

// 3. Replace hardcoded KPI counts
const oldKpiTarget = `  // KPI counts
  const totalCount = uniqueOrders.length >= 1248 ? uniqueOrders.length : 1248;
  const completedCount = 1120;
  const brewingCount = 56;
  const cancelledCount = 72;`;

const newKpiTarget = `  // Real KPI counts computed 100% dynamically from Cloudflare D1
  const totalCount = uniqueOrders.length;
  const completedCount = uniqueOrders.filter((o) => o.status === 'completed' || o.status === 'delivered').length;
  const brewingCount = uniqueOrders.filter((o) => o.status === 'brewing' || o.status === 'pending' || o.status === 'confirmed').length;
  const cancelledCount = uniqueOrders.filter((o) => o.status === 'cancelled').length;`;

if (code.includes(oldKpiTarget)) {
  code = code.replace(oldKpiTarget, newKpiTarget);
  console.log('Successfully replaced KPI counts');
}

// 4. Fix product detail item title (line 619)
code = code.replace(
  '<h4 className="font-bold text-xs text-stone-900 truncate">{item.productName}</h4>',
  '<h4 className="font-bold text-xs text-stone-900 truncate">{getItemName(item)}</h4>'
);

// 5. Fix table productSummary and 1-Click Action Button in table row
const oldRowProductTarget = `                const productSummary = o.items?.map((it) => \`\${it.productName}\${it.quantity > 1 ? \` (x\${it.quantity})\` : ''}\`).join(', ') || 'Cà Phê Muối';`;

const newRowProductTarget = `                const productSummary = (o.items && o.items.length > 0)
                  ? o.items.map((it: any) => \`\${getItemName(it)}\${it.quantity > 1 ? \` (x\${it.quantity})\` : ''}\`).join(', ')
                  : 'Cà phê HONNE';`;

if (code.includes(oldRowProductTarget)) {
  code = code.replace(oldRowProductTarget, newRowProductTarget);
  console.log('Successfully fixed table product summary');
}

// 6. Replace table columns to include 1-Click Progress action
const oldTableHead = `<th className="py-3 px-3">Thời gian đặt</th>
                <th className="py-3 px-3 text-right">Thao tác</th>`;

const newTableHead = `<th className="py-3 px-3">Thời gian đặt</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-right">Thao tác nhanh (1-Click)</th>`;

if (code.includes(oldTableHead)) {
  code = code.replace(oldTableHead, newTableHead);
}

const oldRowActions = `                    {/* Status Pill -> Opens Modal Screen 3 */}
                    <td className="py-3.5 px-3 text-center">
                      {renderStatusPill(o.status, () => {
                        setStatusModalOrder(o);
                        setTargetNewStatus(o.status);
                      })}
                    </td>

                    {/* Action 3-dots Menu -> Opens Modal Screen 4 */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setActionModalOrder(o)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition cursor-pointer"
                        title="Thao tác"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>`;

const newRowActions = `                    {/* Status Pill -> Opens Modal Screen 3 */}
                    <td className="py-3.5 px-3 text-center">
                      {renderStatusPill(o.status, () => {
                        setStatusModalOrder(o);
                        setTargetNewStatus(o.status);
                      })}
                    </td>

                    {/* Action 1-Click & 3-dots Menu */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.status === 'pending' && (
                          <button
                            onClick={() => handleAdvanceStatus(o, 'brewing')}
                            disabled={updatingOrderId === o.id}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#071F14] text-[11px] font-black flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Tiếp nhận đơn và chuyển vào quầy pha chế"
                          >
                            <Coffee className="w-3.5 h-3.5" />
                            <span>Nhận & Pha chế</span>
                          </button>
                        )}

                        {o.status === 'brewing' && (
                          <button
                            onClick={() => handleAdvanceStatus(o, 'shipping')}
                            disabled={updatingOrderId === o.id}
                            className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Pha xong, bàn giao cho shipper / sẵn sàng lấy"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Bàn giao Shipper</span>
                          </button>
                        )}

                        {o.status === 'shipping' && (
                          <button
                            onClick={() => handleAdvanceStatus(o, 'completed')}
                            disabled={updatingOrderId === o.id}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Xác nhận khách đã nhận đồ uống và thanh toán"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã giao - Hoàn tất</span>
                          </button>
                        )}

                        {o.status === 'completed' && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            ✓ Hoàn thành
                          </span>
                        )}

                        {o.status === 'cancelled' && (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                            ✕ Đã hủy
                          </span>
                        )}

                        <button
                          onClick={() => setActionModalOrder(o)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition cursor-pointer"
                          title="Thao tác khác"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>`;

if (code.includes(oldRowActions)) {
  code = code.replace(oldRowActions, newRowActions);
  console.log('Successfully added 1-click action buttons to table rows');
} else {
  console.warn('Could not find oldRowActions target');
}

if (isCrlf) code = code.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, code, 'utf8');
console.log('Finished writing updated AdminOrdersTab.tsx');
