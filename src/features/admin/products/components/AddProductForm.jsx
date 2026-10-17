import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { addProductSchema } from '../schemas/productSchemas.js';
import ProductImageUpload from './ProductImageUpload.jsx';
import { FieldError } from '@/components/feedback/FieldError.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select } from '@/components/ui/select.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { useCategories, useCreateProduct, useUpdateProduct, useProductDetails } from '@/features/products/hooks/useProducts.js';
import { getText } from '@/utils/getText.js';

export function AddProductForm({ onClose, product }) {
  const {
    data: apiCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const isEditMode = Boolean(product);
  const productId = product?._id || product?.id;

  const { data: fetchedProduct } = useProductDetails(productId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: getText(product?.name || product?.title) || '',
      category: product?.category?._id || product?.category || '',
      unit: product?.unit || 'piece',
      description: getText(product?.description) || '',
      price: product?.originalPrice !== undefined ? product.originalPrice : (product?.price || ''),
      discountPercentage: product?.discountPercentage || '',
      stock: product?.quantity !== undefined ? product.quantity : (product?.stock || ''),
      lowStockAlert: product?.lowStockAlert || '20',
      minPurchaseQty: product?.minPurchaseQty || '1',
      maxPurchaseQty: product?.maxPurchaseQty || '',
      image: product?.imageCover || product?.image || null,
      status: product?.status || 'active',
    },
  });

  useEffect(() => {
    const activeProduct = fetchedProduct || product;
    if (activeProduct) {
      const catId = activeProduct.category?._id || 
                    (typeof activeProduct.category === 'string' ? activeProduct.category : '') ||
                    apiCategories.find(c => getText(c.name) === getText(activeProduct.category?.name || activeProduct.category))?._id || '';

      reset({
        name: getText(activeProduct.name || activeProduct.title) || '',
        category: catId,
        unit: activeProduct.unit || 'piece',
        description: getText(activeProduct.description) || '',
        price: activeProduct.originalPrice !== undefined ? activeProduct.originalPrice : (activeProduct.price || ''),
        discountPercentage: activeProduct.discountPercentage !== undefined ? activeProduct.discountPercentage : '',
        stock: activeProduct.quantity !== undefined ? activeProduct.quantity : (activeProduct.stock || ''),
        lowStockAlert: activeProduct.lowStockAlert !== undefined ? activeProduct.lowStockAlert : '20',
        minPurchaseQty: activeProduct.minPurchaseQty !== undefined ? activeProduct.minPurchaseQty : '1',
        maxPurchaseQty: activeProduct.maxPurchaseQty !== undefined ? activeProduct.maxPurchaseQty : '',
        image: activeProduct.imageCover || activeProduct.image || null,
        status: activeProduct.status || 'active',
      });
    }
  }, [fetchedProduct, product, apiCategories, reset]);

  const isLoading = isSubmitting || createProductMutation.isPending || updateProductMutation.isPending;

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      const original = fetchedProduct || product;

      if (isEditMode) {
        // 1. Name / Title
        const productName = data.name.trim();
        const originalName = original?.name || original?.title || '';
        if (productName !== originalName) {
          formData.append('name', productName);
          formData.append('title', productName);
        }

        // 2. Category
        const originalCatId = original?.category?._id || 
                              (typeof original?.category === 'string' ? original.category : '') ||
                              apiCategories.find(c => getText(c.name) === getText(original?.category?.name || original?.category))?._id || '';
        if (data.category !== originalCatId) {
          formData.append('category', data.category);
        }

        // 3. Unit
        if (data.unit !== original?.unit) {
          formData.append('unit', data.unit);
        }

        // 4. Description
        const originalDesc = original?.description || '';
        if (data.description !== originalDesc) {
          formData.append('description', data.description || '');
        }

        // 5. Price
        const originalPriceVal = original?.originalPrice !== undefined ? original.originalPrice : original?.price;
        if (Number(data.price) !== Number(originalPriceVal)) {
          formData.append('price', Number(data.price));
          formData.append('originalPrice', Number(data.price));
        }

        // 6. Discount Percentage
        const originalDiscount = original?.discountPercentage || 0;
        const currentDiscount = data.discountPercentage ? Number(data.discountPercentage) : 0;
        if (currentDiscount !== originalDiscount) {
          formData.append('discountPercentage', currentDiscount);
        }

        // 7. Stock / Quantity
        const originalStock = original?.quantity !== undefined ? original.quantity : original?.stock;
        const currentStock = data.stock !== undefined && data.stock !== '' ? Number(data.stock) : 0;
        if (currentStock !== originalStock) {
          formData.append('quantity', currentStock);
        }

        // 8. Low Stock Alert
        const originalLowStock = original?.lowStockAlert !== undefined ? original.lowStockAlert : 20;
        const currentLowStock = data.lowStockAlert !== undefined && data.lowStockAlert !== '' ? Number(data.lowStockAlert) : 20;
        if (currentLowStock !== originalLowStock) {
          formData.append('lowStockAlert', currentLowStock);
        }

        // 9. Min Purchase Qty
        const originalMinQty = original?.minPurchaseQty !== undefined ? original.minPurchaseQty : 1;
        const currentMinQty = data.minPurchaseQty !== undefined && data.minPurchaseQty !== '' ? Number(data.minPurchaseQty) : 1;
        if (currentMinQty !== originalMinQty) {
          formData.append('minPurchaseQty', currentMinQty);
        }

        // 10. Max Purchase Qty
        const originalMaxQty = original?.maxPurchaseQty !== undefined ? original.maxPurchaseQty : '';
        const currentMaxQty = data.maxPurchaseQty !== undefined && data.maxPurchaseQty !== '' ? Number(data.maxPurchaseQty) : '';
        if (String(currentMaxQty) !== String(originalMaxQty)) {
          formData.append('maxPurchaseQty', currentMaxQty);
        }

        // 11. Status
        if (data.status !== original?.status) {
          formData.append('status', data.status);
        }

        // 12. Gender
        if (data.gender && data.gender !== original?.gender) {
          formData.append('gender', data.gender);
        }

        // 13. Image
        if (data.image instanceof File) {
          formData.append('image', data.image);
          formData.append('imageCover', data.image);
        }

        await updateProductMutation.mutateAsync({ id: productId, data: formData });
        toast.success('Product updated successfully');
      } else {
        const productName = data.name.trim();
        formData.append('name', productName);
        formData.append('title', productName);
        formData.append('category', data.category);
        if (data.gender) {
          formData.append('gender', data.gender);
        }
        if (data.status) {
          formData.append('status', data.status);
        }
        formData.append('quantity', data.stock !== undefined && data.stock !== '' ? Number(data.stock) : 0);
        formData.append('price', Number(data.price));
        formData.append('originalPrice', Number(data.price));
        formData.append('discountPercentage', data.discountPercentage ? Number(data.discountPercentage) : 0);
        if (data.description) {
          formData.append('description', data.description);
        }
        if (data.image) {
          if (data.image instanceof File) {
            formData.append('image', data.image);
            formData.append('imageCover', data.image);
          } else if (typeof data.image === 'string') {
            let cleanUrl = data.image;
            if (cleanUrl.includes('/products/') && !cleanUrl.includes('cloudinary.com') && !cleanUrl.startsWith('http')) {
              cleanUrl = cleanUrl.split('/products/')[1];
            }
            formData.append('image', cleanUrl);
            formData.append('imageCover', cleanUrl);
          }
        }
        await createProductMutation.mutateAsync(formData);
        toast.success('Product added successfully');
      }
      reset();
      onClose?.();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save product, please try again';
      toast.error(message);
    }
  };


  const categoryOptions = apiCategories.map((cat) => ({
    id: cat._id,
    name: getText(cat.name),
    value: cat._id,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="ltr">
      {/* Product Name */}
      <div>
        <Label htmlFor="product-name">
          Product Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="product-name"
          type="text"
          placeholder="e.g. Oversized Cotton Hoodie"
          {...register('name')}
        />
        <FieldError error={errors.name} />
      </div>

      {/* Category & Gender */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="product-category">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            id="product-category"
            disabled={isCategoriesLoading || isCategoriesError || categoryOptions.length === 0}
            {...register('category')}
          >
            <option value="">
              {isCategoriesLoading ? 'Loading categories...' : 'Select Category'}
            </option>
            {categoryOptions.map((cat) => (
              <option key={cat.id || cat._id} value={cat.value || cat.id || cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>
          {isCategoriesError && (
            <button
              type="button"
              onClick={() => refetchCategories()}
              className="mt-1 text-xs font-bold text-destructive hover:underline"
            >
              Failed to load categories — Retry
            </button>
          )}
          {!isCategoriesLoading && !isCategoriesError && categoryOptions.length === 0 && (
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              No categories found. Please add a category first.
            </p>
          )}
          <FieldError error={errors.category} />
        </div>

        <div>
          <Label htmlFor="product-gender">Target Gender</Label>
          <Select id="product-gender" {...register('gender')}>
            <option value="unisex">Unisex</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </Select>
          <FieldError error={errors.gender} />
        </div>
      </div>

      {/* Description & Visibility Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="product-description">Product Description</Label>
          <Textarea
            id="product-description"
            placeholder="Short description of the product"
            rows={3}
            {...register('description')}
          />
          <FieldError error={errors.description} />
        </div>
        <div>
          <Label htmlFor="product-status">Visibility Status</Label>
          <Select id="product-status" {...register('status')}>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="archived">Archived</option>
          </Select>
          <FieldError error={errors.status} />
        </div>
      </div>

      {/* Base Price & Discount Percentage */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="product-price">
            Product Price (EGP) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="product-price"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('price')}
          />
          <FieldError error={errors.price} />
        </div>

        <div>
          <Label htmlFor="product-discount">Discount Percentage (%)</Label>
          <Input
            id="product-discount"
            type="number"
            placeholder="Leave empty or enter 0"
            {...register('discountPercentage')}
          />
          <FieldError error={errors.discountPercentage} />
        </div>
      </div>

      {/* Quantities Grid */}
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="product-stock" className="text-xs">Current Stock</Label>
          <Input
            id="product-stock"
            type="number"
            placeholder="0"
            {...register('stock')}
          />
          <FieldError error={errors.stock} />
        </div>

        <div>
          <Label htmlFor="product-low-stock" className="text-xs">Low Stock Alert</Label>
          <Input
            id="product-low-stock"
            type="number"
            placeholder="20"
            {...register('lowStockAlert')}
          />
          <FieldError error={errors.lowStockAlert} />
        </div>

        <div>
          <Label htmlFor="product-min-purchase" className="text-xs">Min Purchase Qty</Label>
          <Input
            id="product-min-purchase"
            type="number"
            placeholder="1"
            {...register('minPurchaseQty')}
          />
          <FieldError error={errors.minPurchaseQty} />
        </div>

        <div>
          <Label htmlFor="product-max-purchase" className="text-xs">Max Purchase Qty</Label>
          <Input
            id="product-max-purchase"
            type="number"
            placeholder="Unlimited"
            {...register('maxPurchaseQty')}
          />
          <FieldError error={errors.maxPurchaseQty} />
        </div>
      </div>

      {/* Image Upload Area */}
      <Controller
        name="image"
        control={control}
        render={({ field: { value, onChange } }) => (
          <ProductImageUpload
            value={value}
            onChange={onChange}
            error={errors.image}
          />
        )}
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3 border-t border-[#E2E6DC] pt-4 min-[380px]:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="h-11 rounded-xl border-[#1D6B36] text-sm font-bold text-[#1D6B36] hover:bg-[#1D6B36]/10 sm:text-base"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 rounded-xl bg-[#1D6B36] text-sm font-bold text-white hover:bg-[#175A2D] sm:text-base"
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
}

export default AddProductForm;
