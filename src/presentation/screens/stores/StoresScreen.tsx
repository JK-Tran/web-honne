import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Search,
  ExternalLink,
  Wifi,
  Car,
  Wind,
  CreditCard,
  Copy,
  Check,
  Star,
  Quote,
  Store,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStores } from '../../hooks/useStores';
import { StoreLocation } from '../../../core/entities/store';
import { useToast } from '../../context/ToastContext';

export const StoresScreen: React.FC = () => {
  const { stores, selectedStore, setSelectedStore } = useStores();
  const { showToast } = useToast();
  const [filterStreet, setFilterStreet] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const [viewAllMap, setViewAllMap] = useState<boolean>(false);

  const filteredStores = stores.filter((store) => {
    const matchesStreet =
      filterStreet === 'all' ||
      (filterStreet === 'cong-hoa' && store.address.includes('Cộng Hòa')) ||
      (filterStreet === 'quach-van-tuan' && store.address.includes('Quách Văn Tuấn'));

    const matchesQuery =
      !searchQuery.trim() ||
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStreet && matchesQuery;
  });

  const handleOpenGoogleMaps = (store: StoreLocation) => {
    const url = store.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name}, ${store.address}, Tân Bình`)}`;
    window.open(url, '_blank');
  };

  const handleCopyAddress = (store: StoreLocation) => {
    navigator.clipboard?.writeText(`${store.name} - ${store.address}, ${store.city}`);
    setCopiedStoreId(store.id);
    showToast(`Đã sao chép địa chỉ ${store.name}!`, 'success');
    setTimeout(() => setCopiedStoreId(null), 2000);
  };

  // Google Maps Embed Query logic: exactly match Google Business profiles as registered on Google Maps
  const getMapQuery = () => {
    if (viewAllMap || !selectedStore) {
      return 'HONNE COFFE & TEA, Tân Bình, Hồ Chí Minh';
    }
    if (selectedStore.id === 'honne-2-quach-van-tuan') {
      return 'HONNE COFFE & TEA, 2 Quách Văn Tuấn, Tân Bình';
    }
    if (selectedStore.id === 'honne-22a-cong-hoa') {
      return 'HONNE COFFEE&TEA 3, 22A Cộng Hòa, Tân Bình';
    }
    if (selectedStore.id === 'honne-121-cong-hoa') {
      return 'HONNE COFFE & TEA, 121 Cộng Hòa, Tân Bình';
    }
    return '183 Cộng Hòa, Phường 13, Tân Bình, Hồ Chí Minh';
  };

  const mapZoom = viewAllMap ? 15 : 17;

  return (
    <div className="min-h-screen bg-[#FBFBF9] pb-24 text-[#1A1A1A] w-full overflow-hidden">
      {/* 1. Header Banner - Editorial Designer Style */}
      <section className="bg-gradient-to-r from-[#103B27] via-[#14452F] to-[#0A1D13] text-white py-8 sm:py-12 px-3 sm:px-6 lg:px-8 border-b border-[#206645] w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[#F5C518] text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 sm:mb-2">
              <MapPin className="w-4 h-4" /> Hệ thống chi nhánh chính thức
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">
              Hệ thống 4 cửa hàng HONNE
            </h1>
            <p className="text-stone-300 text-xs sm:text-base mt-0.5 sm:mt-1">
              Các chi nhánh tại trục đường Cộng Hòa & Quách Văn Tuấn, Quận Tân Bình, TP.HCM
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#103824] border border-emerald-600/30 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-md self-stretch sm:self-auto">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F5C518] animate-ping shrink-0" />
            <div>
              <span className="text-xs font-black text-[#F5C518] block uppercase">4 Chi nhánh đang mở cửa</span>
              <span className="text-[10px] sm:text-[11px] text-stone-300">06:30 - 22:30 hàng ngày • Giao nhanh 30 phút</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Store Locator (Side-by-side with Real Google Maps, exactly like Google Places) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI: Danh sách chi nhánh & Tìm kiếm (5 Cột) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo số nhà, tên đường (183, 2, 121, 22A)..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#14452F] pl-10 bg-stone-50"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Quick Street Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterStreet('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                    filterStreet === 'all'
                      ? 'bg-[#14452F] text-[#F5C518]'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Tất cả (4)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStreet('cong-hoa')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                    filterStreet === 'cong-hoa'
                      ? 'bg-[#14452F] text-[#F5C518]'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Cộng Hòa (3)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStreet('quach-van-tuan')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                    filterStreet === 'quach-van-tuan'
                      ? 'bg-[#14452F] text-[#F5C518]'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Quách Văn Tuấn (1)
                </button>
              </div>
            </div>

            {/* Danh sách 4 chi nhánh dạng thẻ Google Places */}
            <div className="space-y-3">
              {filteredStores.map((store) => {
                const isSelected = selectedStore?.id === store.id && !viewAllMap;

                return (
                  <div
                    key={store.id}
                    onClick={() => {
                      setSelectedStore(store);
                      setViewAllMap(false);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 ${
                      isSelected
                        ? 'bg-[#FAFBF9] border-[#14452F] ring-2 ring-[#14452F] shadow-md'
                        : 'bg-white border-stone-200 hover:border-stone-400 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar / Thumbnail */}
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <img
                          src={store.avatar || store.image}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-stone-900 text-sm sm:text-base leading-snug">
                            {store.name}
                          </h4>
                          {store.isFlagship && (
                            <span className="text-[10px] font-black uppercase bg-[#F5C518] text-[#103B27] px-2 py-0.5 rounded-xs">
                              Flagship
                            </span>
                          )}
                        </div>

                        {/* Google Review Rating */}
                        {store.rating && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                            <span className="flex items-center text-amber-500 font-black">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                              {store.rating.toFixed(1)}
                            </span>
                            <span className="text-stone-400">•</span>
                            <span className="text-stone-500 font-medium">({store.reviewsCount})</span>
                            <span className="text-stone-400">•</span>
                            <span className="text-stone-600 font-semibold">Quán cà phê</span>
                          </div>
                        )}

                        <p className="text-xs text-stone-700 font-semibold mt-1">
                          {store.address}
                        </p>
                      </div>
                    </div>

                    {/* Review Quote from Real Customer */}
                    {store.quote && (
                      <div className="bg-[#FAF8EE] border-l-2 border-[#F5C518] px-2.5 py-1.5 rounded-r-sm text-[11px] text-stone-700 italic flex items-start gap-1.5">
                        <Quote className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">&ldquo;{store.quote}&rdquo;</span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Đang mở cửa • {store.openingHours.split('(')[0]}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAddress(store);
                          }}
                          className="p-1.5 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition"
                          title="Sao chép địa chỉ"
                        >
                          {copiedStoreId === store.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenGoogleMaps(store);
                          }}
                          className="px-2.5 py-1 rounded bg-[#F5C518] hover:bg-[#ffd54f] text-[#103B27] font-bold text-[11px] flex items-center gap-1 shadow-2xs transition"
                        >
                          Chỉ đường <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI: BẢN ĐỒ GOOGLE MAPS THỰC TẾ (7 Cột) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden sticky top-24">
            {/* Map Header & Fast Branch Switcher */}
            <div className="p-4 border-b border-stone-200 bg-stone-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase text-[#14452F] tracking-wider block">
                    {viewAllMap ? 'Bản đồ toàn tuyến Tân Bình' : selectedStore?.name}
                  </span>
                  <p className="text-xs text-stone-600 font-medium">
                    {viewAllMap
                      ? 'Hiển thị khu vực đường Cộng Hòa & Quách Văn Tuấn'
                      : `${selectedStore?.address}, Q. Tân Bình`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedStore) handleOpenGoogleMaps(selectedStore);
                  }}
                  className="px-3 py-1.5 rounded-md bg-[#14452F] text-[#F5C518] hover:bg-[#153B27] font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
                >
                  Mở trong Maps <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Map Location Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {stores.map((s) => {
                  const isActive = selectedStore?.id === s.id && !viewAllMap;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedStore(s);
                        setViewAllMap(false);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-[#F5C518] text-[#103B27] shadow-xs'
                          : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{s.name.replace('HONNE ', '')}</span>
                      {s.rating && (
                        <span className="text-[10px] font-black">★ {s.rating}</span>
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setViewAllMap(true)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    viewAllMap
                      ? 'bg-[#14452F] text-[#F5C518]'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Layers className="w-3 h-3" /> Toàn tuyến Tân Bình
                </button>
              </div>
            </div>

            {/* REAL INTERACTIVE GOOGLE MAPS IFRAME */}
            <div className="relative w-full h-[300px] sm:h-[450px] lg:h-[500px] bg-stone-100">
              <iframe
                title="Google Maps HONNE Coffee Tân Bình"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(getMapQuery())}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>

            {/* Bottom info bar */}
            {selectedStore && !viewAllMap && (
              <div className="p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#14452F]" />
                    <span>06:30 - 22:30</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#14452F]" />
                    <a href={`tel:${selectedStore.phone}`} className="font-bold text-[#14452F] hover:underline">
                      {selectedStore.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyAddress(selectedStore)}
                    className="px-3 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Sao chép địa chỉ
                  </button>
                  <button
                    onClick={() => handleOpenGoogleMaps(selectedStore)}
                    className="px-4 py-1.5 rounded-md bg-[#F5C518] hover:bg-[#ffd54f] text-[#103B27] font-black transition flex items-center gap-1 shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Dẫn đường
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
