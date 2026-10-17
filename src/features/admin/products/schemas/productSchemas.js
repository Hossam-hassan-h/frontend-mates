import { z } from 'zod';

export const addProductSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'اسم المنتج مطلوب' })
    .max(100, { message: 'اسم المنتج طويل جداً' }),

  category: z
    .string()
    .min(1, { message: 'التصنيف مطلوب' }),

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
    .number({ invalid_type_error: 'السعر الأساسي مطلوب ويجب أن يكون رقماً' })
    .gt(0, { message: 'السعر الأساسي يجب أن يكون أكبر من 0' }),

  discountPercentage: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(0, { message: 'نسبة الخصم لا يمكن أن تكون بالسالب' }).max(100, { message: 'نسبة الخصم لا يمكن أن تتجاوز 100%' }).optional()
  ),

  stock: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0, { message: 'الكمية لا يمكن أن تكون بالسالب' }).optional()
  ),

  lowStockAlert: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? 20 : Number(val)),
    z.number().min(0, { message: 'حد التنبيه لا يمكن أن يكون بالسالب' }).optional()
  ),

  minPurchaseQty: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? 1 : Number(val)),
    z.number().min(1, { message: 'الحد الأدنى للشراء يجب أن يكون 1 على الأقل' }).optional()
  ),

  maxPurchaseQty: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(1, { message: 'الحد الأقصى للشراء يجب أن يكون 1 على الأقل' }).optional()
  ),

  image: z
    .any()
    .refine((val) => val !== null && val !== undefined && val !== '', {
      message: 'صورة المنتج مطلوبة',
    }),
  status: z
    .string()
    .optional()
    .default('active'),
});
