import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteCustomer } from '../services/adminCustomersApi.js';
import { queryKeys } from '@/utils/queryKeys.js';

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId) => deleteCustomer(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminCustomers.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers.all,
      });
      queryClient.invalidateQueries({
        queryKey: ['adminUsersList'],
      });
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        'An error occurred while deleting customer. Please try again.';
      toast.error(message);
    },
  });
}

export default useDeleteCustomer;
