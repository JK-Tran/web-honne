import { ComboDeal, BlogPost } from '../../core/entities/promo';
import { IPromoRepository } from '../../core/repositories/promo.repository';
import { MOCK_COMBOS, MOCK_BLOGS } from '../mock/promos.mock';

export class PromoRepositoryImpl implements IPromoRepository {
  async getComboDeals(): Promise<ComboDeal[]> {
    return Promise.resolve([...MOCK_COMBOS]);
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return Promise.resolve([...MOCK_BLOGS]);
  }
}

export const promoRepository = new PromoRepositoryImpl();
