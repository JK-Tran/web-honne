import { Product, ProductSize, ProductTopping } from './product';

export interface ComboDrinkCustomization {
  drinkName: string;
  size: 'M' | 'L';
  sugar: string;
  ice: string;
  toppings?: string[];
  drinkImage?: string;
  selectedToppingIds?: string[];
  freeToppingId?: string;
}

export interface CartItem {
  id: string; // unique item id
  product: Product;
  size: ProductSize;
  toppings: ProductTopping[];
  quantity: number;
  itemPrice: number;
  totalPrice: number;
  isCombo?: boolean;
  comboDetails?: {
    comboId: string;
    comboName: string;
    drinks: ComboDrinkCustomization[];
    rawComboCups?: any[];
  };
}

export interface Voucher {
  code: string;
  description: string;
  discountAmount?: number;
  discountPercent?: number;
  minOrderValue: number;
  maxDiscount?: number;
}

export interface CartState {
  items: CartItem[];
  voucher: Voucher | null;
  subtotal: number;
  discount: number;
  total: number;
}
