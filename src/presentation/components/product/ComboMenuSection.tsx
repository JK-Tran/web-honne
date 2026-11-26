import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  X,
  Check,
  RefreshCw,
  Users,
  Flame,
  Plus
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrencyVND } from '../../../shared/utils/currency';
import {
  PromoCombo,
  DrinkOption,
  ComboCupConfig,
  DRINK_CATALOG,
  PROMO_COMBOS,
  findDrinkInfo,
  getToppingsForDrink
} from '../../../shared/constants/comboConfig';

export const ComboMenuSection: React.FC = () => {
  const { addComboItem } = useCart();

  const [selectedCombo, setSelectedCombo] = useState<PromoCombo | null>(null);
  const [comboCups, setComboCups] = useState<ComboCupConfig[]>([]);
  const [editingDrinkCupIdx, setEditingDrinkCupIdx] = useState<number | null>(null);

  const handleOpenComboModal = (combo: PromoCombo) => {
    setSelectedCombo(combo);
    setEditingDrinkCupIdx(null);

    if (combo.id === 'combo-morning') {
      const d1 = findDrinkInfo('Cà phê Muối Cố Đô');
      const d2 = findDrinkInfo('Cà phê Sữa Tươi Thanh Trùng');
      setComboCups([
        { drinkName: d1.name, drinkImage: d1.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: [] },
        { drinkName: d2.name, drinkImage: d2.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: [] }
      ]);
    } else if (combo.id === 'combo-afternoon') {
      const d1 = findDrinkInfo('Trà Đào Cam Sả Tươi');
      const d2 = findDrinkInfo('Trà Vải Hoa Lài Thanh Mát');
      setComboCups([
        { drinkName: d1.name, drinkImage: d1.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: ['top-dao-them'], freeToppingId: 'top-dao-them' },
        { drinkName: d2.name, drinkImage: d2.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: ['top-vai-them'], freeToppingId: 'top-vai-them' }
      ]);
    } else if (combo.id === 'combo-pair') {
      const d1 = findDrinkInfo('Cacao Muối Biển Macchiato');
      const d2 = findDrinkInfo('Matcha Latte Shizuoka Thượng Hạng');
      setComboCups([
        { drinkName: d1.name, drinkImage: d1.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: [] },
        { drinkName: d2.name, drinkImage: d2.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: [] }
      ]);
    } else if (combo.id === 'combo-party') {
      const d1 = findDrinkInfo('Trà Đào Cam Sả Tươi');
      const d2 = findDrinkInfo('Trà Vải Hoa Lài Thanh Mát');
      const d3 = findDrinkInfo('Cà phê Muối Cố Đô');
      const d4 = findDrinkInfo('Matcha Latte Shizuoka Thượng Hạng');
      const d5 = findDrinkInfo('Cacao Sữa Tươi Đậm Đà');
      setComboCups([
        { drinkName: d1.name, drinkImage: d1.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: ['top-thach-cu-nang'], freeToppingId: 'top-thach-cu-nang' },
        { drinkName: d2.name, drinkImage: d2.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: ['top-thach-cu-nang'], freeToppingId: 'top-thach-cu-nang' },
        { drinkName: d3.name, drinkImage: d3.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: [] },
        { drinkName: d4.name, drinkImage: d4.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: [] },
        { drinkName: d5.name, drinkImage: d5.image, size: 'M', sugar: '50% (Chuẩn)', ice: '100% đá (Chuẩn)', selectedToppingIds: [] }
      ]);
    }
  };

  const handleUpdateCup = (index: number, updates: Partial<ComboCupConfig>) => {
    setComboCups((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  };

  const handleSelectDrinkForCup = (cupIdx: number, drink: DrinkOption) => {
    setComboCups((prev) =>
      prev.map((c, i) => {
        if (i !== cupIdx) return c;
        return {
          ...c,
          drinkName: drink.name,
          drinkImage: drink.image,
          selectedToppingIds: c.freeToppingId ? [c.freeToppingId] : []
        };
      })
    );
    setEditingDrinkCupIdx(null);
  };

  const handleToggleTopping = (cupIdx: number, toppingId: string) => {
    setComboCups((prev) =>
      prev.map((c, i) => {
        if (i !== cupIdx) return c;
        const exists = c.selectedToppingIds.includes(toppingId);
        const updated = exists
          ? c.selectedToppingIds.filter((id) => id !== toppingId)
          : [...c.selectedToppingIds, toppingId];
        return { ...c, selectedToppingIds: updated };
      })
    );
  };

  const calculateComboTotal = () => {
    if (!selectedCombo) return 0;
    let total = selectedCombo.promoPrice;

    comboCups.forEach((cup) => {
      if ((selectedCombo.id === 'combo-morning' || selectedCombo.id === 'combo-party') && cup.size === 'L') {
        total += 5000;
      }
      const toppings = getToppingsForDrink(cup.drinkName, cup.freeToppingId);
      cup.selectedToppingIds.forEach((tId) => {
        const topItem = toppings.find((t) => t.id === tId);
        if (topItem && topItem.price > 0) {
          total += topItem.price;
        }
      });
    });

    return total;
  };

  const handleConfirmAddCombo = () => {
    if (!selectedCombo) return;
    const finalPrice = calculateComboTotal();

    const formattedDrinks = comboCups.map((c) => {
      const toppings = getToppingsForDrink(c.drinkName, c.freeToppingId);
      const toppingNames = c.selectedToppingIds.map((tId) => {
        const top = toppings.find((t) => t.id === tId);
        if (!top) return '';
        if (top.price === 0) return `${top.name} (0đ - Đã bao gồm)`;
        return `${top.name} (+${formatCurrencyVND(top.price)})`;
      }).filter(Boolean);

      return {
        drinkName: c.drinkName,
        size: c.size,
        sugar: c.sugar,
        ice: c.ice,
        toppings: toppingNames
      };
    });

    addComboItem({
      id: selectedCombo.id,
      name: selectedCombo.name,
      price: finalPrice,
      image: selectedCombo.image,
      drinks: formattedDrinks,
      rawComboCups: comboCups
    });

    setSelectedCombo(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200 pb-3">
        <div>
          <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-wide uppercase">
            Combo
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Tiết kiệm hơn khi đặt theo combo 2 - 5 ly
          </p>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {PROMO_COMBOS.map((combo) => (
          <div
            key={combo.id}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-900 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                  {combo.badge}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Tiết kiệm {formatCurrencyVND(combo.savings)}
                </span>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-20 h-24 sm:w-28 sm:h-32 rounded-xl sm:rounded-2xl bg-[#F6F5F0] p-1.5 sm:p-2 flex items-center justify-center shrink-0 border border-stone-100 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="max-h-full max-w-full object-contain drop-shadow-md"
                  />
                </div>

                <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
                  <h3 className="font-black text-stone-900 text-sm sm:text-lg leading-snug">
                    {combo.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {combo.description}
                  </p>
                  <div className="text-[10px] sm:text-[11px] text-emerald-800 font-semibold pt-0.5">
                    {combo.items.join(' • ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] sm:text-[11px] text-stone-400 line-through font-semibold">
                  {formatCurrencyVND(combo.originalPrice)}
                </div>
                <div className="text-lg sm:text-2xl font-black text-[#14452F]">
                  {formatCurrencyVND(combo.promoPrice)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenComboModal(combo)}
                className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#14452F] hover:bg-[#185338] text-[#F5C518] font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Tùy chỉnh & Đặt</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* COMBO CUSTOMIZER MODAL */}
      {selectedCombo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#14452F] to-[#185338] text-white flex items-center justify-between shrink-0 border-b border-[#206645]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 p-1.5 flex items-center justify-center border border-white/20 shrink-0 shadow-sm">
                  <img src={selectedCombo.image} alt={selectedCombo.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-[#F5C518] text-[#14452F] text-[10px] font-black uppercase">
                      {selectedCombo.badge}
                    </span>
                    <span className="text-[11px] font-bold text-amber-200">
                      Tiết kiệm {formatCurrencyVND(selectedCombo.savings)}
                    </span>
                  </div>
                  <h3 className="font-black text-white text-base sm:text-lg leading-tight mt-0.5">
                    {selectedCombo.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCombo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 ml-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Scrollable Cups Customizer */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[64vh] bg-[#FBFBF9]">
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-950 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tùy chỉnh độ ngọt, đá và topping theo khẩu vị của bạn (Topping tặng kèm đã được chọn sẵn 0đ):</span>
              </div>

              {comboCups.map((cup, idx) => {
                const toppings = getToppingsForDrink(cup.drinkName, cup.freeToppingId);
                const isPickingDrink = editingDrinkCupIdx === idx;

                return (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3.5">
                    {/* Cup Title & Drink Switcher */}
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 p-1 flex items-center justify-center border border-stone-200 shrink-0">
                          <img src={cup.drinkImage} alt={cup.drinkName} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <span className="w-5 h-5 rounded-full bg-[#14452F] text-[#F5C518] text-[10px] font-black inline-flex items-center justify-center mr-1.5">
                            {idx + 1}
                          </span>
                          <span className="font-black text-stone-900 text-xs sm:text-sm">
                            Ly {idx + 1}: {cup.drinkName}
                          </span>
                          {selectedCombo.id === 'combo-party' && (
                            <button
                              type="button"
                              onClick={() => setEditingDrinkCupIdx(isPickingDrink ? null : idx)}
                              className="ml-2 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{isPickingDrink ? 'Đóng chọn món' : 'Đổi món'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Size Picker */}
                      <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateCup(idx, { size: 'M' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                            cup.size === 'M' ? 'bg-[#14452F] text-[#F5C518] shadow-xs' : 'text-stone-600'
                          }`}
                        >
                          Size M
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCup(idx, { size: 'L' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                            cup.size === 'L' ? 'bg-[#14452F] text-[#F5C518] shadow-xs' : 'text-stone-600'
                          }`}
                        >
                          Size L (+5k)
                        </button>
                      </div>
                    </div>

                    {/* Drink Picker Selector Grid */}
                    {isPickingDrink && (
                      <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2 animate-fade-in">
                        <span className="text-[11px] font-black uppercase text-emerald-900 block">
                          Chọn thức uống cho Ly {idx + 1}:
                        </span>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {DRINK_CATALOG.map((drink) => {
                            const isChosen = drink.name === cup.drinkName;
                            return (
                              <button
                                key={drink.id}
                                type="button"
                                onClick={() => handleSelectDrinkForCup(idx, drink)}
                                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                                  isChosen
                                    ? 'bg-[#14452F] text-white border-[#14452F]'
                                    : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
                                }`}
                              >
                                <img src={drink.image} alt={drink.name} className="w-8 h-8 object-contain shrink-0" />
                                <div className="min-w-0">
                                  <div className={`text-xs font-bold truncate ${isChosen ? 'text-[#F5C518]' : 'text-stone-900'}`}>
                                    {drink.name}
                                  </div>
                                  <div className="text-[10px] text-stone-400 truncate">{drink.categoryLabel}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sugar Level */}
                    <div>
                      <span className="text-[11px] font-black uppercase text-stone-500 tracking-wider block mb-1.5">
                        Lượng đường:
                      </span>
                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        {['0%', '30%', '50%', '70%', '100%'].map((lvl) => {
                          const isSel = cup.sugar.startsWith(lvl);
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleUpdateCup(idx, { sugar: `${lvl}${lvl === '50%' ? ' (Chuẩn)' : ''}` })}
                              className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                isSel
                                  ? 'bg-[#14452F] text-[#F5C518] border-[#14452F]'
                                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ice Level */}
                    <div>
                      <span className="text-[11px] font-black uppercase text-stone-500 tracking-wider block mb-1.5">
                        Lượng đá:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        {['Không đá', '50% đá', '100% đá', 'Đá riêng'].map((lvl) => {
                          const isSel = cup.ice.startsWith(lvl);
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleUpdateCup(idx, { ice: `${lvl}${lvl === '100% đá' ? ' (Chuẩn)' : ''}` })}
                              className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                isSel
                                  ? 'bg-[#14452F] text-[#F5C518] border-[#14452F]'
                                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Toppings (Integrated into unified list) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-black uppercase text-stone-500 tracking-wider">
                          Topping cho ly này:
                        </span>
                        <span className="text-[10px] text-stone-400">(Tùy chọn theo sở thích)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {toppings.map((top) => {
                          const isSelected = cup.selectedToppingIds.includes(top.id);
                          const isFreeIncluded = top.isFree;

                          return (
                            <button
                              key={top.id}
                              type="button"
                              onClick={() => handleToggleTopping(idx, top.id)}
                              className={`p-2 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                                isSelected
                                  ? isFreeIncluded
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                                    : 'bg-[#14452F] border-[#14452F] text-[#F5C518] font-bold'
                                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? isFreeIncluded
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : 'bg-[#F5C518] border-[#F5C518] text-[#14452F]'
                                      : 'border-stone-300'
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className="truncate">{top.name}</span>
                              </div>
                              <span className={`text-[10px] shrink-0 ml-1 ${isFreeIncluded ? 'text-emerald-700 font-black' : ''}`}>
                                {isFreeIncluded ? '0đ (Đã bao gồm)' : `+${top.price / 1000}k`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex items-center justify-between gap-4 shrink-0">
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Tổng thanh toán combo:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#14452F]">
                    {formatCurrencyVND(calculateComboTotal())}
                  </span>
                  <span className="text-xs text-stone-400 line-through">
                    {formatCurrencyVND(selectedCombo.originalPrice)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmAddCombo}
                className="px-6 py-3 rounded-2xl bg-[#14452F] hover:bg-[#185338] text-[#F5C518] font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
