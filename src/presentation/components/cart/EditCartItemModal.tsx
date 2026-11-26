import React, { useState, useEffect } from 'react';
import { X, Check, Coffee, Sparkles, RefreshCw } from 'lucide-react';
import { CartItem, ComboDrinkCustomization } from '../../../core/entities/cart';
import { formatCurrencyVND } from '../../../shared/utils/currency';
import {
  DRINK_CATALOG,
  DrinkOption,
  ComboCupConfig,
  getToppingsForDrink,
  findDrinkInfo,
  PROMO_COMBOS
} from '../../../shared/constants/comboConfig';

interface EditCartItemModalProps {
  item: CartItem | null;
  onClose: () => void;
  onSave: (updatedItem: Partial<CartItem>) => void;
}

export const EditCartItemModal: React.FC<EditCartItemModalProps> = ({ item, onClose, onSave }) => {
  if (!item) return null;

  // Is this item a combo or a single drink?
  const isCombo = Boolean(item.isCombo && item.comboDetails);

  // States for COMBO editing
  const [comboCups, setComboCups] = useState<ComboCupConfig[]>(() => {
    if (isCombo && item.comboDetails) {
      if (item.comboDetails.rawComboCups && item.comboDetails.rawComboCups.length > 0) {
        return JSON.parse(JSON.stringify(item.comboDetails.rawComboCups));
      }
      // Reconstruct cups from drinks list
      const comboId = item.comboDetails.comboId;
      return item.comboDetails.drinks.map((d) => {
        const drinkInfo = findDrinkInfo(d.drinkName);
        let freeTopId: string | undefined = undefined;
        if (comboId === 'combo-pair') freeTopId = 'tran-chau-hoang-kim';
        if (comboId === 'combo-afternoon') {
          if (d.drinkName.toLowerCase().includes('đào')) freeTopId = 'mieng-dao';
          else if (d.drinkName.toLowerCase().includes('vải')) freeTopId = 'trai-vai';
        }
        if (comboId === 'combo-party') freeTopId = 'thach-cu-nang';

        // Extract selected toppings
        const availableTops = getToppingsForDrink(d.drinkName, freeTopId);
        const selectedIds: string[] = [];
        if (freeTopId) selectedIds.push(freeTopId);
        if (d.toppings) {
          d.toppings.forEach((tName) => {
            const found = availableTops.find((at) => tName.toLowerCase().includes(at.name.toLowerCase()));
            if (found && !selectedIds.includes(found.id)) {
              selectedIds.push(found.id);
            }
          });
        }

        return {
          drinkName: d.drinkName,
          drinkImage: drinkInfo.image,
          size: d.size,
          sugar: d.sugar || '50% (Chuẩn)',
          ice: d.ice || '100% đá (Chuẩn)',
          selectedToppingIds: selectedIds,
          freeToppingId: freeTopId
        };
      });
    }
    return [];
  });

  const [editingDrinkCupIdx, setEditingDrinkCupIdx] = useState<number | null>(null);

  // States for SINGLE DRINK editing
  const [singleSize, setSingleSize] = useState<'M' | 'L'>(item.size || 'M');
  const [singleSugar, setSingleSugar] = useState<string>('50% đường (Chuẩn)');
  const [singleIce, setSingleIce] = useState<string>('100% đá (Chuẩn)');
  const [singleToppings, setSingleToppings] = useState<{ id: string; name: string; price: number }[]>(
    item.toppings || []
  );

  // Dynamic base combo price lookup
  const matchedPromo = isCombo
    ? PROMO_COMBOS.find((c) => c.id === item.comboDetails?.comboId)
    : null;
  const basePromoPrice = matchedPromo ? matchedPromo.promoPrice : item.itemPrice;

  // Calculate Combo Price
  const calculateEditedComboPrice = () => {
    let total = basePromoPrice;
    const comboId = item.comboDetails?.comboId;

    comboCups.forEach((cup) => {
      if ((comboId === 'combo-morning' || comboId === 'combo-party') && cup.size === 'L') {
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

  // Calculate Single Drink Price
  const calculateEditedSinglePrice = () => {
    const base = item.product.price;
    const sizeExtra = singleSize === 'L' ? 6000 : 0;
    const topTotal = singleToppings.reduce((acc, t) => acc + t.price, 0);
    return base + sizeExtra + topTotal;
  };

  const handleSave = () => {
    if (isCombo && item.comboDetails) {
      const finalPrice = calculateEditedComboPrice();
      const formattedDrinks: ComboDrinkCustomization[] = comboCups.map((c) => {
        const toppingsForThisDrink = getToppingsForDrink(c.drinkName, c.freeToppingId);
        const toppingStrings = c.selectedToppingIds.map((tId) => {
          const top = toppingsForThisDrink.find((t) => t.id === tId);
          if (!top) return '';
          if (top.price === 0) return `${top.name} (0đ - Ưu đãi Combo)`;
          return `${top.name} (+${formatCurrencyVND(top.price)})`;
        }).filter(Boolean);

        return {
          drinkName: c.drinkName,
          size: c.size,
          sugar: c.sugar,
          ice: c.ice,
          toppings: toppingStrings,
          drinkImage: c.drinkImage,
          selectedToppingIds: c.selectedToppingIds,
          freeToppingId: c.freeToppingId
        };
      });

      onSave({
        itemPrice: finalPrice,
        comboDetails: {
          ...item.comboDetails,
          drinks: formattedDrinks,
          rawComboCups: comboCups
        }
      });
    } else {
      const finalPrice = calculateEditedSinglePrice();
      onSave({
        size: singleSize,
        toppings: singleToppings,
        itemPrice: finalPrice
      });
    }
    onClose();
  };

  const isPartyCombo = item.comboDetails?.comboId === 'combo-party';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-stone-200">
        {/* Header */}
        <div className="bg-[#14452F] text-white px-5 py-4 flex items-center justify-between border-b border-[#1E5E40] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#F5C518] text-[#14452F] flex items-center justify-center font-black">
              ✏️
            </span>
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#F5C518]">
                Chỉnh sửa {isCombo ? 'Combo' : 'Món nước'}
              </h3>
              <p className="text-xs text-stone-200 line-clamp-1">{item.product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {isCombo ? (
            /* COMBO EDITING INTERFACE */
            <div className="space-y-4">
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200 text-xs text-stone-700">
                ✨ Tùy chỉnh đường, đá, size hoặc đổi loại thức uống theo khẩu vị của bạn:
              </div>

              {comboCups.map((cup, idx) => {
                const cupToppings = getToppingsForDrink(cup.drinkName, cup.freeToppingId);
                const isChangingDrink = editingDrinkCupIdx === idx;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3"
                  >
                    {/* Cup Title & Switch drink button */}
                    <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-[#14452F] text-[#F5C518] font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <img
                            src={cup.drinkImage}
                            alt={cup.drinkName}
                            className="w-8 h-8 object-contain rounded-md bg-stone-100"
                          />
                          <span className="font-extrabold text-stone-900 text-sm">
                            {cup.drinkName}
                          </span>
                        </div>
                      </div>

                      {/* For Party combo or any cup: allow switching drinks */}
                      <button
                        type="button"
                        onClick={() => setEditingDrinkCupIdx(isChangingDrink ? null : idx)}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#14452F] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isChangingDrink ? 'Đóng chọn' : 'Đổi món'}</span>
                      </button>
                    </div>

                    {/* Drink Picker Grid if user clicked 'Đổi món' */}
                    {isChangingDrink && (
                      <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-2 animate-in fade-in">
                        <span className="text-[11px] font-bold text-emerald-900 uppercase block">
                          Chọn thức uống thay thế cho Ly {idx + 1}:
                        </span>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {DRINK_CATALOG.map((drink) => (
                            <button
                              key={drink.id}
                              type="button"
                              onClick={() => {
                                setComboCups((prev) =>
                                  prev.map((c, i) =>
                                    i === idx
                                      ? {
                                          ...c,
                                          drinkName: drink.name,
                                          drinkImage: drink.image,
                                          selectedToppingIds: c.freeToppingId ? [c.freeToppingId] : []
                                        }
                                      : c
                                  )
                                );
                                setEditingDrinkCupIdx(null);
                              }}
                              className={`p-2 rounded-xl text-left border flex items-center gap-2 transition cursor-pointer ${
                                cup.drinkName === drink.name
                                  ? 'bg-[#14452F] text-white border-[#14452F]'
                                  : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-300'
                              }`}
                            >
                              <img
                                src={drink.image}
                                alt={drink.name}
                                className="w-7 h-7 object-contain shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate leading-tight">
                                  {drink.name}
                                </div>
                                <div className="text-[10px] text-stone-400 truncate">
                                  {drink.categoryLabel}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Selector */}
                    <div>
                      <span className="text-xs font-bold text-stone-700 block mb-1.5">
                        Kích cỡ (Size):
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setComboCups((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, size: 'M' } : c))
                            )
                          }
                          className={`py-1.5 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer text-center ${
                            cup.size === 'M'
                              ? 'bg-[#14452F] text-amber-300 border-[#14452F]'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          Size M (Tiêu chuẩn)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setComboCups((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, size: 'L' } : c))
                            )
                          }
                          className={`py-1.5 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer text-center ${
                            cup.size === 'L'
                              ? 'bg-[#14452F] text-amber-300 border-[#14452F]'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          Size L {item.comboDetails?.comboId === 'combo-morning' || item.comboDetails?.comboId === 'combo-party' ? '(+5.000đ)' : '(Bao gồm)'}
                        </button>
                      </div>
                    </div>

                    {/* Sugar Selector */}
                    <div>
                      <span className="text-xs font-bold text-stone-700 block mb-1.5">
                        Lượng đường:
                      </span>
                      <div className="grid grid-cols-5 gap-1 text-xs">
                        {['0%', '30%', '50%', '70%', '100%'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setComboCups((prev) =>
                                prev.map((c, i) =>
                                  i === idx ? { ...c, sugar: `${s} đường` } : c
                                )
                              )
                            }
                            className={`py-1 rounded-lg font-bold border transition cursor-pointer text-center ${
                              cup.sugar.startsWith(s)
                                ? 'bg-[#14452F] text-amber-300 border-[#14452F]'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ice Selector */}
                    <div>
                      <span className="text-xs font-bold text-stone-700 block mb-1.5">
                        Lượng đá:
                      </span>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        {['Không đá', '50% đá', '100% đá', 'Đá riêng'].map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() =>
                              setComboCups((prev) =>
                                prev.map((c, i) => (i === idx ? { ...c, ice: ic } : c))
                              )
                            }
                            className={`py-1 rounded-lg font-bold border transition cursor-pointer text-center ${
                              cup.ice.startsWith(ic)
                                ? 'bg-[#14452F] text-amber-300 border-[#14452F]'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toppings for this cup */}
                    <div>
                      <span className="text-xs font-bold text-stone-700 block mb-1.5">
                        Topping cho ly này:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {cupToppings.map((top) => {
                          const isChecked = cup.selectedToppingIds.includes(top.id);
                          return (
                            <button
                              key={top.id}
                              type="button"
                              onClick={() => {
                                setComboCups((prev) =>
                                  prev.map((c, i) => {
                                    if (i !== idx) return c;
                                    const exists = c.selectedToppingIds.includes(top.id);
                                    const next = exists
                                      ? c.selectedToppingIds.filter((id) => id !== top.id)
                                      : [...c.selectedToppingIds, top.id];
                                    return { ...c, selectedToppingIds: next };
                                  })
                                );
                              }}
                              className={`p-2 rounded-xl text-left border flex items-center justify-between gap-1 transition cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                              }`}
                            >
                              <div className="truncate text-[11px] leading-tight">
                                <div>{top.name}</div>
                                <span className={`text-[10px] ${top.price === 0 ? 'text-emerald-700 font-black' : 'text-amber-800'}`}>
                                  {top.price === 0 ? '0đ (Ưu đãi Combo)' : `+${formatCurrencyVND(top.price)}`}
                                </span>
                              </div>
                              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                isChecked ? 'bg-[#14452F] border-[#14452F] text-white' : 'border-stone-300 bg-white'
                              }`}>
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* SINGLE DRINK EDITING INTERFACE */
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-stone-200"
                />
                <div>
                  <h4 className="font-extrabold text-stone-900 text-base">{item.product.name}</h4>
                  <p className="text-xs text-stone-500">{item.product.subtitle || 'Thức uống thủ công HONNE'}</p>
                  <span className="text-sm font-black text-[#14452F] block mt-1">
                    {formatCurrencyVND(item.product.price)}
                  </span>
                </div>
              </div>

              {/* Size */}
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1.5">Kích cỡ (Size):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleSize('M')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer text-center ${
                      singleSize === 'M'
                        ? 'bg-[#14452F] text-amber-300 border-[#14452F]'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Size M (Vừa vặn)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleSize('L')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer text-center ${
                      singleSize === 'L'
                        ? 'bg-[#14452F] text-amber-300 border-[#14452F]'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Size L (+6.000đ)
                  </button>
                </div>
              </div>

              {/* Sugar */}
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1.5">Lượng đường:</span>
                <div className="grid grid-cols-5 gap-1.5 text-xs">
                  {['0%', '30%', '50%', '70%', '100%'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSingleSugar(`${s} đường`)}
                      className={`py-1.5 rounded-lg font-bold border transition cursor-pointer text-center ${
                        singleSugar.startsWith(s)
                          ? 'bg-[#14452F] text-amber-300 border-[#14452F]'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice */}
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1.5">Lượng đá:</span>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {['Không đá', '50% đá', '100% đá', 'Đá riêng'].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setSingleIce(ic)}
                      className={`py-1.5 rounded-lg font-bold border transition cursor-pointer text-center ${
                        singleIce === ic
                          ? 'bg-[#14452F] text-amber-300 border-[#14452F]'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toppings for Single */}
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1.5">Topping thêm:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'tran-chau-hoang-kim', name: 'Trân châu Hoàng Kim', price: 5000 },
                    { id: 'pudding-trung', name: 'Pudding Trứng nướng', price: 5000 },
                    { id: 'kem-cheese-macchiato', name: 'Kem Cheese Macchiato', price: 6000 },
                    { id: 'thach-cu-nang', name: 'Thạch Củ Năng giòn', price: 4000 }
                  ].map((top) => {
                    const isChecked = singleToppings.some((t) => t.id === top.id);
                    return (
                      <button
                        key={top.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSingleToppings((prev) => prev.filter((t) => t.id !== top.id));
                          } else {
                            setSingleToppings((prev) => [...prev, top]);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border flex items-center justify-between gap-1 transition cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{top.name}</div>
                          <span className="text-[10px] text-amber-800">+{formatCurrencyVND(top.price)}</span>
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-[#14452F] border-[#14452F] text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-5 py-4 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] text-stone-500 block uppercase font-bold">Tổng thanh toán món:</span>
            <span className="text-xl font-black text-[#14452F]">
              {formatCurrencyVND(isCombo ? calculateEditedComboPrice() : calculateEditedSinglePrice())}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-200 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] text-[#14452F] font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Cập nhật giỏ hàng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
