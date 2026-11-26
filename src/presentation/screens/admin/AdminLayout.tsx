import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  UserCheck,
  Megaphone,
  Coffee,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronDown,
  LogOut,
  Building2,
  Crown,
  Bell,
  Menu,
  X,
  Store,
  ShoppingBag,
  AlertTriangle,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export type AdminTabType =
  | 'dashboard'
  | 'orders'
  | 'customers'
  | 'revenue'
  | 'staff'
  | 'promotions'
  | 'menu'
  | 'reports'
  | 'permissions'
  | 'settings';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  orders?: any[];
}

const BRANCHES = [
  { id: 'all', name: 'Toàn hệ thống (4 chi nhánh)' },
  { id: 'branch-183-cong-hoa', name: 'HONNE 183 Cộng Hòa' },
  { id: 'branch-2-quach-van-tuan', name: 'HONNE Số 2 Quách Văn Tuấn' },
  { id: 'branch-121-cong-hoa', name: 'HONNE 121 Cộng Hòa' },
  { id: 'branch-22a-cong-hoa', name: 'HONNE 22A Cộng Hòa' }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  selectedBranch,
  setSelectedBranch,
  orders = []
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRangeText, setDateRangeText] = useState('01/11/2026 - 30/11/2026');
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  // Derive notifications dynamically from real D1 orders + system events
  const notifications = React.useMemo(() => {
    const list: any[] = [];

    // Real orders from Cloudflare D1
    if (orders && orders.length > 0) {
      orders.slice(0, 8).forEach((o: any) => {
        const id = `order-${o.id}`;
        const itemName = o.items?.[0]?.product_name || o.items?.[0]?.name || 'Đồ uống HONNE';
        const total = Number(o.finalTotal || o.total_amount || 0).toLocaleString('vi-VN');
        const branchFound = BRANCHES.find((b) => b.id === o.branchId || b.id === o.branch_id);
        const branchLabel = branchFound ? branchFound.name : 'Chi nhánh Tân Bình';
        const isPending = o.status === 'pending';
        const isProcessing = o.status === 'processing';

        list.push({
          id,
          title: `Đơn hàng #${o.id}`,
          desc: `Khách ${o.customerName || o.customer_name || 'Khách'} đặt ${itemName} (${total}đ) • ${branchLabel}`,
          time: o.createdAt
            ? new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : 'Vừa xong',
          type: 'order' as const,
          unread: !readNotifIds.has(id) && (isPending || isProcessing),
          targetTab: 'orders' as AdminTabType,
          badge: isPending ? 'MỚI ĐẶT' : isProcessing ? 'ĐANG PHA CHẾ' : 'HOÀN THÀNH',
          badgeColor: isPending
            ? 'bg-emerald-100 text-emerald-800'
            : isProcessing
            ? 'bg-amber-100 text-amber-800'
            : 'bg-stone-100 text-stone-600'
        });
      });
    }

    // System KPIs & Milestones
    list.push({
      id: 'sys-revenue',
      title: 'Mục tiêu Doanh thu hôm nay',
      desc: 'Hệ thống vận hành ổn định trên Cloudflare D1. Tự động đồng bộ báo cáo ca.',
      time: '15 phút trước',
      type: 'revenue' as const,
      unread: !readNotifIds.has('sys-revenue'),
      targetTab: 'revenue' as AdminTabType,
      badge: 'DOANH THU',
      badgeColor: 'bg-blue-100 text-blue-800'
    });

    list.push({
      id: 'sys-crm',
      title: 'Thành viên thăng hạng VIP Gold',
      desc: 'Hệ thống tự động quy đổi điểm tích lũy và cập nhật quyền lợi hạng thành viên.',
      time: '1 giờ trước',
      type: 'crm' as const,
      unread: !readNotifIds.has('sys-crm'),
      targetTab: 'customers' as AdminTabType,
      badge: 'VIP CRM',
      badgeColor: 'bg-amber-100 text-amber-800'
    });

    return list;
  }, [orders, readNotifIds]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setReadNotifIds(new Set(notifications.map((n) => n.id)));
    showToast('Đã đánh dấu tất cả thông báo là đã đọc.', 'info');
  };

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    setReadNotifIds((prev) => new Set([...prev, notif.id]));
    setShowNotificationMenu(false);
    setActiveTab(notif.targetTab);
  };

  const isSuperAdmin = user?.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('honne_admin_token');
    localStorage.removeItem('honne_admin_refresh_token');
    localStorage.removeItem('honne_admin_user');
    localStorage.removeItem('honne_access_token');
    localStorage.removeItem('honne_refresh_token');
    localStorage.removeItem('honne_auth_user');
    logout();
    showToast('Đã đăng xuất khỏi cổng quản trị an toàn.', 'info');
    navigate('/admin/login', { replace: true });
  };

  // Exactly matching the 10 sidebar items from the user's template
  const sidebarNavItems: {
    id: AdminTabType;
    label: string;
    icon: React.ElementType;
    hasChevron?: boolean;
    adminOnly?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Đơn hàng', icon: Calendar, hasChevron: true },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'revenue', label: 'Doanh thu', icon: TrendingUp },
    { id: 'staff', label: 'Nhân viên', icon: UserCheck },
    { id: 'promotions', label: 'Khuyến mãi', icon: Megaphone },
    { id: 'menu', label: 'Menu & Sản phẩm', icon: Coffee },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3, hasChevron: true },
    { id: 'permissions', label: 'Phân quyền', icon: ShieldCheck, adminOnly: true },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-stone-900 flex font-sans antialiased selection:bg-[#F5C518] selection:text-[#0B281A]">
      {/* 1. Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Enterprise Deep Forest Green Sidebar (#0B281A) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2618] text-white flex flex-col justify-between border-r border-[#153D28] transition-transform duration-300 shadow-2xl lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo & Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {/* Brand Logo Header */}
          <div className="p-5 border-b border-[#153D28]/70 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#F5C518] text-[#0A2618] flex items-center justify-center font-black shadow-md shrink-0 group-hover:scale-105 transition">
                <Coffee className="w-5 h-5 text-[#0A2618]" />
              </div>
              <div>
                <div className="font-black text-xl text-[#F5C518] tracking-widest leading-none">
                  HONNE
                </div>
                <div className="text-[9px] text-[#A7C9B8] font-bold tracking-[0.22em] uppercase mt-1">
                  ENTERPRISE CRM & ERP
                </div>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (10 features) */}
          <nav className="p-3 space-y-1.5">
            {sidebarNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F5C518] text-[#0A2618] shadow-md font-black'
                      : 'text-[#D3E2D8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0A2618]' : 'text-[#8DAFA0]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.hasChevron && (
                    <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'text-[#0A2618]' : 'text-[#6C8E7F]'}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Leaves Watermark Area */}
        <div className="p-3 border-t border-[#153D28]/80 bg-[#071F14]/70 relative overflow-hidden">
          {/* Subtle tea leaves watermark SVG */}
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-15 translate-x-3 translate-y-3">
            <svg width="120" height="120" viewBox="0 0 200 200" fill="none">
              <path
                d="M50 150 C70 100, 150 70, 190 20 C140 50, 90 90, 50 150 Z"
                fill="#F5C518"
              />
              <path
                d="M20 180 C40 130, 110 110, 160 80 C110 110, 60 140, 20 180 Z"
                fill="#52B788"
              />
            </svg>
          </div>

          {/* User Profile Card */}
          <div className="p-2 rounded-2xl flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full ring-2 ring-[#F5C518] bg-stone-100 overflow-hidden shrink-0">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user?.name || 'Admin'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-xs text-white truncate">
                  {user?.name || 'Trần Minh Quân'}
                </div>
                <div className="text-[10px] text-[#F5C518] font-bold flex items-center gap-1 mt-0.5">
                  <Crown className="w-3 h-3 text-[#F5C518]" />
                  <span>Super Admin</span>
                </div>
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-black/25 hover:bg-rose-950/40 text-stone-300 hover:text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#1E4D34]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Content Container (Warm Cream Canvas #FAF6EE) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen bg-[#FAF6EE]">
        {/* Top Header Bar matching user's template */}
        <header className="sticky top-0 z-30 bg-[#FAF6EE]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-[#ECE2D0]/80 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Branch Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#E4D9C6] text-stone-700 shadow-xs"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Chi nhánh Dropdown Card */}
            <div className="bg-white rounded-2xl px-3.5 py-1.5 border border-[#E6DCC8] shadow-xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#0A2618] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-[#0A2618]" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block leading-none">
                  Chi nhánh
                </span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="font-extrabold text-xs text-stone-900 bg-transparent focus:outline-hidden cursor-pointer"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right: Notifications & Date Filter Pill */}
          <div className="flex items-center gap-3">
            {/* Notification Bell with Dropdown Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className={`relative p-2.5 rounded-2xl border transition shadow-xs cursor-pointer ${
                  showNotificationMenu
                    ? 'bg-[#0A2618] text-[#F5C518] border-[#0A2618]'
                    : 'bg-white border-[#E6DCC8] text-stone-700 hover:text-[#0A2618]'
                }`}
                title="Trung tâm thông báo"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-mono font-black text-[9px] flex items-center justify-center ring-2 ring-[#FAF6EE] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotificationMenu && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotificationMenu(false)}
                  />

                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-[#EDE2D0] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-[#0A2618] to-[#14422B] text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#F5C518]" />
                        <span className="font-extrabold text-sm">Thông Báo Hệ Thống</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-black text-[10px]">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-bold text-emerald-200 hover:text-white flex items-center gap-1 transition cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Đọc tất cả</span>
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3.5 transition cursor-pointer hover:bg-amber-50/40 flex items-start gap-3 ${
                            item.unread ? 'bg-amber-50/20' : 'bg-white opacity-80'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              item.type === 'order'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.type === 'revenue'
                                ? 'bg-blue-100 text-blue-800'
                                : item.type === 'crm'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.type === 'order' && <ShoppingBag className="w-4 h-4" />}
                            {item.type === 'revenue' && <TrendingUp className="w-4 h-4" />}
                            {item.type === 'crm' && <Crown className="w-4 h-4" />}
                            {item.type === 'inventory' && <AlertTriangle className="w-4 h-4" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-stone-900 truncate">
                                {item.title}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${item.badgeColor}`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                              {item.desc}
                            </p>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-stone-400">
                              <span>{item.time}</span>
                              <span className="text-[#103B27] font-bold hover:underline">
                                Xem chi tiết →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
                      <span className="text-[11px] text-stone-500 font-medium">
                        Cập nhật tự động thời gian thực từ Cloudflare D1
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Date Range Picker Pill */}
            <div className="bg-white rounded-2xl px-3.5 py-2 border border-[#E6DCC8] shadow-xs flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer hover:border-[#0A2618]/30 transition">
              <Calendar className="w-3.5 h-3.5 text-[#0A2618]" />
              <span>{dateRangeText}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
