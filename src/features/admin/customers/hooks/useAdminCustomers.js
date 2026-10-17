import { useQuery } from '@tanstack/react-query';
import { adminCustomersApi } from '../services/adminCustomersApi.js';
import { queryKeys } from '@/utils/queryKeys.js';

export function useAdminCustomers(params = {}) {
  return useQuery({
    queryKey: queryKeys.adminCustomers.list(params),
    queryFn: () => adminCustomersApi.getCustomers(params),
    staleTime: 1000 * 60 * 2,
  });
}

export default useAdminCustomers;
