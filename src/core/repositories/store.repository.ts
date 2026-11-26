import { StoreLocation } from '../entities/store';

export interface IStoreRepository {
  getAllStores(): Promise<StoreLocation[]>;
  getStoreById(id: string): Promise<StoreLocation | undefined>;
}
