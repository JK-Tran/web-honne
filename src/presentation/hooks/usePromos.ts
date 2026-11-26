import { useState, useEffect } from 'react';
import { ComboDeal, BlogPost } from '../../core/entities/promo';
import { promoRepository } from '../../data/repositories/promo.repository.impl';

export const usePromos = () => {
  const [combos, setCombos] = useState<ComboDeal[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([promoRepository.getComboDeals(), promoRepository.getBlogPosts()])
      .then(([comboRes, blogRes]) => {
        setCombos(comboRes);
        setBlogs(blogRes);
      })
      .finally(() => setLoading(false));
  }, []);

  return { combos, blogs, loading };
};
