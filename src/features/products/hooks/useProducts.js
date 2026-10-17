import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/productsApi.js';
import { toast } from 'sonner';

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: productsApi.getFeaturedProducts,
    staleTime: 1000 * 60 * 10,
  });
}

export function useBestSellers() {
  return useQuery({
    queryKey: ['bestSellers'],
    queryFn: productsApi.getBestSellers,
    staleTime: 1000 * 60 * 10,
  });
}

export function useDiscountedProducts() {
  return useQuery({
    queryKey: ['discountedProducts'],
    queryFn: productsApi.getDiscountedProducts,
    staleTime: 1000 * 60 * 10,
  });
}

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
    staleTime: 1000 * 60 * 30,
  });
}

export function useProductDetails(id) {
  return useQuery({
    queryKey: ['productDetails', id],
    queryFn: () => productsApi.getProductDetails(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductReviews(productId) {
  return useQuery({
    queryKey: ['productReviews', productId],
    queryFn: () => productsApi.getProductReviews(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.createProductReview,
    onSuccess: (data, variables) => {
      toast.success('تمت إضافة تقييمك بنجاح');
      queryClient.invalidateQueries({ queryKey: ['productReviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['productDetails', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'فشل إضافة التقييم، يرجى المحاولة مرة أخرى';
      toast.error(message);
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.deleteProductReview,
    onSuccess: (data, variables) => {
      if (variables?.isAdmin) {
        toast.success('تم حذف التقييم');
      } else {
        toast.success('تم حذف تقييمك بنجاح');
      }
      if (variables?.productId) {
        queryClient.invalidateQueries({ queryKey: ['productReviews', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['productDetails', variables.productId] });
      }
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'فشل حذف التقييم، يرجى المحاولة مرة أخرى';
      toast.error(message);
    },
  });
}

export function useAllReviews(params = {}) {
  return useQuery({
    queryKey: ['adminReviews', params],
    queryFn: () => productsApi.getAllReviews(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productsList'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.updateProduct,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productsList'] });
      queryClient.invalidateQueries({ queryKey: ['productDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productsList'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

export function useDeleteBulkProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.deleteBulkProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productsList'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

export function useUpdateBulkStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.updateBulkStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productsList'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}
