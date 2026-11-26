import { ComboDeal, BlogPost } from '../entities/promo';

export interface IPromoRepository {
  getComboDeals(): Promise<ComboDeal[]>;
  getBlogPosts(): Promise<BlogPost[]>;
}
