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
      toast.success('تم حذف العميل بنجاح');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        'حدث خطأ أثناء حذف العميل. يرجى المحاولة مرة أخرى.';
      toast.error(message);
    },
  });
}

export default useDeleteCustomer;
