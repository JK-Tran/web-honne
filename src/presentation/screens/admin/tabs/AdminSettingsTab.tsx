import React, { useState } from 'react';
import {
  Settings,
  Store,
  Clock,
  Wifi,
  Phone,
  MapPin,
  QrCode,
  Save,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export const AdminSettingsTab: React.FC = () => {
  const { showToast } = useToast();

  const [brandName, setBrandName] = useState('HONNE COFFEE & TEA');
  const [hotline, setHotline] = useState('0379 467 986');
  const [openingHours, setOpeningHours] = useState('06:30 - 22:30 (Thứ 2 - Chủ Nhật)');
  const [wifiSsid, setWifiSsid] = useState('HonneCoffee_HighSpeed');
  const [wifiPass, setWifiPass] = useState('honne@2026');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [soundVolume, setSoundVolume] = useState(80);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu cấu hình hệ thống vận hành thành công!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#EDE2D0] shadow-xs">
        <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#103B27]" />
          <span>Cài Đặt Hệ Thống & Điểm Bán</span>
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Thông tin thương hiệu, ca trực, kết nối Wi-Fi quầy và cấu hình thông báo
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tên Chuỗi Quán</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-[#103B27]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Hotline CSKH / Đặt Bàn</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:border-[#103B27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Khung Giờ Phục Vụ</label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#103B27]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tên Wi-Fi Tại Quán (SSID)</label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-[#103B27]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Mật Khẩu Wi-Fi</label>
              <input
                type="text"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:border-[#103B27]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-stone-900">Âm Lượng Chuông Báo Đơn Mới (POS Chime)</div>
              <div className="text-[11px] text-stone-500">Chuông phát tự động qua loa máy thu ngân</div>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={soundVolume}
              onChange={(e) => setSoundVolume(Number(e.target.value))}
              className="accent-[#103B27] cursor-pointer"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0A2618] hover:bg-[#103B27] text-[#F5C518] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Quán</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
