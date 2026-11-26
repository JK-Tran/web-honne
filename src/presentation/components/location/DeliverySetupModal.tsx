import React, { useState } from 'react';
import {
  X,
  MapPin,
  Store,
  Bike,
  Plus,
  Check,
  Building,
  Home,
  Trash2,
  Clock,
  Phone,
  Sparkles,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useLocation, UserAddress, Branch } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';

export const DeliverySetupModal: React.FC = () => {
  const {
    orderMode,
    setOrderMode,
    branches,
    selectedBranch,
    setSelectedBranch,
    savedAddresses,
    currentAddress,
    setCurrentAddress,
    addNewAddress,
    deleteAddress,
    isLocationModalOpen,
    setIsLocationModalOpen,
    distanceKm,
    isWithinDeliveryRange,
    getDistanceToBranch
  } = useLocation();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'delivery' | 'pickup'>(orderMode);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields for new address (Single Input - No Phường dropdown)
  const [label, setLabel] = useState('Nhà riêng');
  const [receiverName, setReceiverName] = useState(currentAddress?.receiverName || '');
  const [receiverPhone, setReceiverPhone] = useState(currentAddress?.receiverPhone || '');
  const [addressDetail, setAddressDetail] = useState('');

  if (!isLocationModalOpen) return null;

  const handleSelectAddress = (addr: UserAddress) => {
    setCurrentAddress(addr);
    setOrderMode('delivery');
  };

  const handleSelectBranchForDelivery = (branch: Branch) => {
    setSelectedBranch(branch);
  };

  const handleSelectBranchForPickup = (branch: Branch) => {
    setSelectedBranch(branch);
    setOrderMode('pickup');
    setIsLocationModalOpen(false);
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim() || !receiverPhone.trim() || !addressDetail.trim()) {
      showToast('Vui lòng điền họ tên, SĐT và địa chỉ chi tiết!', 'error');
      return;
    }

    const fullAddr = addressDetail.trim();
    await addNewAddress({
      label,
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      addressDetail: fullAddr,
      district: 'Tân Bình',
      isDefault: savedAddresses.length === 0
    });

    setShowAddForm(false);
    setAddressDetail('');
    setOrderMode('delivery');
    showToast('Đã lưu và chọn địa chỉ giao hàng thành công!', 'success');
  };

  const currentDist = getDistanceToBranch(selectedBranch, currentAddress.addressDetail);
  const canDeliver = currentDist <= 1.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#14452F] to-[#185338] text-white flex items-center justify-between shrink-0 border-b border-[#206645]">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-[#F5C518] block mb-0.5">
              HONNE ORDER SETUP
            </span>
            <h3 className="font-black text-lg sm:text-xl text-white">
              Địa Chỉ Giao Hàng & Chi Nhánh
            </h3>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-2 sm:p-3 bg-stone-100 flex gap-1.5 sm:gap-2 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'delivery'
                ? 'bg-[#14452F] text-[#F5C518] shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Giao tận nơi (≤ 1km)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pickup')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'pickup'
                ? 'bg-[#14452F] text-[#F5C518] shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Lấy tại quầy (4 CN)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[62vh] bg-[#FDFBF7]">
          {activeTab === 'delivery' ? (
            /* DELIVERY MODE CONTENT */
            <div className="space-y-4">
              {/* Notice pill: 0-1km rule & Freeship */}
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  canDeliver
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {canDeliver ? (
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  {canDeliver ? (
                    <div>
                      <strong className="text-emerald-800">
                        ✓ Trong bán kính {currentDist}km ({selectedBranch.name}):
                      </strong>{' '}
                      Đủ điều kiện nhận giao hàng & <strong>FREESHIP 0đ</strong> cho toàn bộ món nước
                      pha tươi (nhân viên quán giao siêu tốc)!
                    </div>
                  ) : (
                    <div>
                      <strong className="text-rose-800">
                        ⚠️ Khoảng cách {currentDist}km (Vượt quá 1km):
                      </strong>{' '}
                      Để đảm bảo kem béo không tan, cà phê & trà giữ trọn hương vị tươi ngon nhất
                      (nhân viên quán tự mang trực tiếp), HONNE chỉ nhận giao miễn phí trong <strong>bán kính 1km</strong>.
                      Bạn hãy chọn chi nhánh gần hơn bên dưới hoặc chọn "Đến lấy tại quầy" nhé!
                    </div>
                  )}
                </div>
              </div>

              {/* Step 1: Chọn chi nhánh HONNE phục vụ đơn giao */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-stone-700 tracking-wider">
                    1. Chi nhánh HONNE phục vụ (Tân Bình):
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">Bán kính giao: 0 - 1km</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {branches.map((b) => {
                    const dist = getDistanceToBranch(b, currentAddress.addressDetail);
                    const isSelected = selectedBranch.id === b.id;
                    const inRange = dist <= 1.0;

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBranchForDelivery(b)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#14452F] text-white border-[#14452F] shadow-xs'
                            : 'bg-white border-stone-200 text-stone-800 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-[#F5C518]' : 'text-stone-900'
                            }`}
                          >
                            {b.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#F5C518] shrink-0" />}
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-stone-200' : 'text-stone-500'
                          }`}
                        >
                          {b.address}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span
                            className={`font-black px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-[#F5C518]'
                                : inRange
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {dist} km {inRange ? '• Freeship 0đ' : '• >1km'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Sổ địa chỉ của bạn */}
              <div className="space-y-2.5 pt-2 border-t border-stone-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-stone-700 tracking-wider">
                    2. Địa chỉ nhận hàng của bạn ({savedAddresses.length}):
                  </span>
                  {!showAddForm && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(true)}
                      className="text-xs font-bold text-[#14452F] hover:text-[#185338] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm địa chỉ</span>
                    </button>
                  )}
                </div>

                {savedAddresses.map((addr) => {
                  const isSelected = currentAddress.id === addr.id;
                  const dist = getDistanceToBranch(selectedBranch, addr.addressDetail);
                  const isOk = dist <= 1.0;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#14452F] text-amber-300'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {addr.label === 'Văn phòng' ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <Home className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                              {addr.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isOk
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              Cách quán: {dist} km {isOk ? '(Freeship)' : '(Quá 1km)'}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-stone-800 mt-0.5 truncate">
                            {addr.receiverName} • {addr.receiverPhone}
                          </div>
                          <div className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                            {addr.addressDetail}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {savedAddresses.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAddress(addr.id);
                            }}
                            className="p-1.5 text-stone-300 hover:text-rose-600 transition"
                            title="Xóa địa chỉ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Address Form (Chỉ 1 ô nhập địa chỉ duy nhất) */}
              {showAddForm && (
                <form
                  onSubmit={handleSaveNewAddress}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-300 shadow-md space-y-3.5 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-black uppercase text-stone-900">
                      Thêm địa chỉ giao hàng mới:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-stone-500 hover:text-stone-800"
                    >
                      Hủy
                    </button>
                  </div>

                  {/* Label buttons */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">
                      Nhãn địa chỉ:
                    </label>
                    <div className="flex gap-2">
                      {['Nhà riêng', 'Văn phòng', 'Khác'].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setLabel(lbl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            label === lbl
                              ? 'bg-[#14452F] text-[#F5C518]'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-1">
                        Tên người nhận *:
                      </label>
                      <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="VD: Nguyễn Thu Hà"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-1">
                        Số điện thoại *:
                      </label>
                      <input
                        type="tel"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="VD: 0901234567"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        required
                      />
                    </div>
                  </div>

                  {/* 1 Ô DUY NHẤT NHẬP ĐỊA CHỈ (Đã bỏ phường) */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Địa chỉ nhận hàng chi tiết (Số nhà, tên đường, phường...)*:
                    </label>
                    <input
                      type="text"
                      value={addressDetail}
                      onChange={(e) => setAddressDetail(e.target.value)}
                      placeholder="VD: 183/12 Cộng Hòa, Phường 12, Tân Bình"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                      required
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      * Nhập cụ thể số nhà và tên đường để shipper giao nhanh và tính cự ly chính xác.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#14452F] hover:bg-[#185338] text-[#F5C518] font-black text-xs transition shadow-sm cursor-pointer"
                  >
                    Lưu địa chỉ & Giao đến đây
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* PICKUP MODE: 4 BRANCHES OF HONNE */
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-stone-700 tracking-wider block">
                Chọn chi nhánh HONNE thuận tiện nhất ({branches.length} điểm):
              </span>

              {branches.map((b) => {
                const isSelected = selectedBranch.id === b.id && orderMode === 'pickup';
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBranchForPickup(b)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#14452F] text-amber-300'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        <Store className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <span className="font-extrabold text-stone-900 text-sm">{b.name}</span>
                        <div className="text-xs text-stone-600 mt-0.5 font-medium truncate">
                          {b.address}, {b.ward}, {b.district}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-stone-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" /> {b.openingHours}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" /> {b.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
          <div className="truncate pr-2">
            <span className="text-stone-500 block">Đang chọn:</span>
            <span className="font-extrabold text-[#14452F] truncate block">
              {activeTab === 'delivery'
                ? `Giao: ${currentAddress.addressDetail} (Cách ${currentDist}km)`
                : `Lấy tại: ${selectedBranch.name}`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setOrderMode(activeTab);
              setIsLocationModalOpen(false);
              showToast('Đã xác nhận điểm nhận đơn!', 'success');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#14452F] hover:bg-[#185338] text-[#F5C518] font-black text-xs transition shadow-sm shrink-0 cursor-pointer"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
