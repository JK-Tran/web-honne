import { StoreLocation } from '../../core/entities/store';
import { IStoreRepository } from '../../core/repositories/store.repository';
import { MOCK_STORES } from '../mock/stores.mock';

export class StoreRepositoryImpl implements IStoreRepository {
  async getAllStores(): Promise<StoreLocation[]> {
    return Promise.resolve([...MOCK_STORES]);
  }

  async getStoreById(id: string): Promise<StoreLocation | undefined> {
    return Promise.resolve(MOCK_STORES.find((s) => s.id === id));
  }
}

export const storeRepository = new StoreRepositoryImpl();
