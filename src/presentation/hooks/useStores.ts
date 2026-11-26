import { useState, useEffect } from 'react';
import { StoreLocation } from '../../core/entities/store';
import { storeRepository } from '../../data/repositories/store.repository.impl';

export const useStores = () => {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);

  useEffect(() => {
    storeRepository.getAllStores().then((data) => {
      setStores(data);
      if (data.length > 0) {
        setSelectedStore(data[0]);
      }
      setLoading(false);
    });
  }, []);

  return { stores, selectedStore, setSelectedStore, loading };
};
