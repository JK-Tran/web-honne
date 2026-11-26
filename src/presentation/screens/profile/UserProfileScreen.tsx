import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Coins,
  Ticket,
  Package,
  Award,
  Sparkles,
  Save,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrencyVND } from '../../../shared/utils/currency';

export const UserProfileScreen: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Tân Bình');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      setDistrict(user.district || 'Tân Bình');
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-stone-200 shadow-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto text-2xl">
            👤
          </div>
          <h2 className="text-xl font-bold text-stone-900">Vui lòng đăng nhập</h2>
          <p className="text-xs text-stone-500">
            Bạn cần đăng nhập tài khoản thành viên HONNE để quản lý hồ sơ và xem quyền lợi.
          </p>
          <button
            onClick={openAuthModal}
            className="w-full py-3 bg-[#14452F] text-amber-400 font-extrabold text-sm rounded-xl"
          >
            Đăng nhập ngay (+500 Xu)
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Vui lòng nhập họ tên và số điện thoại', 'error');
      return;
    }

    setSaving(true);
    await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      district
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] py-6 sm:py-12 px-3 sm:px-6 lg:px-8 w-full overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Profile Hero Card */}
        <div className="bg-gradient-to-r from-[#113B26] via-[#14452F] to-[#163D26] rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 text-[#14452F] flex items-center justify-center font-black text-xl sm:text-2xl uppercase border-2 border-amber-300 shadow-md shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-[11px] font-extrabold uppercase mb-1">
                  <Award className="w-3.5 h-3.5" />
                  Thành viên {user.tier}
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white truncate">{user.name}</h1>
                <p className="text-xs text-stone-300 mt-0.5 truncate">{user.phone}</p>
              </div>
            </div>

            {/* Quick Balances */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/15 text-center">
              <div>
                <span className="text-[10px] sm:text-[11px] text-stone-300 block">Số dư tích lũy</span>
                <span className="text-lg sm:text-2xl font-black text-amber-300">
                  {user.coins.toLocaleString('vi-VN')} Xu
                </span>
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] text-stone-300 block">Ví Voucher</span>
                <span className="text-lg sm:text-2xl font-black text-amber-300">
                  {user.savedVouchers.length} mã
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Form & Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Form: Edit Info */}
          <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-stone-900">Thông Tin Cá Nhân & Giao Hàng</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Cập nhật thông tin để tự động điền khi đặt cà phê và trà tại HONNE
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Email nhận hóa đơn
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Địa chỉ giao hàng mặc định (Số nhà, tên đường)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="VD: 183 Cộng Hòa, Phường 13"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Khu vực / Quận
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                >
                  <option value="Tân Bình">Quận Tân Bình (Nội khu 4 Chi nhánh HONNE - Freeship)</option>
                  <option value="Tân Phú">Quận Tân Phú (Bán kính 3-5km)</option>
                  <option value="Phú Nhuận">Quận Phú Nhuận (Bán kính 3-5km)</option>
                  <option value="Quận 10">Quận 10</option>
                  <option value="Quận 11">Quận 11</option>
                  <option value="Khác">Khu vực khác</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#14452F] hover:bg-[#163D26] text-amber-400 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
              </button>
            </form>
          </div>

          {/* Right Sidebar: Shortcuts & Stats */}
          <div className="md:col-span-4 space-y-4">
            {/* Shortcuts */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm space-y-2">
              <h3 className="font-bold text-stone-900 text-sm mb-3">Lối Tắt Nhanh</h3>

              <Link
                to="/lich-su-don-hang"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition text-xs font-bold text-stone-700 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <span>Lịch sử đơn hàng</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
              </Link>
            </div>

            {/* Loyalty Policy Box */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-3xl p-5 border border-amber-200 text-xs text-stone-700 space-y-2">
              <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> Đặc quyền hội viên HONNE:
              </div>
              <ul className="space-y-1.5 text-stone-600 list-disc list-inside text-[11px]">
                <li>Tích 1 Xu cho mỗi 1.000đ chi tiêu tại quầy và online.</li>
                <li>Điểm danh hàng ngày nhận tới 3.100 Xu/tuần.</li>
                <li>Freeship đơn từ 99k trong bán kính 3km Tân Bình.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
