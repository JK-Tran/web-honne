import React, { useState } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Coffee, Coins, Sparkles, User, ChevronDown, LogOut, Package, ShieldCheck, Ticket, Bike, Store, MapPin } from 'lucide-react';
import { NAV_LINKS } from '../../../shared/constants/navigation';
import { AnnouncementMarquee } from './AnnouncementMarquee';
import { useCart } from '../../context/CartContext';
import { useRewards } from '../../context/RewardContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useOrderLocation } from '../../context/LocationContext';

export const Navbar: React.FC = () => {
  const location = useRouterLocation();
  const navigate = useNavigate();
  const { totalCount } = useCart();
  const { coins, setOpenCheckInModal, isCheckedInToday } = useRewards();
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const { orderMode, currentAddress, selectedBranch, setIsLocationModalOpen } = useOrderLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#14452F] text-white transition-all shadow-md w-full">
      {/* Main Brand & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Brand: HONNE in Golden Yellow */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#F5C518] text-[#14452F] flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Coffee className="w-4 h-4 sm:w-6 sm:h-6 text-[#14452F]" />
              </div>
              <div className="flex flex-col">
                <span className="font-black tracking-widest text-lg sm:text-2xl text-[#F5C518] uppercase leading-none drop-shadow-xs">
                  HONNE
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] text-emerald-200/90 uppercase mt-0.5 sm:mt-1">
                  COFFEE & TEA
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links (Clean, Responsive, Never Wrap) */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-6">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs xl:text-sm tracking-wide font-bold transition-all py-2 whitespace-nowrap relative group flex items-center gap-1 ${
                    isActive
                      ? 'text-[#F5C518]'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] font-black uppercase bg-[#F5C518] text-[#103B27] px-1.5 py-0.5 rounded-xs leading-none">
                      {link.badge}
                    </span>
                  )}
                  {/* Elegant underline */}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-[#F5C518] rounded-full transition-transform duration-200 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Check-in Coins + User Auth + Search + Cart + Mobile menu toggle */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Daily Check-in & Coins Button */}
            <button
              onClick={() => setOpenCheckInModal(true)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] text-[#103B27] font-black text-xs transition shadow-sm cursor-pointer shrink-0"
              title="Điểm danh nhận Xu"
            >
              <Coins className="w-3.5 h-3.5 text-[#103B27] shrink-0" />
              <span className="hidden sm:inline">
                {user ? `${user.coins.toLocaleString('vi-VN')} Xu` : `${coins.toLocaleString('vi-VN')} Xu`}
              </span>
              <span className="sm:hidden font-black text-[11px]">
                {user ? user.coins : coins}
              </span>
              {!isCheckedInToday && (
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-600 animate-ping shrink-0" />
              )}
            </button>

            {/* User Auth Section */}
            {isAuthenticated && user ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 p-1 sm:px-2 sm:py-1.5 rounded-xl bg-[#185338] hover:bg-[#1E6645] border border-[#237A4E] transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400 text-[#14452F] flex items-center justify-center font-bold text-xs uppercase overflow-hidden border border-amber-300 shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-white max-w-[90px] truncate leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-amber-300 font-semibold leading-none">
                      {user.tier} Member
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-stone-300 hidden sm:block" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 text-stone-800 z-50 animate-scale-up"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/60 rounded-t-2xl">
                      <div className="font-bold text-sm text-stone-900 truncate">{user.name}</div>
                      <div className="text-xs text-stone-500 truncate">{user.phone}</div>
                      <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-stone-200">
                        <span className="text-stone-600 font-medium">Số dư Xu:</span>
                        <span className="font-extrabold text-amber-600 font-mono">
                          {user.coins.toLocaleString('vi-VN')} Xu
                        </span>
                      </div>
                    </div>

                    <div className="py-1 text-xs font-medium">
                      <Link
                        to="/ho-so"
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-amber-50/70 text-stone-700 hover:text-amber-900 transition-colors"
                      >
                        <User className="w-4 h-4 text-amber-600" />
                        <span>Hồ sơ & Địa chỉ nhận hàng</span>
                      </Link>

                      <Link
                        to="/lich-su-don-hang"
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 transition-colors"
                      >
                        <Package className="w-4 h-4 text-emerald-700" />
                        <span>Lịch sử đơn hàng</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-stone-100">
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl border border-amber-400/60 hover:border-amber-400 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-extrabold text-xs transition shadow-sm cursor-pointer shrink-0"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Đăng nhập</span>
                <span className="text-[9px] sm:text-[10px] bg-[#F5C518] text-[#14452F] px-1 sm:px-1.5 py-0.2 rounded font-black">
                  +500
                </span>
              </button>
            )}

            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-stone-200 hover:text-[#F5C518] hover:bg-[#185338] transition cursor-pointer"
              aria-label="Tìm kiếm món"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Cart Icon with Golden Badge */}
            <Link
              to="/gio-hang"
              className="relative p-1.5 sm:p-2 rounded-lg text-stone-200 hover:text-white hover:bg-[#185338] transition flex items-center cursor-pointer"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F5C518] text-[#14452F] font-black text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-stone-200 hover:text-white hover:bg-[#185338] transition cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sleek Delivery & Branch Sub-Bar (GrabFood / ShopeeFood style) */}
      <div className="bg-[#0e3322] border-t border-b border-[#185338] text-xs py-1.5 sm:py-2 px-3 sm:px-6 lg:px-8 shadow-xs w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white transition cursor-pointer max-w-full overflow-hidden"
              title="Nhấn để đổi địa chỉ giao hàng hoặc chọn chi nhánh"
            >
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#F5C518] text-[#14452F] flex items-center justify-center shrink-0">
                {orderMode === 'delivery' ? <Bike className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Store className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              </span>
              <span className="text-[#F5C518] font-bold text-[10px] sm:text-[11px] uppercase shrink-0">
                {orderMode === 'delivery' ? 'Giao:' : 'Tại quầy:'}
              </span>
              <span className="font-semibold text-stone-100 truncate text-[11px] sm:text-xs max-w-[170px] xs:max-w-[230px] sm:max-w-[360px] md:max-w-[500px]">
                {orderMode === 'delivery' ? currentAddress.addressDetail : `${selectedBranch.name} - ${selectedBranch.address}`}
              </span>
              <span className="text-amber-300 group-hover:text-white font-bold text-[10px] sm:text-[11px] underline shrink-0 ml-0.5">
                [Đổi]
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-emerald-200/80 text-[11px] shrink-0 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
              Freeship 0đ trong bán kính 1km từ chi nhánh
            </span>
            <span className="w-1 h-1 rounded-full bg-emerald-400/40" />
            <span>4 Chi nhánh Tân Bình</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400/40" />
            <span>Hotline: <strong className="text-white font-bold">0379 467 986</strong></span>
          </div>
        </div>
      </div>

      {/* DYNAMIC PROMOTIONAL ANNOUNCEMENT TICKER (D1 Synced, Admin Manageable) */}
      <AnnouncementMarquee />

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="bg-[#103B27] border-t border-[#1E5C3E] px-4 py-3 animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm cà phê muối, trà đào, trà sữa Oolong..."
                className="w-full px-4 py-2.5 rounded-lg bg-[#0C2E1E] text-white placeholder-stone-400 border border-[#206645] focus:outline-none focus:ring-1 focus:ring-[#F5C518] text-sm pl-10"
                autoFocus
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#F5C518] text-[#14452F] font-black text-sm hover:bg-[#ffd54f] transition cursor-pointer"
            >
              Tìm
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#103B27] border-b border-[#1E5C3E] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-bold flex items-center justify-between ${
                    isActive
                      ? 'bg-[#185338] text-[#F5C518]'
                      : 'text-stone-300 hover:bg-[#14452F] hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] font-black uppercase bg-[#F5C518] text-[#14452F] px-1.5 py-0.5 rounded-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-[#1E5C3E] space-y-2">
            {/* Mobile Location Selector Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsLocationModalOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-between border border-white/15"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-[#F5C518] shrink-0" />
                <span className="truncate">
                  {orderMode === 'delivery'
                    ? `Giao: ${currentAddress.addressDetail}`
                    : `Lấy tại: ${selectedBranch.name}`}
                </span>
              </div>
              <span className="text-[10px] text-amber-300 font-extrabold uppercase shrink-0">
                Đổi địa chỉ
              </span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setOpenCheckInModal(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F5C518] text-[#14452F] font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Coins className="w-4 h-4 text-[#14452F]" />
              Điểm danh nhận Xu ({coins.toLocaleString('vi-VN')} Xu)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
