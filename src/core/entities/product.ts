export type ProductCategory = 'all' | 'coffee' | 'tea' | 'matcha' | 'cacao' | 'combo';

export type ProductSize = 'M' | 'L';

export interface ProductTopping {
  id: string;
  name: string;
  price: number;
  recommended?: boolean;
}

export interface ProductCustomizationRule {
  allowedSugarLevels: number[];
  allowedIceLevels: string[];
  allowedToppings: ProductTopping[];
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  branch: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  subtitle: string;
  description: string;
  ingredients?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  discountBadge?: string;
  availableSizes: ProductSize[];
  customizationRules: ProductCustomizationRule;
  reviews: ProductReview[];
}
