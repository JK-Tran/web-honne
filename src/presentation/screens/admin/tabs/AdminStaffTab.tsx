import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Building2,
  Lock,
  Mail,
  Phone,
  Crown,
  Coffee,
  AlertTriangle,
  RefreshCw,
  X,
  Plus,
  ArrowLeft,
  Calendar,
  User,
  Edit2,
  Trash2,
  Check,
  PauseCircle,
  MoreVertical,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  Briefcase,
  Upload,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDeleteModal } from '../../../components/common/ConfirmDeleteModal';
import { authFetch, API_BASE_URL } from '../../../../shared/utils/api-client';

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  branch: string;
  branch_id?: string;
  status: 'working' | 'on_leave' | 'resigned';
  avatar?: string;
  dob?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  address?: string;
  notes?: string;
  joinDate?: string;
  role?: string;
}

const BRANCH_OPTIONS = [
  { id: 'all', label: 'Toàn hệ thống (Hội sở / Quản trị)' },
  { id: 'branch-183-cong-hoa', label: 'HONNE 183 Cộng Hòa (Flagship)' },
  { id: 'branch-22a-cong-hoa', label: 'HONNE 22A Cộng Hòa (HONNE 3)' },
  { id: 'branch-2-quach-van-tuan', label: 'HONNE Số 2 Quách Văn Tuấn (Khu Văn Phòng)' },
  { id: 'branch-121-cong-hoa', label: 'HONNE 121 Cộng Hòa (Điểm Đón Khách)' }
];

export const AdminStaffTab: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'add'>('list');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Detail Sub-Tab: 'info' | 'schedule' | 'history'
  const [detailTab, setDetailTab] = useState<'info' | 'schedule' | 'history'>('info');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Action Menu dropdown state
  const [activeMenuStaffId, setActiveMenuStaffId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for Adding / Editing Staff
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('honne@2026');
  const [formDob, setFormDob] = useState('2000-01-01');
  const [formGender, setFormGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [formDept, setFormDept] = useState('Pha chế');
  const [formPosition, setFormPosition] = useState('Nhân viên');
  const [formBranchId, setFormBranchId] = useState('branch-183-cong-hoa');
  const [formRole, setFormRole] = useState('staff');
  const [formAddress, setFormAddress] = useState('Quận Tân Bình, TP. HCM');
  const [formNotes, setFormNotes] = useState('Nhân viên chăm chỉ, nắm vững quy chuẩn pha chế HONNE');
  const [formAvatar, setFormAvatar] = useState('/images/assets/admin_barista_avatar.png');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Staff List State (Fetched Live from Cloudflare D1)
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('honne_admin_token') || localStorage.getItem('honne_access_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const getBranchLabel = (branchId?: string) => {
    const found = BRANCH_OPTIONS.find((b) => b.id === branchId);
    return found ? found.label : (branchId || 'Toàn hệ thống');
  };

  // Fetch real staff from Cloudflare D1
  const loadStaffFromD1 = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/users?role=internal`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped: StaffMember[] = data.data.map((u: any) => ({
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email || `${u.phone}@honne.vn`,
          department: u.department || (u.role === 'manager' ? 'Quản lý ca' : u.role === 'cashier' ? 'Thu ngân' : 'Pha chế'),
          position: u.position || (u.role === 'admin' ? 'Chủ thương hiệu' : u.role === 'manager' ? 'Cửa hàng trưởng' : 'Nhân viên'),
          branch: getBranchLabel(u.branch_id),
          branch_id: u.branch_id || 'branch-183-cong-hoa',
          status: u.is_active === 1 ? 'working' : 'resigned',
          avatar: u.avatar || '/images/assets/admin_barista_avatar.png',
          dob: u.dob || '2000-01-01',
          gender: u.gender || 'Nam',
          address: u.address || 'Quận Tân Bình, TP. HCM',
          notes: u.notes || 'Nhân sự chính thức',
          joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '15/06/2024',
          role: u.role || 'staff'
        }));
        setStaffList(mapped);
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách nhân sự từ Cloudflare D1:', e);
      showToast('Không thể kết nối đến máy chủ Cloudflare D1', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaffFromD1();
  }, []);

  // Filter staff list
  const filteredStaff = staffList.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(q);
      const matchPhone = s.phone.includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }
    if (deptFilter !== 'all' && s.department !== deptFilter) return false;
    if (branchFilter !== 'all' && s.branch_id !== branchFilter && !s.branch.toLowerCase().includes(branchFilter.toLowerCase())) return false;
    return true;
  });

  // KPI Calculations based on real D1 data
  const totalStaffCount = staffList.length;
  const workingCount = staffList.filter((s) => s.status === 'working').length;
  const onLeaveCount = staffList.filter((s) => s.status === 'on_leave').length;
  const resignedCount = staffList.filter((s) => s.status === 'resigned').length;

  // Pagination (5 per page)
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Status Pill renderer
  const renderStatusPill = (status: 'working' | 'on_leave' | 'resigned') => {
    if (status === 'working') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Đang làm</span>
        </span>
      );
    }
    if (status === 'on_leave') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Tạm nghỉ</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
        <XCircle className="w-3.5 h-3.5 text-stone-400" />
        <span>Đã nghỉ</span>
      </span>
    );
  };

  // Upload Avatar to Cloudflare R2
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authFetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormAvatar(data.url);
        showToast('Tải ảnh chân dung nhân viên lên Cloudflare R2 thành công!', 'success');
      } else {
        showToast(data.message || 'Lỗi tải ảnh lên R2', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ upload ảnh', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Open Form for Adding New Staff
  const handleOpenAddForm = () => {
    setEditingStaffId(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormPassword('honne@2026');
    setFormDob('2000-01-01');
    setFormGender('Nam');
    setFormDept('Pha chế');
    setFormPosition('Nhân viên');
    setFormBranchId('branch-183-cong-hoa');
    setFormRole('staff');
    setFormAddress('Quận Tân Bình, TP. HCM');
    setFormNotes('Nhân viên pha chế chuẩn công thức HONNE');
    setFormAvatar('/images/assets/admin_barista_avatar.png');
    setCurrentView('add');
  };

  // Open Form for Editing Staff
  const handleOpenEditForm = (s: StaffMember) => {
    setEditingStaffId(s.id);
    setFormName(s.name);
    setFormPhone(s.phone);
    setFormEmail(s.email);
    setFormDob(s.dob || '2000-01-01');
    setFormGender(s.gender || 'Nam');
    setFormDept(s.department || 'Pha chế');
    setFormPosition(s.position || 'Nhân viên');
    setFormBranchId(s.branch_id || 'branch-183-cong-hoa');
    setFormRole(s.role || 'staff');
    setFormAddress(s.address || 'Quận Tân Bình, TP. HCM');
    setFormNotes(s.notes || '');
    setFormAvatar(s.avatar || '/images/assets/admin_barista_avatar.png');
    setCurrentView('add');
    setActiveMenuStaffId(null);
  };

  // Save Staff (Create or Update in Cloudflare D1)
  const handleSaveStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      showToast('Vui lòng nhập họ và tên và số điện thoại!', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingStaffId) {
        // UPDATE STAFF IN D1
        const res = await authFetch(`${API_BASE_URL}/admin/users/${editingStaffId}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formName.trim(),
            phone: formPhone.trim(),
            email: formEmail.trim() || `${formPhone.trim()}@honne.vn`,
            role: formRole,
            branchId: formBranchId,
            department: formDept,
            position: formPosition,
            gender: formGender,
            dob: formDob,
            address: formAddress,
            notes: formNotes,
            avatar: formAvatar
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Đã cập nhật thông tin nhân viên "${formName}" vào Cloudflare D1!`, 'success');
          await loadStaffFromD1();
          setCurrentView('list');
        } else {
          showToast(data.message || 'Lỗi cập nhật nhân viên', 'error');
        }
      } else {
        // CREATE NEW STAFF IN D1
        const res = await authFetch(`${API_BASE_URL}/admin/users`, {
          method: 'POST',
          body: JSON.stringify({
            name: formName.trim(),
            phone: formPhone.trim(),
            email: formEmail.trim() || `${formPhone.trim()}@honne.vn`,
            password: formPassword.trim() || 'honne@2026',
            role: formRole,
            branchId: formBranchId,
            department: formDept,
            position: formPosition,
            gender: formGender,
            dob: formDob,
            address: formAddress,
            notes: formNotes,
            avatar: formAvatar
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Đã tạo tài khoản nhân sự mới "${formName}" (${data.data?.id}) vào D1!`, 'success');
          await loadStaffFromD1();
          setCurrentView('list');
        } else {
          showToast(data.message || 'Lỗi tạo tài khoản nhân sự', 'error');
        }
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ Cloudflare D1', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Staff Confirmation
  const handleConfirmDeleteStaff = async () => {
    if (!deletingStaff) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/users/${deletingStaff.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã xóa nhân viên "${deletingStaff.name}" khỏi cơ sở dữ liệu Cloudflare D1!`, 'info');
        setStaffList((prev) => prev.filter((s) => s.id !== deletingStaff.id));
        setDeletingStaff(null);
        if (selectedStaff?.id === deletingStaff.id) {
          setCurrentView('list');
          setSelectedStaff(null);
        }
      } else {
        showToast(data.message || 'Lỗi khi xóa nhân viên', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ Cloudflare D1', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Staff Active Status (Đi làm / Tạm nghỉ)
  const handleToggleStatus = async (staffId: string, newStatus: 'working' | 'on_leave' | 'resigned') => {
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/users/${staffId}`, {
        method: 'PUT',
        body: JSON.stringify({
          isActive: newStatus === 'working' ? 1 : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staffId ? { ...s, status: newStatus } : s))
        );
        showToast(`Đã cập nhật trạng thái nhân sự thành công!`, 'success');
      }
    } catch {
      showToast('Lỗi cập nhật trạng thái nhân sự', 'error');
    }
    setActiveMenuStaffId(null);
  };

  // =========================================================================
  // VIEW 1: STAFF DETAIL SCREEN
  // =========================================================================
  if (currentView === 'detail' && selectedStaff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center gap-2 text-stone-700 hover:text-[#103B27] font-bold text-sm transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Danh sách nhân viên</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEditForm(selectedStaff)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0A2618] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
            <button
              onClick={() => setDeletingStaff(selectedStaff)}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa nhân sự</span>
            </button>
          </div>
        </div>

        {/* Staff Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#F5C518] bg-stone-100 overflow-hidden shrink-0 shadow-md">
              <img
                src={selectedStaff.avatar || '/images/assets/admin_barista_avatar.png'}
                alt={selectedStaff.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black text-stone-900">{selectedStaff.name}</h3>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    Mã nhân sự: <strong>#{selectedStaff.id}</strong> • Chức vụ: <strong>{selectedStaff.position}</strong> ({selectedStaff.department})
                  </p>
                </div>
                <div>{renderStatusPill(selectedStaff.status)}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-100 text-xs">
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-mono font-bold">{selectedStaff.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate">{selectedStaff.email}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-bold text-[#103B27]">{selectedStaff.branch}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs space-y-6">
          <div className="flex items-center gap-6 border-b border-stone-100 pb-2 text-xs font-bold">
            <button
              onClick={() => setDetailTab('info')}
              className={`pb-2 relative cursor-pointer ${
                detailTab === 'info' ? 'text-[#103B27] font-black' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Thông tin cá nhân</span>
              {detailTab === 'info' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103B27] rounded-full" />}
            </button>
            <button
              onClick={() => setDetailTab('schedule')}
              className={`pb-2 relative cursor-pointer ${
                detailTab === 'schedule' ? 'text-[#103B27] font-black' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Lịch làm việc ca trực</span>
              {detailTab === 'schedule' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103B27] rounded-full" />}
            </button>
            <button
              onClick={() => setDetailTab('history')}
              className={`pb-2 relative cursor-pointer ${
                detailTab === 'history' ? 'text-[#103B27] font-black' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Lịch sử đánh giá</span>
              {detailTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103B27] rounded-full" />}
            </button>
          </div>

          {detailTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Ngày sinh:</span>
                  <span className="font-bold text-stone-900 font-mono">{selectedStaff.dob}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Giới tính:</span>
                  <span className="font-bold text-stone-900">{selectedStaff.gender}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Địa chỉ cư trú:</span>
                  <span className="font-bold text-stone-900 text-right">{selectedStaff.address}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Phòng ban:</span>
                  <span className="font-bold text-stone-900">{selectedStaff.department}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Ngày vào làm:</span>
                  <span className="font-bold text-stone-900 font-mono">{selectedStaff.joinDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Ghi chú quản lý:</span>
                  <span className="font-bold text-stone-900 text-right">{selectedStaff.notes}</span>
                </div>
              </div>
            </div>
          )}

          {detailTab === 'schedule' && (
            <div className="p-8 text-center text-stone-500 text-xs">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-700">Lịch ca trực tuần này: Ca Sáng (06:30 - 14:30)</p>
              <p className="text-[11px] text-stone-400 mt-1">Chi nhánh: {selectedStaff.branch}</p>
            </div>
          )}

          {detailTab === 'history' && (
            <div className="p-8 text-center text-stone-500 text-xs">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-stone-700">Chỉ số tuân thủ quy trình SOP: 100%</p>
              <p className="text-[11px] text-stone-400 mt-1">Không ghi nhận vi phạm định mức pha chế hoặc thất thoát</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FORM THÊM / CHỈNH SỬA NHÂN VIÊN (LƯU VÀO CLOUDFLARE D1)
  // =========================================================================
  if (currentView === 'add') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center gap-2 text-stone-700 hover:text-[#103B27] font-bold text-sm transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </button>
          <span className="text-xs font-mono font-bold text-stone-400">
            {editingStaffId ? `Chỉnh sửa: #${editingStaffId}` : 'Tạo mới nhân sự D1'}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE2D0] shadow-xs">
          <h3 className="font-black text-lg text-stone-900 mb-1">
            {editingStaffId ? 'Chỉnh Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới Vào Hệ Thống'}
          </h3>
          <p className="text-xs text-stone-500 mb-6">
            Dữ liệu sẽ được lưu trữ và phân quyền trực tiếp trong cơ sở dữ liệu Cloudflare D1
          </p>

          <form onSubmit={handleSaveStaffSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Avatar Box */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center pt-2">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 group-hover:border-[#103B27] flex items-center justify-center overflow-hidden transition">
                    <img src={formAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <label className="absolute bottom-1 right-1 p-2 rounded-full bg-[#103B27] hover:bg-[#15462F] text-white shadow-md cursor-pointer transition">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                  </label>
                </div>
                <span className="text-[11px] font-bold text-stone-600 mt-3">
                  {isUploadingAvatar ? 'Đang tải lên R2...' : 'Thay ảnh chân dung (JPG/PNG)'}
                </span>
              </div>

              {/* Input Fields */}
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập họ và tên"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-bold focus:outline-hidden focus:border-[#103B27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0901234567"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:border-[#103B27]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email nhân viên</label>
                    <input
                      type="email"
                      placeholder="tennhanvien@honne.vn"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#103B27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Chi nhánh trực thuộc <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formBranchId}
                      onChange={(e) => setFormBranchId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-hidden cursor-pointer"
                    >
                      {BRANCH_OPTIONS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Phòng ban</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Pha chế">Pha chế</option>
                      <option value="Thu ngân">Thu ngân</option>
                      <option value="Phục vụ">Phục vụ</option>
                      <option value="Quản lý ca">Quản lý ca</option>
                      <option value="Quản trị">Quản trị</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Chức vụ</label>
                    <select
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Nhân viên">Nhân viên</option>
                      <option value="Quản lý ca">Quản lý ca</option>
                      <option value="Cửa hàng trưởng">Cửa hàng trưởng</option>
                      <option value="Chủ thương hiệu">Chủ thương hiệu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Vai trò hệ thống (RBAC)</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-hidden cursor-pointer"
                    >
                      <option value="staff">staff (Nhân viên)</option>
                      <option value="manager">manager (Quản lý chi nhánh)</option>
                      <option value="admin">admin (Quản trị viên)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={formDob}
                      onChange={(e) => setFormDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Giới tính</label>
                    <div className="flex items-center gap-4 pt-2 text-xs">
                      {(['Nam', 'Nữ', 'Khác'] as const).map((g) => (
                        <label key={g} className="flex items-center gap-1.5 cursor-pointer font-bold text-stone-700">
                          <input
                            type="radio"
                            name="gender"
                            checked={formGender === g}
                            onChange={() => setFormGender(g)}
                            className="text-[#103B27]"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Địa chỉ thường trú</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Ghi chú nhân sự</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploadingAvatar}
                className="px-6 py-2.5 rounded-xl bg-[#0A2618] hover:bg-[#103B27] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#F5C518]" />
                    <span>Đang lưu vào D1...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#F5C518]" />
                    <span>{editingStaffId ? 'Lưu Thay Đổi' : 'Tạo Nhân Viên Mới'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: STAFF LIST VIEW (CHÍNH)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* 1. Header with Actions */}
      <div className="bg-white rounded-3xl p-5 border border-[#EDE2D0] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#103B27]" />
            <span>Danh Sách Nhân Viên Hệ Thống</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Dữ liệu nhân sự thời gian thực đồng bộ trực tiếp Cloudflare D1 ({totalStaffCount} tài khoản)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStaffFromD1}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
            title="Làm mới dữ liệu từ D1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#103B27]' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddForm}
            className="px-4 py-2.5 rounded-2xl bg-[#0A2618] hover:bg-[#103B27] text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#F5C518]" />
            <span>Thêm Nhân Viên</span>
          </button>
        </div>
      </div>

      {/* 2. 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-4 border border-[#EDE2D0] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
            <Users className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Tổng nhân sự</span>
            <span className="font-mono font-black text-xl text-stone-900">{totalStaffCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#EDE2D0] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Đang làm việc</span>
            <span className="font-mono font-black text-xl text-emerald-700">{workingCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#EDE2D0] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-black">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Tạm nghỉ ca</span>
            <span className="font-mono font-black text-xl text-amber-800">{onLeaveCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#EDE2D0] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center font-black">
            <XCircle className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Đã nghỉ việc</span>
            <span className="font-mono font-black text-xl text-rose-700">{resignedCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="bg-white rounded-3xl p-4 border border-[#EDE2D0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, số điện thoại, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#103B27]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">Phòng ban: Tất cả</option>
            <option value="Pha chế">Pha chế</option>
            <option value="Thu ngân">Thu ngân</option>
            <option value="Quản lý ca">Quản lý ca</option>
            <option value="Quản trị">Quản trị</option>
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">Chi nhánh: Tất cả</option>
            <option value="branch-183-cong-hoa">183 Cộng Hòa</option>
            <option value="branch-22a-cong-hoa">22A Cộng Hòa</option>
            <option value="branch-2-quach-van-tuan">Số 2 Quách Văn Tuấn</option>
            <option value="branch-121-cong-hoa">121 Cộng Hòa</option>
          </select>
        </div>
      </div>

      {/* 4. Staff Table */}
      <div className="bg-white rounded-3xl border border-[#EDE2D0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] text-stone-500 font-bold border-b border-stone-200/80 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Nhân viên</th>
                <th className="py-3 px-3">Số điện thoại</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Phòng ban</th>
                <th className="py-3 px-3">Chức vụ</th>
                <th className="py-3 px-3">Chi nhánh</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedStaff.map((s) => (
                <tr key={s.id} className="hover:bg-amber-50/20 transition group">
                  <td className="py-3 px-4">
                    <div
                      onClick={() => {
                        setSelectedStaff(s);
                        setCurrentView('detail');
                      }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full ring-2 ring-stone-200 bg-stone-100 overflow-hidden shrink-0">
                        <img src={s.avatar || '/images/assets/admin_barista_avatar.png'} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-extrabold text-stone-900 group-hover:text-[#103B27] transition flex items-center gap-1.5">
                          <span>{s.name}</span>
                          {s.role === 'admin' && <Crown className="w-3 h-3 text-[#F5C518]" />}
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">#{s.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-stone-700">{s.phone}</td>
                  <td className="py-3 px-3 text-stone-500">{s.email}</td>
                  <td className="py-3 px-3 font-bold text-stone-800">{s.department}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold">
                      {s.position}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#103B27]">{s.branch}</td>
                  <td className="py-3 px-3">{renderStatusPill(s.status)}</td>
                  <td className="py-3 px-4 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditForm(s)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {s.role !== 'admin' && (
                        <button
                          onClick={() => setDeletingStaff(s)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Xóa nhân viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div>
            Hiển thị <strong>{paginatedStaff.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredStaff.length)}</strong> trong {filteredStaff.length} nhân sự
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-bold">{currentPage} / {totalPages}</span>
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

      {/* 5. Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingStaff)}
        title="Xác Nhận Xóa Nhân Viên"
        itemName={deletingStaff ? `${deletingStaff.name} (#${deletingStaff.id} - ${deletingStaff.position})` : undefined}
        description="Nhân viên này sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu Cloudflare D1 và thu hồi mọi quyền truy cập vào hệ thống ERP / CRM. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa Nhân Sự"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDeleteStaff}
        onClose={() => setDeletingStaff(null)}
      />
    </div>
  );
};
