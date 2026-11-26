import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Coffee,
  CheckCircle2,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthState } = useAuth() as any;
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tài khoản và mật khẩu quản trị.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://api-honne.hanhan02102012.workers.dev/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
        setLoading(false);
        return;
      }

      // Store Enterprise Access Token strictly (30-day session)
      const token = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      localStorage.setItem('honne_admin_token', token);
      localStorage.setItem('honne_admin_user', JSON.stringify(data.user));
      localStorage.setItem('honne_access_token', token);
      localStorage.setItem('honne_user', JSON.stringify(data.user));
      if (refreshToken) {
        localStorage.setItem('honne_admin_refresh_token', refreshToken);
        localStorage.setItem('honne_refresh_token', refreshToken);
      }

      if (setAuthState) {
        setAuthState({
          token,
          user: data.user,
          isAuthenticated: true,
          isAdmin: data.user?.role === 'admin' || data.user?.role === 'manager'
        });
      }

      showToast(`Đăng nhập thành công! Chào mừng ${data.user.name} (${data.user.role.toUpperCase()})`, 'success');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg('Không thể kết nối đến máy chủ quản trị. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071F14] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F5C518]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#14452F15_1px,transparent_1px),linear-gradient(to_bottom,#14452F15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#F5C518] text-[#14452F] flex items-center justify-center font-black shadow-lg group-hover:scale-105 transition-transform">
            <Coffee className="w-6 h-6 text-[#14452F]" />
          </div>
          <div>
            <div className="font-black text-xl text-[#F5C518] tracking-widest leading-none">
              HONNE
            </div>
            <div className="text-[10px] text-emerald-300 font-bold tracking-[0.25em] uppercase mt-0.5">
              ENTERPRISE PORTAL
            </div>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          Trang khách hàng <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Frame */}
          <div className="bg-[#0D2D1E]/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
            {/* Top Gold Accent Border */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-[#F5C518] to-emerald-500" />

            {/* Badge Security */}
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/30 text-[#F5C518] text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F5C518]" />
                <span>HỆ THỐNG QUẢN TRỊ NỘI BỘ</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">v2.5 Enterprise</span>
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Đăng Nhập Quản Trị
              </h1>
              <p className="text-xs text-stone-300">
                Dành cho Quản trị viên, Quản lý chi nhánh & Nhân viên HONNE
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Account Identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-200">
                  Tài khoản Email / Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@honne.vn hoặc 0909183183"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-emerald-600/40 text-white placeholder-stone-500 text-sm focus:outline-hidden focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518] transition"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-200">
                  Mật khẩu bảo mật
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-black/40 border border-emerald-600/40 text-white placeholder-stone-500 text-sm focus:outline-hidden focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518] transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F5C518] to-amber-400 hover:from-amber-400 hover:to-[#F5C518] text-[#103B27] font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-[#103B27] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Xác Thực & Đăng Nhập Quản Trị</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-4 border-t border-emerald-800/40 text-[11px] text-stone-400 leading-relaxed text-center">
              Khách hàng thông thường vui lòng đăng nhập tại website bán hàng. Mọi hành vi cố tình xâm nhập trái phép sẽ bị ghi lại địa chỉ IP và khóa truy cập vĩnh viễn.
            </div>
          </div>
        </div>
      </main>

      {/* Footer System Status */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 border-t border-emerald-950/60">
        <div>© 2026 HONNE COFFEE & TEA ENTERPRISE • Chuỗi 4 chi nhánh Tân Bình</div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Máy chủ Cloudflare D1 HKG: Hoạt động bình thường
          </span>
        </div>
      </footer>
    </div>
  );
};
