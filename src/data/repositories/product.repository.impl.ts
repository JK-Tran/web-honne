import { Product, ProductCategory, ProductTopping } from '../../core/entities/product';
import { IProductRepository } from '../../core/repositories/product.repository';
import { MOCK_PRODUCTS } from '../mock/products.mock';

const API_BASE_URL = 'https://api-honne.hanhan02102012.workers.dev/api';

function getDefaultToppings(category: ProductCategory): ProductTopping[] {
  if (category === 'coffee') {
    return [
      { id: 'top-kem-muoi', name: 'Lớp Kem Muối béo mịn', price: 6000, recommended: true },
      { id: 'top-shot', name: 'Thêm 1 Shot Espresso mộc', price: 5000 },
      { id: 'top-thach-cf', name: 'Thạch Cà phê giòn dai', price: 4000 }
    ];
  } else if (category === 'tea') {
    return [
      { id: 'top-dao-them', name: 'Thêm Đào miếng giòn ngọt', price: 6000, recommended: true },
      { id: 'top-vai-them', name: 'Thêm Vải tươi mọng nước', price: 6000 },
      { id: 'top-thach-cu-nang', name: 'Thạch Củ Năng giòn ngọt', price: 4000 },
      { id: 'top-nha-dam', name: 'Nha đam tươi giòn mát', price: 4000 }
    ];
  } else {
    return [
      { id: 'top-kem-cheese', name: 'Kem Cheese Macchiato mặn', price: 6000, recommended: true },
      { id: 'top-pudding', name: 'Pudding Trứng nướng béo ngậy', price: 5000 },
      { id: 'top-thach-cu-nang', name: 'Thạch Củ Năng giòn ngọt', price: 4000 }
    ];
  }
}

function enrichProduct(raw: any): Product {
  const category = (raw.category || 'coffee') as ProductCategory;
  const mock = MOCK_PRODUCTS.find((m) => m.id === raw.id);
  const rawRules = raw.customizationRules || {};

  const allowedSugarLevels =
    Array.isArray(rawRules.allowedSugarLevels) && rawRules.allowedSugarLevels.length > 0
      ? rawRules.allowedSugarLevels
      : mock?.customizationRules?.allowedSugarLevels || [0, 30, 50, 70, 100];

  const allowedIceLevels =
    Array.isArray(rawRules.allowedIceLevels) && rawRules.allowedIceLevels.length > 0
      ? rawRules.allowedIceLevels
      : mock?.customizationRules?.allowedIceLevels || ['Không đá', '50% đá', '100% đá', 'Đá riêng'];

  const allowedToppings =
    Array.isArray(rawRules.allowedToppings) && rawRules.allowedToppings.length > 0
      ? rawRules.allowedToppings
      : mock?.customizationRules?.allowedToppings || getDefaultToppings(category);

  return {
    ...raw,
    category,
    availableSizes:
      Array.isArray(raw.availableSizes) && raw.availableSizes.length > 0
        ? raw.availableSizes
        : ['M', 'L'],
    customizationRules: {
      allowedSugarLevels,
      allowedIceLevels,
      allowedToppings
    },
    reviews: Array.isArray(raw.reviews) ? raw.reviews : []
  };
}

export class ProductRepositoryImpl implements IProductRepository {
  private cache: Product[] | null = null;
  private cacheTimestamp: number = 0;
  private CACHE_TTL = 30000; // 30s cache

  private async fetchProductsFromApi(): Promise<Product[]> {
    const now = Date.now();
    if (this.cache && now - this.cacheTimestamp < this.CACHE_TTL) {
      return this.cache;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const enriched = json.data.map(enrichProduct);
          this.cache = enriched;
          this.cacheTimestamp = now;
          return enriched;
        }
      }
    } catch (err) {
      console.warn('Lỗi kết nối API thức uống, chuyển sang dữ liệu nội bộ:', err);
    }

    return MOCK_PRODUCTS.map(enrichProduct);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.fetchProductsFromApi();
  }

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return enrichProduct(json.data);
        }
      }
    } catch {
      // ignore
    }

    const all = await this.getAllProducts();
    const found = all.find((p) => p.id === id);
    if (found) return found;

    const mockFound = MOCK_PRODUCTS.find((p) => p.id === id);
    return mockFound ? enrichProduct(mockFound) : undefined;
  }

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    const all = await this.getAllProducts();
    if (category === 'all') {
      return all;
    }
    return all.filter((p) => p.category === category);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const all = await this.getAllProducts();
    return all.filter((p) => p.isFeatured);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    const all = await this.getAllProducts();
    if (!q) return all;
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }
}

export const productRepository = new ProductRepositoryImpl();
