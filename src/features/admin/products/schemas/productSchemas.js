import { z } from 'zod';

export const addProductSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Product name is required' })
    .max(100, { message: 'Product name is too long' }),

  category: z
    .string()
    .min(1, { message: 'Category is required' }),

  gender: z
    .enum(['men', 'women', 'unisex'])
    .optional()
    .default('unisex'),

  unit: z
    .string()
    .optional()
    .default('piece'),

  description: z
    .string()
    .optional(),

  price: z.coerce
    .number({ invalid_type_error: 'Base price is required and must be a number' })
    .gt(0, { message: 'Base price must be greater than 0' }),

  discountPercentage: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(0, { message: 'Discount percentage cannot be negative' }).max(100, { message: 'Discount percentage cannot exceed 100%' }).optional()
  ),

  stock: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0, { message: 'Stock quantity cannot be negative' }).optional()
  ),

  lowStockAlert: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? 20 : Number(val)),
    z.number().min(0, { message: 'Alert threshold cannot be negative' }).optional()
  ),

  minPurchaseQty: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? 1 : Number(val)),
    z.number().min(1, { message: 'Minimum purchase quantity must be at least 1' }).optional()
  ),

  maxPurchaseQty: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(1, { message: 'Maximum purchase quantity must be at least 1' }).optional()
  ),

  image: z
    .any()
    .refine((val) => val !== null && val !== undefined && val !== '', {
      message: 'Product image is required',
    }),
  status: z
    .string()
    .optional()
    .default('active'),
});
