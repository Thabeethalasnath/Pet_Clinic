import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/axios';
import type { ProductItemData } from '../components/products/ProductCard';

interface UsePharmacyProductsReturn {
  products: ProductItemData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePharmacyProducts = (): UsePharmacyProductsReturn => {
  const [products, setProducts] = useState<ProductItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<ProductItemData[]>('/products')
      .then((res) => {
        setProducts(res.data || []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load pharmacy products');
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};
