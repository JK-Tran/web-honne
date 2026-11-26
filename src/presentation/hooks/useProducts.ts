import { useState, useEffect, useCallback } from 'react';
import { Product, ProductCategory } from '../../core/entities/product';
import { productRepository } from '../../data/repositories/product.repository.impl';

export const useProducts = (initialCategory: ProductCategory = 'all') => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(initialCategory);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const results = await productRepository.searchProducts(searchQuery);
        setProducts(results);
      } else {
        const results = await productRepository.getProductsByCategory(selectedCategory);
        setProducts(results);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    refresh: loadProducts
  };
};

export const useFeaturedProducts = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    productRepository.getFeaturedProducts().then((res) => {
      setFeatured(res);
      setLoading(false);
    });
  }, []);

  return { featured, loading };
};
