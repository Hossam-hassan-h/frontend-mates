import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/categoriesApi.js';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}
