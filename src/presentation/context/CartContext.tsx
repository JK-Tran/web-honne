import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductSize, ProductTopping } from '../../core/entities/product';
import { CartItem, Voucher, ComboDrinkCustomization } from '../../core/entities/cart';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  voucher: Voucher | null;
  subtotal: number;
  discount: number;
  total: number;
  totalCount: number;
  addItem: (product: Product, size?: ProductSize, quantity?: number, toppings?: ProductTopping[]) => void;
  addComboItem: (combo: {
    id: string;
    name: string;
    price: number;
    image: string;
    drinks: ComboDrinkCustomization[];
    rawComboCups?: any[];
  }) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  applyVoucher: (code: string) => boolean;
  removeVoucher: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'honne_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items]);

  const addItem = (
    product: Product,
    size: ProductSize = 'M',
    quantity: number = 1,
    toppings: ProductTopping[] = []
  ) => {
    const sizeExtra = size === 'L' ? 6000 : 0;
    const toppingTotal = toppings.reduce((acc, t) => acc + t.price, 0);
    const itemPrice = product.price + sizeExtra + toppingTotal;
    const itemId = `${product.id}-${size}-${toppings.map((t) => t.id).sort().join('-')}`;

    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === itemId);
      if (existing) {
        return prevItems.map((i) =>
          i.id === itemId
            ? {
                ...i,
                quantity: i.quantity + quantity,
                totalPrice: (i.quantity + quantity) * itemPrice
              }
            : i
        );
      } else {
        return [
          ...prevItems,
          {
            id: itemId,
            product,
            size,
            toppings,
            quantity,
            itemPrice,
            totalPrice: quantity * itemPrice
          }
        ];
      }
    });

    showToast(`Đã thêm ${product.name} (Size ${size}) vào giỏ hàng!`, 'success');
  };

  const addComboItem = (combo: {
    id: string;
    name: string;
    price: number;
    image: string;
    drinks: ComboDrinkCustomization[];
    rawComboCups?: any[];
  }) => {
    const itemId = `combo-${combo.id}-${Date.now()}`;
    const comboProduct: Product = {
      id: `combo-${combo.id}`,
      name: combo.name,
      category: 'other',
      price: combo.price,
      image: combo.image,
      rating: 5.0,
      reviewCount: 1,
      subtitle: combo.drinks.map((d) => `${d.drinkName} (${d.size})`).join(' + '),
      description: combo.drinks
        .map(
          (d, idx) =>
            `Ly ${idx + 1}: ${d.drinkName} (${d.size}, ${d.sugar}, ${d.ice}${
              d.toppings?.length ? ', ' + d.toppings.join(', ') : ''
            })`
        )
        .join(' | '),
      availableSizes: ['M']
    } as any;

    const newCartItem: CartItem = {
      id: itemId,
      product: comboProduct,
      size: 'M',
      toppings: [],
      quantity: 1,
      itemPrice: combo.price,
      totalPrice: combo.price,
      isCombo: true,
      comboDetails: {
        comboId: combo.id,
        comboName: combo.name,
        drinks: combo.drinks,
        rawComboCups: combo.rawComboCups
      }
    };

    setItems((prev) => [newCartItem, ...prev]);
    showToast(`Đã thêm "${combo.name}" vào giỏ hàng!`, 'success');
  };

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newItem = { ...item, ...updates };
          const unitPrice = updates.itemPrice !== undefined ? updates.itemPrice : item.itemPrice;
          const quantity = updates.quantity !== undefined ? updates.quantity : item.quantity;
          newItem.itemPrice = unitPrice;
          newItem.quantity = quantity;
          newItem.totalPrice = quantity * unitPrice;
          return newItem;
        }
        return item;
      })
    );
    showToast('Đã cập nhật món trong giỏ hàng!', 'success');
  };

  const removeItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    if (item) {
      showToast(`Đã xóa ${item.product.name} khỏi giỏ hàng`, 'info');
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantity: newQuantity,
              totalPrice: newQuantity * i.itemPrice
            }
          : i
      )
    );
  };

  const applyVoucher = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'HONNE20' || clean === 'CHILL20') {
      if (subtotal < 49000) {
        showToast('Đơn hàng cần tối thiểu 49.000đ để áp dụng mã HONNE20.', 'error');
        return false;
      }
      setVoucher({
        code: clean,
        description: 'Giảm 20% cho đơn hàng đầu tiên (tối đa 40.000đ)',
        discountPercent: 20,
        minOrderValue: 49000,
        maxDiscount: 40000
      });
      showToast('Áp dụng mã giảm giá 20% thành công!', 'success');
      return true;
    } else if (clean === 'FREESHIP') {
      if (subtotal < 99000) {
        showToast('Đơn hàng cần tối thiểu 99.000đ để áp dụng mã FREESHIP.', 'error');
        return false;
      }
      setVoucher({
        code: clean,
        description: 'Miễn phí vận chuyển (Trừ 20.000đ phí giao)',
        discountAmount: 20000,
        minOrderValue: 99000
      });
      showToast('Đã áp dụng mã miễn phí giao hàng!', 'success');
      return true;
    } else if (clean === 'HONNE30K') {
      if (subtotal < 149000) {
        showToast('Đơn hàng cần tối thiểu 149.000đ để áp dụng mã HONNE30K.', 'error');
        return false;
      }
      setVoucher({
        code: clean,
        description: 'Giảm 30.000đ cho đơn từ 149.000đ',
        discountAmount: 30000,
        minOrderValue: 149000
      });
      showToast('Áp dụng mã giảm 30.000đ thành công!', 'success');
      return true;
    } else if (clean === 'HONNE50K') {
      if (subtotal < 249000) {
        showToast('Đơn hàng cần tối thiểu 249.000đ để áp dụng mã HONNE50K.', 'error');
        return false;
      }
      setVoucher({
        code: clean,
        description: 'Giảm 50.000đ cho đơn nhóm từ 249.000đ',
        discountAmount: 50000,
        minOrderValue: 249000
      });
      showToast('Áp dụng mã giảm 50.000đ thành công!', 'success');
      return true;
    } else if (clean === 'HONNEVIP50') {
      if (subtotal < 60000) {
        showToast('Đơn hàng cần tối thiểu 60.000đ để áp dụng voucher VIP.', 'error');
        return false;
      }
      setVoucher({
        code: clean,
        description: 'Đặc quyền VIP Điểm danh: Giảm 50% (tối đa 50.000đ)',
        discountPercent: 50,
        minOrderValue: 60000,
        maxDiscount: 50000
      });
      showToast('Đã áp dụng mã giảm giá 50% đặc quyền điểm danh!', 'success');
      return true;
    } else {
      showToast('Mã ưu đãi không hợp lệ hoặc đã hết hạn!', 'error');
      return false;
    }
  };

  const removeVoucher = () => {
    setVoucher(null);
    showToast('Đã hủy mã giảm giá', 'info');
  };

  const clearCart = () => {
    setItems([]);
    setVoucher(null);
  };

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

  let discount = 0;
  if (voucher) {
    if (voucher.discountPercent) {
      discount = Math.round((subtotal * voucher.discountPercent) / 100);
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else if (voucher.discountAmount) {
      discount = Math.min(voucher.discountAmount, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discount);
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        voucher,
        subtotal,
        discount,
        total,
        totalCount,
        addItem,
        addComboItem,
        updateCartItem,
        removeItem,
        updateQuantity,
        applyVoucher,
        removeVoucher,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
