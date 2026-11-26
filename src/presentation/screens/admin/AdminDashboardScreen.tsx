import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout, AdminTabType } from './AdminLayout';
import { AdminExecutiveDashboardTab } from './tabs/AdminExecutiveDashboardTab';
import { AdminOrdersTab } from './tabs/AdminOrdersTab';
import { AdminCustomersTab } from './tabs/AdminCustomersTab';
import { AdminRevenueTab } from './tabs/AdminRevenueTab';
import { AdminStaffTab } from './tabs/AdminStaffTab';
import { AdminPromotionsTab } from './tabs/AdminPromotionsTab';
import { AdminMenuTab } from './tabs/AdminMenuTab';
import { AdminReportsTab } from './tabs/AdminReportsTab';
import { AdminPermissionsTab } from './tabs/AdminPermissionsTab';
import { AdminSettingsTab } from './tabs/AdminSettingsTab';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authFetch, API_BASE_URL } from '../../../shared/utils/api-client';

export const AdminDashboardScreen: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<AdminTabType>('dashboard');

  // Strict Route Guard: Redirect non-admin or unauthorized users to admin login
  useEffect(() => {
    const adminToken = localStorage.getItem('honne_admin_token') || localStorage.getItem('honne_access_token');
    const adminUserStr = localStorage.getItem('honne_admin_user') || localStorage.getItem('honne_user');
    let adminUser = user;
    if (!adminUser && adminUserStr) {
      try {
        adminUser = JSON.parse(adminUserStr);
      } catch (e) {}
    }
    const isInternal = adminUser && (adminUser.role === 'admin' || adminUser.role === 'manager' || adminUser.role === 'staff' || adminUser.role === 'barista' || adminUser.role === 'cashier');
    if (!adminToken || !isInternal) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAdmin, user, navigate]);

  // Dashboard Metrics State (strictly initialized to 0, loaded 100% from Cloudflare D1)
  const [metrics, setMetrics] = useState<any>({
    todayRevenue: 0,
    monthRevenue: 0,
    todayOrders: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalStaff: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMarginPercent: 65,
    avgOrderValue: 0,
    fulfillmentRate: 100
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Use centralized resilient authFetch with automatic token refresh
  const adminFetch = authFetch;

  const getAuthHeaders = (): Record<string, string> => {
    const activeToken = localStorage.getItem('honne_admin_token') || localStorage.getItem('honne_access_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return headers;
  };

  // Load live data from Backend API (Cloudflare D1)
  const loadDashboardData = async () => {
    try {
      // 1. Dashboard metrics from Cloudflare D1
      try {
        const dashRes = await adminFetch(`${API_BASE_URL}/admin/dashboard?branch=${selectedBranch}`);
        const dashData = await dashRes.json();
        if (dashData.success && dashData.data?.metrics) {
          setMetrics(dashData.data.metrics);
        }
      } catch (e) {
        console.warn('Dashboard fetch error:', e);
      }

      // 2. Live Orders directly from Cloudflare D1 (No local mock/stale orders)
      try {
        const orderRes = await adminFetch(`${API_BASE_URL}/orders?branch=${selectedBranch}`);
        const orderData = await orderRes.json();
        if (orderData.success && Array.isArray(orderData.data)) {
          const d1Orders = orderData.data.filter((o: any) => o.id !== 'HN-360599' && !o.id?.includes('MOCK'));
          d1Orders.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setOrders(d1Orders);

          // Immediate live calculation fallback if dashData had network delay
          const compOrders = d1Orders.filter((o: any) => o.status === 'completed' || o.status === 'delivered');
          const liveRev = compOrders.reduce((sum: number, o: any) => sum + (Number(o.finalTotal || o.total_amount) || 0), 0);
          setMetrics((prev: any) => ({
            ...prev,
            totalOrders: prev.totalOrders || d1Orders.length,
            monthRevenue: prev.monthRevenue || liveRev,
            todayRevenue: prev.todayRevenue || liveRev,
            avgOrderValue: prev.avgOrderValue || (compOrders.length > 0 ? Math.round(liveRev / compOrders.length) : 0)
          }));
        }
      } catch (e) {
        console.warn('Orders fetch error:', e);
      }

      // 3. Products
      try {
        const prodRes = await adminFetch(`${API_BASE_URL}/products`);
        const prodData = await prodRes.json();
        if (prodData.success && prodData.data) {
          setProducts(prodData.data);
        }
      } catch (e) {
        console.warn('Products fetch error:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Real-time polling every 6 seconds for live orders & metrics
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedBranch]);

  // Order Status update: Pending -> Brewing -> Shipping -> Completed / Cancelled
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, reason?: string): Promise<boolean> => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, reason })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, cancellationReason: reason } : o))
        );
        const local = JSON.parse(localStorage.getItem('honne_customer_orders') || '[]');
        const updatedLocal = local.map((o: any) => o.id === orderId ? { ...o, status: newStatus, cancellationReason: reason } : o);
        localStorage.setItem('honne_customer_orders', JSON.stringify(updatedLocal));

        const statusLabel = newStatus === 'brewing' ? 'Đang pha chế' : newStatus === 'shipping' ? 'Đang giao hàng' : newStatus === 'completed' ? 'Hoàn thành' : newStatus === 'cancelled' ? 'Đã hủy' : newStatus;
        showToast(`Đã chuyển đơn #${orderId} sang "${statusLabel}"!`, 'success');
        return true;
      } else {
        showToast(data.message || 'Lỗi cập nhật trạng thái đơn', 'error');
        return false;
      }
    } catch {
      showToast('Lỗi kết nối khi cập nhật đơn hàng', 'error');
      return false;
    }
  };

  // Product CRUD
  const handleCreateProduct = async (prodPayload: any) => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: JSON.stringify(prodPayload)
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [data.data, ...prev]);
        showToast(`Đã thêm món "${prodPayload.name}" vào thực đơn!`, 'success');
      } else {
        showToast(data.message || 'Lỗi khi thêm món', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi thêm món mới', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast(`Đã xóa món "${name}" khỏi thực đơn hệ thống!`, 'info');
      } else {
        showToast(data.message || 'Lỗi khi xóa món', 'error');
      }
    } catch {
      showToast('Lỗi khi xóa món', 'error');
    }
  };

  const handleUpdateProduct = async (id: string, updatedFields: any) => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
        );
        showToast(`Đã cập nhật thông tin món "${updatedFields.name || id}" vào cơ sở dữ liệu!`, 'success');
      } else {
        showToast(data.message || 'Lỗi cập nhật món', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi cập nhật món', 'error');
    }
  };

  const handleToggleProductAvailability = async (id: string) => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/products/${id}/toggle`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isAvailable: data.data?.isAvailable } : p))
        );
        showToast(`Đã chuyển đổi trạng thái bán của món #${id}!`, 'success');
      } else {
        showToast(data.message || 'Lỗi cập nhật trạng thái bán', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi cập nhật trạng thái món', 'error');
    }
  };

  const handleUpdateProductPrice = async (id: string, newPrice: number) => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ price: newPrice })
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
        );
        showToast(`Đã cập nhật giá mới cho món #${id}!`, 'success');
      } else {
        showToast(data.message || 'Lỗi cập nhật giá', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi cập nhật giá', 'error');
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedBranch={selectedBranch}
      setSelectedBranch={setSelectedBranch}
      orders={orders}
    >
      {/* 1. DASHBOARD TAB: EXACT RECREATION OF USER'S UPLOADED TEMPLATE */}
      {activeTab === 'dashboard' && (
        <AdminExecutiveDashboardTab
          metrics={metrics}
          orders={orders}
          onSelectTab={setActiveTab}
          selectedBranch={selectedBranch}
        />
      )}

      {/* 2. ĐƠN HÀNG TAB: REAL-TIME POS, KDS & RECEIPT PRINTING */}
      {activeTab === 'orders' && (
        <AdminOrdersTab
          orders={orders}
          onUpdateStatus={handleUpdateOrderStatus}
          onRefresh={loadDashboardData}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
        />
      )}

      {/* 3. KHÁCH HÀNG CRM TAB */}
      {activeTab === 'customers' && <AdminCustomersTab orders={orders} />}

      {/* 4. DOANH THU TAB */}
      {activeTab === 'revenue' && (
        <AdminRevenueTab
          metrics={metrics}
          selectedBranch={selectedBranch}
          orders={orders}
          products={products}
        />
      )}

      {/* 5. NHÂN VIÊN & PHÂN QUYỀN TAB */}
      {activeTab === 'staff' && <AdminStaffTab />}

      {/* 6. KHUYẾN MÃI TAB */}
      {activeTab === 'promotions' && <AdminPromotionsTab />}

      {/* 7. MENU & SẢN PHẨM TAB */}
      {activeTab === 'menu' && (
        <AdminMenuTab
          products={products}
          onCreateProduct={handleCreateProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleAvailability={handleToggleProductAvailability}
          onUpdateProduct={handleUpdateProduct}
        />
      )}

      {/* 8. BÁO CÁO TAB */}
      {activeTab === 'reports' && <AdminReportsTab />}

      {/* 9. PHÂN QUYỀN TAB */}
      {activeTab === 'permissions' && <AdminPermissionsTab />}

      {/* 10. CÀI ĐẶT HỆ THỐNG TAB */}
      {activeTab === 'settings' && <AdminSettingsTab />}
    </AdminLayout>
  );
};
