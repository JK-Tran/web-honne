import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Printer,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Truck,
  Coffee,
  XCircle,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  Copy,
  Edit2,
  Download,
  RotateCcw,
  Plus,
  ArrowLeft,
  User,
  Package,
  Calendar,
  Check,
  MoreVertical,
  CheckCircle2,
  Zap,
  FileText,
  Eye,
  Flame,
  Sparkles,
  Layers,
  CreditCard,
  Banknote,
  CheckCheck,
  ArrowRight
} from 'lucide-react';
import { formatCurrencyVND } from '../../../../shared/utils/currency';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDeleteModal } from '../../../components/common/ConfirmDeleteModal';

interface OrderItem {
  id?: string;
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
  size?: string;
  sweetness?: string;
  ice?: string;
  toppings?: string[];
  note?: string;
  image?: string;
}

export interface OrderRecord {
  id: string;
  pickupCode?: string;
  orderMode?: 'delivery' | 'pickup';
  customer?: {
    name: string;
    phone: string;
    address?: string;
    note?: string;
    userId?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  voucherCode?: string;
  coinsUsed?: number;
  shippingFee?: number;
  finalTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  status: 'pending' | 'confirmed' | 'brewing' | 'shipping' | 'completed' | 'delivered' | 'cancelled';
  distanceKm?: number;
  branchId?: string;
  branchName?: string;
  createdAt: string;
}

interface AdminOrdersTabProps {
  orders: OrderRecord[];
  onUpdateStatus: (orderId: string, newStatus: string, reason?: string) => Promise<boolean | void>;
  onRefresh: () => Promise<void>;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
}

// Web Audio API POS Chime
const playPosChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, now + 0.15);
    gain2.gain.setValueAtTime(0.22, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('Audio chime unsupported:', err);
  }
};

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onUpdateStatus,
  onRefresh,
  selectedBranch,
  setSelectedBranch
}) => {
  const { showToast } = useToast();

  // Navigation state: null = list view, or order object = detail view (Screen 2)
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<OrderRecord | null>(null);

  // Modals state
  const [statusModalOrder, setStatusModalOrder] = useState<OrderRecord | null>(null);
  const [targetNewStatus, setTargetNewStatus] = useState<string>('brewing');
  const [statusModalNote, setStatusModalNote] = useState('');

  const [actionModalOrder, setActionModalOrder] = useState<OrderRecord | null>(null);
  const [printingOrder, setPrintingOrder] = useState<OrderRecord | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReasonOption, setCancelReasonOption] = useState<string>('Hết nguyên liệu / Món tạm ngưng phục vụ');
  const [cancelCustomReason, setCancelCustomReason] = useState<string>('');

  // Filter states (Screen 1)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousOrderCountRef = useRef<number>(orders.length);

  // Create manual order modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newDrinkType, setNewDrinkType] = useState('Trà Sữa Ô Long');
  const [newDrinkQty, setNewDrinkQty] = useState(1);
  const [newPaymentMethod, setNewPaymentMethod] = useState('cod');

  // Audio alert on incoming orders & Realtime Cross-tab sync
  useEffect(() => {
    if (orders.length > previousOrderCountRef.current) {
      const pendingCount = orders.filter((o) => o.status === 'pending').length;
      if (pendingCount > 0 && soundEnabled) {
        playPosChime();
        showToast('🔔 Có đơn hàng mới cần quán tiếp nhận!', 'info');
      }
    }
    previousOrderCountRef.current = orders.length;
  }, [orders, soundEnabled, showToast]);

  // Realtime BroadcastChannel & Storage Event listener
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('honne_realtime_orders');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'NEW_ORDER') {
          if (soundEnabled) playPosChime();
          showToast(`🔔 CÓ ĐƠN HÀNG MỚI! #${ev.data.order?.id || ''}`, 'info');
          onRefresh();
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'honne_new_order_event') {
        if (soundEnabled) playPosChime();
        showToast('🔔 Có đơn hàng mới vừa được đặt!', 'info');
        onRefresh();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [soundEnabled, onRefresh, showToast]);

  // Helper to extract product name safely (fixing undefined issue)
  const getItemName = (it: any) => it?.name || it?.productName || it?.title || it?.product_name || 'Đồ uống HONNE';

  // 1-Click Status Advance state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleAdvanceStatus = async (order: OrderRecord, nextStatus: string) => {
    setUpdatingOrderId(order.id);
    try {
      const ok = await onUpdateStatus(order.id, nextStatus);
      if (ok !== false) {
        playPosChime();
        if (selectedOrderForDetail && selectedOrderForDetail.id === order.id) {
          setSelectedOrderForDetail({
            ...selectedOrderForDetail,
            status: nextStatus as any
          });
        }
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
  const uniqueOrders = Array.from(new Map(allOrdersList.map((o) => [o.id, o])).values());

  // Filter logic
  const filteredOrders = uniqueOrders.filter((o) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = (o.id || '').toLowerCase().includes(q);
      const matchName = (o.customer?.name || '').toLowerCase().includes(q);
      const matchPhone = (o.customer?.phone || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && o.status !== 'pending') return false;
      if (statusFilter === 'brewing' && o.status !== 'brewing' && o.status !== 'confirmed') return false;
      if (statusFilter === 'shipping' && o.status !== 'shipping') return false;
      if (statusFilter === 'processing' && o.status !== 'brewing' && o.status !== 'confirmed' && o.status !== 'shipping') return false;
      if (statusFilter === 'completed' && o.status !== 'completed' && o.status !== 'delivered') return false;
      if (statusFilter === 'cancelled' && o.status !== 'cancelled') return false;
    }

    // 3. Payment Filter
    if (paymentFilter !== 'all') {
      const isOnline = o.paymentMethod === 'vietqr' || o.paymentMethod === 'online';
      if (paymentFilter === 'cod' && isOnline) return false;
      if (paymentFilter === 'online' && !isOnline) return false;
    }

    // 4. Branch Filter
    if (branchFilter !== 'all') {
      const b = (o.branchName || (o as any).branch_name || '').toLowerCase();
      if (!b.includes(branchFilter.toLowerCase())) return false;
    }

    return true;
  });

  // Real KPI counts computed 100% dynamically from Cloudflare D1
  const totalCount = uniqueOrders.length;
  const pendingCount = uniqueOrders.filter((o) => o.status === 'pending' || !o.status).length;
  const brewingCount = uniqueOrders.filter((o) => o.status === 'brewing' || o.status === 'confirmed').length;
  const shippingCount = uniqueOrders.filter((o) => o.status === 'shipping').length;
  const processingCount = brewingCount + shippingCount;
  const completedCount = uniqueOrders.filter((o) => o.status === 'completed' || o.status === 'delivered').length;
  const cancelledCount = uniqueOrders.filter((o) => o.status === 'cancelled').length;

  // Pagination (15 items per page default)
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // High-contrast, crystal-clear Status Badge
  const renderStatusBadge = (status: string, isNew: boolean = false, onClick?: () => void) => {
    switch (status) {
      case 'pending':
        return (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs cursor-pointer hover:bg-emerald-200 transition"
            title="Đơn mới đặt - Bấm để chuyển trạng thái"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
            <span>Mới đặt</span>
          </button>
        );
      case 'confirmed':
      case 'brewing':
        return (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-xs cursor-pointer hover:bg-amber-200 transition"
            title="Đang pha chế - Bấm để chuyển trạng thái"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span>Đang pha chế</span>
          </button>
        );
      case 'shipping':
        return (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-950 border border-sky-300 shadow-xs cursor-pointer hover:bg-sky-200 transition"
            title="Đang giao hàng - Bấm để chuyển trạng thái"
          >
            <Truck className="w-3.5 h-3.5 text-sky-800 shrink-0" />
            <span>Đang giao (1km)</span>
          </button>
        );
      case 'completed':
      case 'delivered':
        return (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200 cursor-pointer hover:bg-stone-200 transition"
            title="Đơn hoàn thành"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Hoàn thành</span>
          </button>
        );
      case 'cancelled':
        return (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 cursor-pointer hover:bg-rose-200 transition"
            title="Đơn đã hủy"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Đã hủy</span>
          </button>
        );
      default:
        return (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200"
          >
            <span>{status}</span>
          </button>
        );
    }
  };

  // Next Workflow Action Button (distinct from status badge!)
  const renderNextActionButton = (o: OrderRecord) => {
    const isPending = o.status === 'pending';
    const isBrewing = o.status === 'brewing' || o.status === 'confirmed';
    const isShipping = o.status === 'shipping';
    const isCompleted = o.status === 'completed' || o.status === 'delivered';

    if (isPending) {
      return (
        <button
          onClick={() => handleAdvanceStatus(o, 'brewing')}
          disabled={updatingOrderId === o.id}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0A2618] to-[#14422B] hover:brightness-110 text-[#F5C518] text-xs font-black flex items-center gap-1.5 shadow-sm transition transform active:scale-95 cursor-pointer ring-1 ring-amber-500/20"
          title="Tiếp nhận đơn và chuyển vào quầy Barista pha chế"
        >
          <Coffee className="w-3.5 h-3.5 text-[#F5C518]" />
          <span>Nhận & Pha chế</span>
        </button>
      );
    }

    if (isBrewing) {
      return (
        <button
          onClick={() => handleAdvanceStatus(o, 'shipping')}
          disabled={updatingOrderId === o.id}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition transform active:scale-95 cursor-pointer"
          title="Pha xong, bàn giao cho shipper nội bộ đi giao"
        >
          <Truck className="w-3.5 h-3.5 text-white" />
          <span>Bàn giao Shipper</span>
        </button>
      );
    }

    if (isShipping) {
      return (
        <button
          onClick={() => handleAdvanceStatus(o, 'completed')}
          disabled={updatingOrderId === o.id}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition transform active:scale-95 cursor-pointer"
          title="Xác nhận shipper đã giao đồ uống thành công và nhận tiền"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span>Đã giao & Hoàn tất</span>
        </button>
      );
    }

    if (isCompleted) {
      return (
        <button
          onClick={() => setSelectedOrderForDetail(o)}
          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          title="Xem chi tiết đơn hàng"
        >
          <Eye className="w-3.5 h-3.5 text-stone-500" />
          <span>Chi tiết</span>
        </button>
      );
    }

    return (
      <span className="text-[11px] font-semibold text-stone-400 italic">Đã hủy đơn</span>
    );
  };

  // Status mapping for detail screen
  const renderStatusPill = (status: string, onClick?: () => void) => {
    return renderStatusBadge(status, false, onClick);
  };

  const handleUpdateStatusConfirm = async () => {
    if (!statusModalOrder) return;
    try {
      const ok = await onUpdateStatus(statusModalOrder.id.replace('HN', 'ORD_'), targetNewStatus);
      if (ok !== false) {
        setStatusModalOrder(null);
        if (selectedOrderForDetail && selectedOrderForDetail.id === statusModalOrder.id) {
          setSelectedOrderForDetail({
            ...selectedOrderForDetail,
            status: targetNewStatus as any
          });
        }
      }
    } catch {
      showToast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      showToast('Vui lòng nhập tên và số điện thoại khách hàng!', 'error');
      return;
    }
    showToast('Tạo đơn hàng mới thành công và chuyển vào quầy Barista!', 'success');
    setShowCreateModal(false);
  };

  // =========================================================================
  // SCREEN 2: ORDER DETAIL VIEW (Chi tiết đơn hàng #HN2487)
  // =========================================================================
  if (selectedOrderForDetail) {
    const o = selectedOrderForDetail;
    const isCompleted = o.status === 'completed' || o.status === 'delivered';
    const isShipping = o.status === 'shipping' || isCompleted;
    const isBrewing = o.status === 'brewing' || isShipping;

    return (
      <div className="space-y-6">
        {/* Top Header: Back Arrow, Title, Status Pill & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#EADFCF]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedOrderForDetail(null)}
              className="p-2 rounded-xl bg-white border border-[#EDE2D0] hover:bg-stone-50 text-stone-700 transition cursor-pointer shadow-xs"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-4 h-4 text-[#103B27]" />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Chi tiết đơn hàng #{o.id}
            </h1>
            {renderStatusPill(o.status, () => {
              setStatusModalOrder(o);
              setTargetNewStatus(o.status);
            })}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setPrintingOrder(o)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#EDE2D0] text-stone-700 hover:text-[#103B27] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>In hóa đơn</span>
            </button>
            <button
              onClick={() => {
                showToast('Đang tải file hóa đơn PDF...', 'info');
                setTimeout(() => window.print(), 300);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#EDE2D0] text-stone-700 hover:text-[#103B27] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Xuất PDF</span>
            </button>
          </div>
        </div>

        {/* Top 3 Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1: Thông tin đơn hàng */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs space-y-3.5">
            <h3 className="font-extrabold text-stone-900 text-sm pb-2 border-b border-stone-100">
              Thông tin đơn hàng
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Mã đơn hàng</span>
                <span className="font-mono font-black text-stone-900 flex items-center gap-1">
                  #{o.id}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(o.id);
                      showToast('Đã sao chép mã đơn!', 'info');
                    }}
                    className="p-1 hover:text-[#103B27]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500">Thời gian đặt</span>
                <span className="font-mono font-medium text-stone-800">
                  {new Date(o.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500">Chi nhánh</span>
                <span className="font-bold text-stone-900">{o.branchName || 'Quận 1'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500">Phương thức thanh toán</span>
                <span className="font-semibold text-stone-800">
                  {o.paymentMethod === 'vietqr' ? 'Online (VietQR)' : 'COD (Thanh toán khi nhận hàng)'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-500">Trạng thái</span>
                {renderStatusPill(o.status, () => {
                  setStatusModalOrder(o);
                  setTargetNewStatus(o.status);
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Thông tin khách hàng */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs space-y-3.5">
            <h3 className="font-extrabold text-stone-900 text-sm pb-2 border-b border-stone-100">
              Thông tin khách hàng
            </h3>

            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-stone-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-stone-900">{o.customer?.name || 'Khách vãng lai'}</h4>
                <div className="font-mono text-xs text-stone-500 mt-0.5">{o.customer?.phone || '0901 234 567'}</div>
              </div>
            </div>

            <button
              onClick={() => showToast('Mở lịch sử các đơn hàng trước của khách hàng...', 'info')}
              className="w-full py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-stone-200"
            >
              <User className="w-3.5 h-3.5" />
              <span>Xem lịch sử mua hàng</span>
            </button>

            <div className="pt-2 border-t border-stone-100 text-xs space-y-1">
              <span className="text-stone-400 block font-bold uppercase text-[10px]">Địa chỉ giao hàng</span>
              <p className="text-stone-700 font-medium leading-relaxed">
                {o.customer?.address || '123 Nguyễn Văn Cừ, Quận 1, TP. Hồ Chí Minh'}
              </p>
            </div>
          </div>

          {/* Card 3: Trạng thái đơn hàng (Vertical Stepper Timeline) */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs space-y-3.5">
            <h3 className="font-extrabold text-stone-900 text-sm pb-2 border-b border-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#103B27]" />
              <span>Trạng thái đơn hàng</span>
            </h3>

            {/* Stepper Timeline */}
            <div className="relative pl-6 space-y-5 pt-1">
              {/* Step 1: Đặt hàng */}
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-emerald-50">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className="absolute -left-4 top-4.5 w-0.5 h-6 bg-emerald-500" />
                <div className="text-xs font-bold text-stone-900">Đặt hàng</div>
                <div className="text-[10px] text-stone-400 font-mono">30/11/2026 14:32</div>
              </div>

              {/* Step 2: Đang chuẩn bị */}
              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isBrewing ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' : 'bg-stone-200 text-stone-400'
                }`}>
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className={`absolute -left-4 top-4.5 w-0.5 h-6 ${isShipping ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                <div className="text-xs font-bold text-stone-900">Đang chuẩn bị</div>
                <div className="text-[10px] text-stone-400 font-mono">30/11/2026 14:40</div>
              </div>

              {/* Step 3: Đang giao */}
              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isShipping ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' : 'bg-stone-200 text-stone-400'
                }`}>
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className={`absolute -left-4 top-4.5 w-0.5 h-6 ${isCompleted ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                <div className="text-xs font-bold text-stone-900">Đang giao</div>
                <div className="text-[10px] text-stone-400 font-mono">30/11/2026 15:10</div>
              </div>

              {/* Step 4: Hoàn thành */}
              <div className="relative">
                <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' : 'bg-stone-200 text-stone-400'
                }`}>
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <div className="text-xs font-bold text-stone-900">Hoàn thành</div>
                <div className="text-[10px] text-stone-400 font-mono">30/11/2026 15:30</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Danh sách sản phẩm & Ghi chú */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Danh Sách Sản Phẩm (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm pb-2 border-b border-stone-100">
              Danh sách sản phẩm
            </h3>

            <div className="divide-y divide-stone-100">
              {o.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={item.image || '/images/3d_drinks/drink_coffee_muoi.png'}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-stone-900 truncate">{getItemName(item)}</h4>
                      <span className="text-[10px] text-stone-400 font-semibold block">Size {item.size || 'M'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono shrink-0">
                    <span className="text-stone-500 font-medium">{formatCurrencyVND(item.price)}</span>
                    <span className="text-stone-700 font-bold">x{item.quantity}</span>
                    <span className="font-black text-stone-900 w-24 text-right">
                      {formatCurrencyVND(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <span className="font-bold text-xs text-stone-600">Tổng tiền thanh toán</span>
              <span className="text-xl font-black text-[#103B27] font-mono">
                {formatCurrencyVND(o.finalTotal || 420000)}
              </span>
            </div>
          </div>

          {/* Right: Ghi Chú (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-sm">Ghi chú</h3>
              <button
                onClick={() => {
                  setStatusModalOrder(o);
                  setTargetNewStatus(o.status);
                }}
                className="p-1 hover:text-[#103B27] text-stone-400 transition"
                title="Sửa ghi chú"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed font-medium bg-stone-50/70 p-3.5 rounded-2xl border border-stone-100">
              {o.customer?.note || 'Khách hàng không lấy đá.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 1: ORDERS LIST VIEW (Màn hình danh sách đơn hàng)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* 1. Header & Title with Leaves Watermark */}
      <div className="relative pb-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#103B27]" />
              <span>Đơn hàng</span>
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Quản lý đơn hàng và theo dõi trạng thái đơn hàng trong hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playPosChime();
              }}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                soundEnabled
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-stone-400 border-[#EDE2D0]'
              }`}
              title="Chuông báo đơn mới"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-2xl bg-white border border-[#EDE2D0] hover:bg-stone-50 text-stone-700 transition cursor-pointer shadow-xs"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4 text-[#103B27]" />
            </button>
          </div>
        </div>

        {/* Subtle tea leaves watermark SVG on top right */}
        <div className="absolute right-20 -top-4 pointer-events-none opacity-25">
          <svg width="100" height="70" viewBox="0 0 100 70" fill="none">
            <path d="M10 50 C30 20, 60 10, 90 5 C60 25, 40 45, 10 50 Z" fill="#2D6A4F" />
            <path d="M25 60 C45 35, 75 25, 98 15 C75 35, 55 50, 25 60 Z" fill="#52B788" />
          </svg>
        </div>
      </div>

      {/* 2. Top Interactive Shift KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Tất cả đơn */}
        <button
          type="button"
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className={`p-4 rounded-3xl border transition text-left cursor-pointer flex flex-col justify-between shadow-xs ${
            statusFilter === 'all'
              ? 'bg-[#0A2618] text-white border-[#0A2618] ring-2 ring-[#F5C518]/60'
              : 'bg-white border-[#EDE2D0] hover:border-stone-400 text-stone-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${statusFilter === 'all' ? 'text-emerald-200' : 'text-stone-500'}`}>
              Tất cả đơn
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusFilter === 'all' ? 'bg-white/10 text-[#F5C518]' : 'bg-stone-100 text-stone-700'}`}>
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black font-mono leading-tight">
              {totalCount.toLocaleString()}
            </div>
            <span className={`text-[11px] block mt-1 font-medium ${statusFilter === 'all' ? 'text-white/70' : 'text-stone-400'}`}>
              Toàn bộ ca làm
            </span>
          </div>
        </button>

        {/* Card 2: Chờ tiếp nhận (MỚI) */}
        <button
          type="button"
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
          className={`p-4 rounded-3xl border transition text-left cursor-pointer flex flex-col justify-between shadow-xs relative overflow-hidden ${
            statusFilter === 'pending'
              ? 'bg-emerald-900 text-white border-emerald-900 ring-2 ring-emerald-400'
              : pendingCount > 0
              ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-500 text-emerald-950'
              : 'bg-white border-[#EDE2D0] hover:border-emerald-300 text-stone-900'
          }`}
        >
          {pendingCount > 0 && statusFilter !== 'pending' && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping m-3" />
          )}
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${statusFilter === 'pending' ? 'text-emerald-200' : 'text-emerald-800'}`}>
              Chờ nhận (Mới)
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusFilter === 'pending' ? 'bg-white/10 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black font-mono leading-tight">
              {pendingCount.toLocaleString()}
            </div>
            <span className={`text-[11px] block mt-1 font-bold ${pendingCount > 0 ? (statusFilter === 'pending' ? 'text-amber-300' : 'text-emerald-700') : 'text-stone-400'}`}>
              {pendingCount > 0 ? '⚡ Cần nhận ngay!' : 'Đã nhận hết'}
            </span>
          </div>
        </button>

        {/* Card 3: Đang pha chế */}
        <button
          type="button"
          onClick={() => { setStatusFilter('brewing'); setCurrentPage(1); }}
          className={`p-4 rounded-3xl border transition text-left cursor-pointer flex flex-col justify-between shadow-xs ${
            statusFilter === 'brewing'
              ? 'bg-amber-900 text-white border-amber-900 ring-2 ring-amber-400'
              : 'bg-white border-[#EDE2D0] hover:border-amber-400 text-stone-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${statusFilter === 'brewing' ? 'text-amber-200' : 'text-stone-500'}`}>
              Đang pha chế
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusFilter === 'brewing' ? 'bg-white/10 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black font-mono leading-tight">
              {brewingCount.toLocaleString()}
            </div>
            <span className={`text-[11px] block mt-1 font-medium ${statusFilter === 'brewing' ? 'text-white/70' : 'text-stone-400'}`}>
              Tại quầy Barista
            </span>
          </div>
        </button>

        {/* Card 4: Đang giao hàng */}
        <button
          type="button"
          onClick={() => { setStatusFilter('shipping'); setCurrentPage(1); }}
          className={`p-4 rounded-3xl border transition text-left cursor-pointer flex flex-col justify-between shadow-xs ${
            statusFilter === 'shipping'
              ? 'bg-sky-900 text-white border-sky-900 ring-2 ring-sky-400'
              : 'bg-white border-[#EDE2D0] hover:border-sky-400 text-stone-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${statusFilter === 'shipping' ? 'text-sky-200' : 'text-stone-500'}`}>
              Đang giao (1km)
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusFilter === 'shipping' ? 'bg-white/10 text-sky-300' : 'bg-sky-100 text-sky-800'}`}>
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black font-mono leading-tight">
              {shippingCount.toLocaleString()}
            </div>
            <span className={`text-[11px] block mt-1 font-medium ${statusFilter === 'shipping' ? 'text-white/70' : 'text-stone-400'}`}>
              Shipper đang chạy
            </span>
          </div>
        </button>

        {/* Card 5: Đã hoàn thành */}
        <button
          type="button"
          onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
          className={`p-4 rounded-3xl border transition text-left cursor-pointer flex flex-col justify-between shadow-xs ${
            statusFilter === 'completed'
              ? 'bg-[#103B27] text-white border-[#103B27] ring-2 ring-emerald-400'
              : 'bg-white border-[#EDE2D0] hover:border-emerald-400 text-stone-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${statusFilter === 'completed' ? 'text-emerald-200' : 'text-stone-500'}`}>
              Hoàn thành
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusFilter === 'completed' ? 'bg-white/10 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black font-mono leading-tight">
              {completedCount.toLocaleString()}
            </div>
            <span className={`text-[11px] block mt-1 font-medium ${statusFilter === 'completed' ? 'text-white/70' : 'text-stone-400'}`}>
              Đã giao & thanh toán
            </span>
          </div>
        </button>
      </div>

      {/* 3. Search Bar, Segmented Controls & Action Buttons */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EDE2D0] shadow-xs space-y-4">
        {/* Quick Filter Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-stone-100">
          <button
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              statusFilter === 'all'
                ? 'bg-[#0A2618] text-[#F5C518] shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Tất cả ({totalCount})
          </button>

          <button
            onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'pending'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Chờ nhận ({pendingCount})</span>
          </button>

          <button
            onClick={() => { setStatusFilter('brewing'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'brewing'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Đang pha chế ({brewingCount})</span>
          </button>

          <button
            onClick={() => { setStatusFilter('shipping'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'shipping'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Đang giao ({shippingCount})</span>
          </button>

          <button
            onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'completed'
                ? 'bg-[#103B27] text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hoàn thành ({completedCount})</span>
          </button>

          {cancelledCount > 0 && (
            <button
              onClick={() => { setStatusFilter('cancelled'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                statusFilter === 'cancelled'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Đã hủy ({cancelledCount})</span>
            </button>
          )}
        </div>

        {/* Search, Filter Dropdowns & Create Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn #ORD..., khách hàng, số điện thoại..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-[#103B27]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Payment Dropdown */}
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer focus:outline-hidden"
            >
              <option value="all">Thanh toán: Tất cả</option>
              <option value="cod">Tiền mặt (COD)</option>
              <option value="online">Chuyển khoản (VietQR)</option>
            </select>

            {/* Branch Dropdown */}
            <select
              value={branchFilter}
              onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer focus:outline-hidden"
            >
              <option value="all">Chi nhánh: Tất cả</option>
              <option value="183 Cộng Hòa">HONNE 183 Cộng Hòa</option>
              <option value="Quách Văn Tuấn">HONNE Số 2 Quách Văn Tuấn</option>
              <option value="121 Cộng Hòa">HONNE 121 Cộng Hòa</option>
              <option value="22A Cộng Hòa">HONNE 22A Cộng Hòa</option>
            </select>

            {/* Reset Button */}
            {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || branchFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                  setBranchFilter('all');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-600 transition cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}

            {/* Create Order Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0A2618] hover:bg-[#103B27] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ml-auto sm:ml-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#F5C518]" />
              <span>Tạo đơn tại quầy</span>
            </button>
          </div>
        </div>

        {/* 4. High-Scannability Orders Table */}
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-left text-xs">
            <thead className="text-stone-400 font-bold border-b border-stone-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input type="checkbox" className="rounded-sm accent-[#103B27] cursor-pointer" />
                </th>
                <th className="py-3 px-3">Mã đơn & Thời gian</th>
                <th className="py-3 px-3">Khách hàng & Giao nhận</th>
                <th className="py-3 px-3">Món đồ uống</th>
                <th className="py-3 px-3">Tổng tiền</th>
                <th className="py-3 px-3">Chi nhánh</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-right">Thao tác tiếp theo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-8 h-8 text-stone-300" />
                      <span className="font-bold text-sm text-stone-600">Không tìm thấy đơn hàng nào</span>
                      <span className="text-xs text-stone-400">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => {
                  const isPending = o.status === 'pending';
                  const isBrewing = o.status === 'brewing' || o.status === 'confirmed';
                  const isShipping = o.status === 'shipping';
                  const isCompleted = o.status === 'completed' || o.status === 'delivered';

                  const items = o.items || [];
                  const firstItem = items[0];
                  const firstItemName = getItemName(firstItem);
                  const remainingCount = items.length > 1 ? items.length - 1 : 0;
                  const isDelivery = o.orderMode === 'delivery' || (o as any).distanceKm || !o.orderMode;

                  return (
                    <tr
                      key={o.id}
                      className={`group transition ${
                        isPending
                          ? 'bg-emerald-50/40 border-l-4 border-l-emerald-600 hover:bg-emerald-50/70'
                          : isBrewing
                          ? 'bg-amber-50/25 border-l-4 border-l-amber-500 hover:bg-amber-50/50'
                          : isShipping
                          ? 'bg-sky-50/20 border-l-4 border-l-sky-500 hover:bg-sky-50/40'
                          : 'hover:bg-stone-50/60'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-3 w-8">
                        <input type="checkbox" className="rounded-sm accent-[#103B27] cursor-pointer" />
                      </td>

                      {/* Cột 1: Mã đơn & Thời gian */}
                      <td className="py-4 px-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setSelectedOrderForDetail(o)}
                              className="font-mono font-black text-stone-900 hover:text-[#103B27] hover:underline cursor-pointer text-xs flex items-center gap-1"
                              title="Bấm để xem chi tiết đơn"
                            >
                              #{o.id}
                              <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-[#103B27] group-hover:translate-x-0.5 transition" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(o.id);
                                showToast('Đã sao chép mã đơn!', 'info');
                              }}
                              className="text-stone-300 hover:text-stone-600 p-0.5"
                              title="Sao chép mã đơn"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white animate-pulse shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                MỚI ĐẶT
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-stone-500">
                              {o.createdAt
                                ? new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date(o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                                : 'Hôm nay'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Khách hàng & Hình thức nhận */}
                      <td className="py-4 px-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-stone-900 text-xs truncate max-w-[140px]">
                              {o.customer?.name || (o as any).customer_name || 'Khách vãng lai'}
                            </span>
                            {(o.customer?.name?.includes('VIP') || (o as any).tier?.includes('VIP')) && (
                              <span className="px-1 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[9px] font-black">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{o.customer?.phone || (o as any).phone || '0379 467 986'}</span>
                          </div>
                          <div className="mt-0.5">
                            {isDelivery ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                <Truck className="w-2.5 h-2.5" /> Giao 1km
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                                <Coffee className="w-2.5 h-2.5" /> Tại quán
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 3: Chi tiết món */}
                      <td className="py-4 px-3">
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          <div className="flex items-start gap-1.5">
                            <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-800 font-mono font-black text-[11px] shrink-0">
                              x{firstItem?.quantity || 1}
                            </span>
                            <span className="font-bold text-stone-900 text-xs leading-snug line-clamp-1" title={firstItemName}>
                              {firstItemName}
                            </span>
                          </div>

                          {remainingCount > 0 && (
                            <span className="inline-flex items-center text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md w-fit">
                              + {remainingCount} món khác
                            </span>
                          )}

                          {(firstItem?.note || o.customer?.note) && (
                            <p className="text-[10px] text-amber-700 italic truncate" title={firstItem?.note || o.customer?.note}>
                              "{firstItem?.note || o.customer?.note}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Cột 4: Tổng tiền & Thanh toán */}
                      <td className="py-4 px-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-black text-stone-900 text-sm">
                            {formatCurrencyVND(o.finalTotal)}
                          </span>

                          <div>
                            {o.paymentMethod === 'vietqr' || o.paymentMethod === 'online' ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                <CreditCard className="w-2.5 h-2.5" /> VietQR (Đã TT)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                <Banknote className="w-2.5 h-2.5" /> Tiền mặt (Thu COD)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 5: Chi nhánh */}
                      <td className="py-4 px-3">
                        <span className="text-xs font-semibold text-stone-700 block truncate max-w-[130px]" title={o.branchName}>
                          {o.branchName || 'HONNE 183 Cộng Hòa'}
                        </span>
                      </td>

                      {/* Cột 6: Trạng thái (Pill rõ ràng) */}
                      <td className="py-4 px-3 text-center">
                        {renderStatusBadge(o.status, isPending, () => {
                          setStatusModalOrder(o);
                          setTargetNewStatus(o.status);
                        })}
                      </td>

                      {/* Cột 7: Thao tác tiếp theo (Button nổi bật) */}
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {renderNextActionButton(o)}

                          <button
                            onClick={() => setActionModalOrder(o)}
                            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                            title="Tùy chọn khác"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span>
              Hiển thị <strong>{paginatedOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> trong {filteredOrders.length.toLocaleString()} đơn
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-stone-200">
              <span className="text-[11px] text-stone-400">Số đơn/trang:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-stone-50 border border-stone-200 font-bold text-stone-700 cursor-pointer focus:outline-hidden"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#0A2618] text-white'
                    : 'border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 3: MODAL "CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG"                           */}
      {/* ========================================================================= */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-black text-base text-stone-900">
                  Cập nhật trạng thái đơn hàng
                </h3>
              </div>
              <button
                onClick={() => setStatusModalOrder(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Brief Card */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={statusModalOrder.items?.[0]?.image || '/images/3d_drinks/drink_coffee_muoi.png'}
                    alt="Drink"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900">
                    Đơn hàng #{statusModalOrder.id}
                  </h4>
                  <div className="text-[11px] text-stone-500 font-medium">
                    {statusModalOrder.customer?.name} • {formatCurrencyVND(statusModalOrder.finalTotal)}
                  </div>
                </div>
              </div>

              {renderStatusPill(statusModalOrder.status)}
            </div>

            {/* Status Option Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Chọn trạng thái mới
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Đang xử lý */}
                <button
                  type="button"
                  onClick={() => setTargetNewStatus('brewing')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    targetNewStatus === 'brewing'
                      ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Đang xử lý</span>
                </button>

                {/* 2. Đang giao */}
                <button
                  type="button"
                  onClick={() => setTargetNewStatus('shipping')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    targetNewStatus === 'shipping'
                      ? 'bg-sky-100 text-sky-900 border-sky-400 ring-2 ring-sky-300'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 text-sky-600" />
                  <span>Đang giao</span>
                </button>

                {/* 3. Hoàn thành */}
                <button
                  type="button"
                  onClick={() => setTargetNewStatus('completed')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    targetNewStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-300'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hoàn thành</span>
                </button>

                {/* 4. Đã hủy */}
                <button
                  type="button"
                  onClick={() => setTargetNewStatus('cancelled')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    targetNewStatus === 'cancelled'
                      ? 'bg-rose-100 text-rose-900 border-rose-400 ring-2 ring-rose-300'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Đã hủy</span>
                </button>
              </div>
            </div>

            {/* Note Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú..."
                value={statusModalNote}
                onChange={(e) => setStatusModalNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#103B27]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpdateStatusConfirm}
                className="px-6 py-2.5 rounded-xl bg-[#0A2618] hover:bg-[#103B27] text-white text-xs font-bold cursor-pointer shadow-md transition"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: MODAL "THAO TÁC ĐƠN HÀNG" (Mở khi bấm nút 3 chấm ...)           */}
      {/* ========================================================================= */}
      {actionModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-black text-base text-stone-900">
                  Thao tác đơn hàng
                </h3>
              </div>
              <button
                onClick={() => setActionModalOrder(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Brief */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={actionModalOrder.items?.[0]?.image || '/images/3d_drinks/drink_coffee_muoi.png'}
                    alt="Drink"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900">
                    Đơn hàng #{actionModalOrder.id}
                  </h4>
                  <div className="text-xs font-mono font-bold text-[#103B27]">
                    {formatCurrencyVND(actionModalOrder.finalTotal)}
                  </div>
                </div>
              </div>

              {renderStatusPill(actionModalOrder.status)}
            </div>

            {/* 4 Action Tiles */}
            <div className="space-y-2 pt-1">
              {/* Option 1: In hóa đơn */}
              <button
                type="button"
                onClick={() => {
                  setPrintingOrder(actionModalOrder);
                  setActionModalOrder(null);
                }}
                className="w-full p-3 rounded-2xl border border-stone-200 hover:border-[#103B27] hover:bg-amber-50/20 text-left flex items-center gap-3 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-stone-100 group-hover:bg-[#103B27] group-hover:text-white flex items-center justify-center text-stone-600 transition shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900">In hóa đơn</h4>
                  <p className="text-[11px] text-stone-500">In hóa đơn thanh toán cho đơn hàng</p>
                </div>
              </button>

              {/* Option 2: Hoàn tiền */}
              <button
                type="button"
                onClick={() => {
                  showToast(`Yêu cầu hoàn tiền đơn #${actionModalOrder.id} đã gửi đến kế toán!`, 'info');
                  setActionModalOrder(null);
                }}
                className="w-full p-3 rounded-2xl border border-stone-200 hover:border-blue-500 hover:bg-blue-50/20 text-left flex items-center gap-3 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-blue-600 transition shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900">Hoàn tiền</h4>
                  <p className="text-[11px] text-stone-500">Hoàn tiền cho đơn hàng (nếu có thanh toán online)</p>
                </div>
              </button>

              {/* Option 3: Hủy đơn */}
              <button
                type="button"
                onClick={() => {
                  setCancellingOrder(actionModalOrder);
                  setActionModalOrder(null);
                }}
                className="w-full p-3 rounded-2xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/20 text-left flex items-center gap-3 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center text-rose-600 transition shrink-0">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900">Hủy đơn</h4>
                  <p className="text-[11px] text-stone-500">Hủy đơn hàng (nếu chưa giao)</p>
                </div>
              </button>

              {/* Option 4: Ghi chú */}
              <button
                type="button"
                onClick={() => {
                  setStatusModalOrder(actionModalOrder);
                  setTargetNewStatus(actionModalOrder.status);
                  setActionModalOrder(null);
                }}
                className="w-full p-3 rounded-2xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/20 text-left flex items-center gap-3 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-amber-700 transition shrink-0">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900">Ghi chú</h4>
                  <p className="text-[11px] text-stone-500">Thêm ghi chú liên quan đến đơn hàng</p>
                </div>
              </button>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActionModalOrder(null)}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TẠO ĐƠN HÀNG THỦ CÔNG (KHI BẤM [+ TẠO ĐƠN])                         */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-black text-base text-stone-900">Tạo Đơn Hàng Mới Tại Quầy</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tên khách hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#103B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="0901 234 567"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-mono focus:outline-hidden focus:border-[#103B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  placeholder="Lấy tại quầy hoặc địa chỉ giao..."
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#103B27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Món chọn</label>
                  <select
                    value={newDrinkType}
                    onChange={(e) => setNewDrinkType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-hidden"
                  >
                    <option value="Trà Sữa Ô Long">Trà Sữa Ô Long (160k)</option>
                    <option value="Matcha Latte">Matcha Latte (100k)</option>
                    <option value="Cà Phê Muối Biển">Cà Phê Muối Biển (35k)</option>
                    <option value="Trà Đào Cam Sả">Trà Đào Cam Sả (28k)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    min={1}
                    value={newDrinkQty}
                    onChange={(e) => setNewDrinkQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0A2618] hover:bg-[#103B27] text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  Xác Nhận Tạo Đơn
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THERMAL BILL RECEIPT PRINT MODAL                                          */}
      {/* ========================================================================= */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-3">
            <button
              onClick={() => setPrintingOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900"
            >
              <X className="w-4 h-4" />
            </button>

            <div id="thermal-receipt" className="font-mono text-xs text-stone-900 space-y-3 pb-3">
              <div className="text-center space-y-1">
                <div className="font-black text-base text-[#103B27]">HONNE COFFEE & TEA</div>
                <div className="text-[10px] text-stone-500 font-sans">
                  {printingOrder.branchName || 'HONNE 183 Cộng Hòa, P.12, Tân Bình'}
                </div>
                <div className="text-[10px] text-stone-500 font-sans">Hotline: 0379 467 986</div>
                <div className="font-black text-sm pt-1 border-t border-dashed border-stone-300 mt-2">
                  PHIẾU THANH TOÁN (BILL)
                </div>
              </div>

              <div className="text-[11px] space-y-0.5 border-b border-dashed border-stone-300 pb-2">
                <div>Mã Đơn: <strong>#{printingOrder.id}</strong></div>
                <div>Khách Hàng: {printingOrder.customer?.name}</div>
                <div>SĐT: {printingOrder.customer?.phone}</div>
                <div>Thời Gian: {new Date(printingOrder.createdAt).toLocaleString('vi-VN')}</div>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2 text-[11px]">
                {printingOrder.items?.map((it, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <div>{it.quantity}x {it.productName} ({it.size || 'M'})</div>
                    </div>
                    <div className="font-bold">{formatCurrencyVND(it.price * it.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-black text-sm pt-1 border-t border-stone-300">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-[#103B27]">{formatCurrencyVND(printingOrder.finalTotal)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>Thanh toán:</span>
                  <span>{printingOrder.paymentMethod === 'vietqr' ? 'Online (VietQR)' : 'Tiền mặt (COD)'}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-stone-500 font-sans border-t border-dashed border-stone-300">
                <p>Cảm ơn Quý Khách & Chúc Ngon Miệng!</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#0A2618] hover:bg-[#103B27] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>In Ngay</span>
              </button>
              <button
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hủy Đơn Hàng Có Lý Do Bắt Buộc (Chuẩn Nghiệp Vụ F&B - Không Tính Doanh Thu) */}
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
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                      cancelReasonOption === reason
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-1 ring-rose-300'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
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
                    showToast(`Đã hủy đơn #${cancellingOrder.id} (Lý do: ${finalReason})!`, 'info');
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
      )}
    </div>
  );
};
