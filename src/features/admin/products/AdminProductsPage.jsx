import { useState, useMemo, useEffect } from 'react';
import { Archive, Edit2, EyeOff, Plus, Search, Trash2, Eye, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import { AppPagination } from '@/components/common/Pagination.jsx';
import { EmptyState } from '@/components/feedback/EmptyState.jsx';
import { ErrorState } from '@/components/feedback/ErrorState.jsx';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog.jsx';
import AddProductModal from './components/AddProductModal.jsx';
import {
  useProducts,
  useCategories,
  useUpdateProduct,
  useDeleteProduct,
  useDeleteBulkProducts,
  useUpdateBulkStatus,
} from '@/features/products/hooks/useProducts.js';
import { toast } from 'sonner';
import { getText } from '@/utils/getText.js';

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'available', label: 'متوفر' },
  { id: 'low-stock', label: 'مخزون منخفض' },
  { id: 'out-of-stock', label: 'نفد' },
  { id: 'hidden', label: 'مخفي' },
  { id: 'archived', label: 'مؤرشف' },
  { id: 'discounted', label: 'مخفض' },
  { id: 'featured', label: 'مميز' },
];

const ITEMS_PER_PAGE = 10;

export function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useProducts();
  const apiProducts = useMemo(() => productsResponse?.products || [], [productsResponse]);
  const {
    data: apiCategories = [],
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const deleteBulkProductsMutation = useDeleteBulkProducts();
  const updateBulkStatusMutation = useUpdateBulkStatus();

  // Dialog state
  const [productToDelete, setProductToDelete] = useState(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkArchiveOpen, setIsBulkArchiveOpen] = useState(false);

  const handleToggleVisibility = async (product) => {
    const prodId = product._id || product.id;
    const newStatus = product.status === 'hidden' ? 'active' : 'hidden';
    try {
      await updateProductMutation.mutateAsync({ id: prodId, data: { status: newStatus } });
      toast.success(newStatus === 'hidden' ? 'تم إخفاء المنتج بنجاح' : 'تم إظهار المنتج بنجاح');
    } catch (err) {
      toast.error('فشل تغيير حالة المنتج');
    }
  };

  const handleToggleArchive = async (product) => {
    const prodId = product._id || product.id;
    const newStatus = product.status === 'archived' ? 'active' : 'archived';
    try {
      await updateProductMutation.mutateAsync({ id: prodId, data: { status: newStatus } });
      toast.success(newStatus === 'archived' ? 'تم أرشفة المنتج بنجاح' : 'تم تنشيط المنتج بنجاح');
    } catch (err) {
      toast.error('فشل تغيير حالة أرشفة المنتج');
    }
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
  };

  const handleConfirmSingleDelete = async () => {
    if (!productToDelete) return;
    const prodId = productToDelete._id || productToDelete.id;
    try {
      await deleteProductMutation.mutateAsync(prodId);
      toast.success('تم حذف المنتج بنجاح');
      setProductToDelete(null);
      setSelectedRows((current) => {
        const next = new Set(current);
        next.delete(prodId);
        return next;
      });
    } catch (err) {
      toast.error('فشل حذف المنتج');
    }
  };

  const handleConfirmBulkDelete = async () => {
    const ids = Array.from(selectedRows);
    if (ids.length === 0) return;
    try {
      await deleteBulkProductsMutation.mutateAsync(ids);
      toast.success(`تم حذف ${ids.length} منتج بنجاح`);
      setSelectedRows(new Set());
      setIsBulkDeleteOpen(false);
    } catch (err) {
      toast.error('فشل حذف المنتجات المحددة');
    }
  };

  const handleConfirmBulkArchive = async () => {
    const ids = Array.from(selectedRows);
    if (ids.length === 0) return;
    try {
      await updateBulkStatusMutation.mutateAsync({ ids, status: 'archived' });
      toast.success(`تمت أرشفة ${ids.length} منتج بنجاح`);
      setSelectedRows(new Set());
      setIsBulkArchiveOpen(false);
    } catch (err) {
      toast.error('فشل أرشفة المنتجات المحددة');
    }
  };

  const getProductCategoryName = (prodCat) => {
    if (!prodCat) return '';
    if (typeof prodCat === 'object') return getText(prodCat.name) || '';
    return String(prodCat);
  };

  const getProductCategoryId = (prodCat) => {
    if (!prodCat) return '';
    if (typeof prodCat === 'object') return prodCat._id || prodCat.id || '';
    return String(prodCat);
  };

  const filteredProducts = useMemo(() => {
    return apiProducts.filter((product) => {
      const prodCatName = getProductCategoryName(product.category);
      const prodCatId = getProductCategoryId(product.category);

      // Category filter
      const matchesCategory =
        !category ||
        category === 'all' ||
        (category === 'عروض اليوم' || category === 'offers'
          ? Boolean(product.offer || (product.discountPercentage && product.discountPercentage > 0))
          : prodCatId === category || prodCatName === category);

      // Search filter
      const prodName = getText(product.name || product.title);
      const matchesSearch =
        !search.trim() ||
        prodName.toLowerCase().includes(search.trim().toLowerCase()) ||
        prodCatName.toLowerCase().includes(search.trim().toLowerCase());

      // Status filter
      const stock = product.quantity !== undefined ? product.quantity : (product.stock || 0);
      let matchesFilter = true;
      if (activeFilter === 'available') {
        matchesFilter = stock > 0;
      } else if (activeFilter === 'low-stock') {
        matchesFilter = stock > 0 && stock <= 20;
      } else if (activeFilter === 'out-of-stock') {
        matchesFilter = stock === 0;
      } else if (activeFilter === 'hidden') {
        matchesFilter = product.status === 'hidden';
      } else if (activeFilter === 'archived') {
        matchesFilter = product.status === 'archived';
      } else if (activeFilter === 'discounted') {
        matchesFilter = Boolean(product.originalPrice) || Boolean(product.offer) || Boolean(product.discountPercentage > 0);
      } else if (activeFilter === 'featured') {
        matchesFilter = Boolean(product.featured);
      }

      return matchesCategory && matchesSearch && matchesFilter;
    });
  }, [apiProducts, category, search, activeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const pageStart = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(pageStart, pageStart + ITEMS_PER_PAGE);
  const allSelected = paginatedProducts.length > 0 && paginatedProducts.every((product) => selectedRows.has(product._id || product.id));

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const toggleRow = (id) => {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedRows((current) => {
      const next = new Set(current);
      paginatedProducts.forEach((product) => {
        const id = product._id || product.id;
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 font-['Cairo']" dir="rtl">
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center">
        <div className="relative min-w-0 sm:col-span-2 lg:flex-1">
          <Search
            aria-hidden="true"
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7464]"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث عن منتج..."
            aria-label="البحث عن منتج"
            className="h-[42px] w-full rounded-xl border border-[#E2E6DC] bg-white py-2.5 pl-4 pr-9 text-sm text-[#1A1F16] placeholder:text-[rgba(26,31,22,0.5)] focus:outline-none focus:ring-2 focus:ring-[#1D6B36]/40"
          />
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="تصفية حسب التصنيف"
          className="h-[42px] w-full min-w-0 rounded-xl border border-[#E2E6DC] bg-white px-3 text-sm text-[#1A1F16] focus:outline-none focus:ring-2 focus:ring-[#1D6B36]/40 sm:w-auto lg:max-w-64"
        >
          <option value="">جميع التصنيفات</option>
          {apiCategories.map((item) => (
            <option key={item._id} value={item._id}>
              {getText(item.name)}
            </option>
          ))}
        </select>
        {isCategoriesError && (
          <button
            type="button"
            onClick={() => refetchCategories()}
            className="h-[42px] rounded-xl border border-destructive/30 px-3 text-xs font-bold text-destructive"
          >
            إعادة تحميل التصنيفات
          </button>
        )}

        <Button
          type="button"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="h-[42px] w-full gap-2 rounded-xl border border-[#1D6B36] bg-[#1D6B36] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#175A2D] sm:w-auto"
        >
          <Plus aria-hidden="true" className="h-4 w-4 text-white" />
          إضافة منتج
        </Button>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedRows.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1D6B36]/30 bg-[#F4F7F2] p-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1D6B36] text-white text-xs font-black shadow-xs">
              {selectedRows.size}
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#1A1F16]">
              تم تحديد {selectedRows.size} {selectedRows.size === 1 ? 'منتج' : 'منتجات'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Archive Bulk Button */}
            <button
              type="button"
              onClick={() => setIsBulkArchiveOpen(true)}
              disabled={updateBulkStatusMutation.isPending || deleteBulkProductsMutation.isPending}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <Archive className="h-4 w-4 text-indigo-600" />
              <span>أرشفة المحددة</span>
            </button>

            {/* Delete Bulk Button */}
            <button
              type="button"
              onClick={() => setIsBulkDeleteOpen(true)}
              disabled={deleteBulkProductsMutation.isPending || updateBulkStatusMutation.isPending}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
              <span>حذف المحددة</span>
            </button>

            {/* Clear Selection Button */}
            <button
              type="button"
              onClick={() => setSelectedRows(new Set())}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-xl px-2.5 text-xs font-semibold text-[#6B7464] hover:bg-[#E2E6DC]/40 transition-all cursor-pointer"
              title="إلغاء التحديد"
            >
              <X className="h-4 w-4" />
              <span>إلغاء التحديد</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                isActive
                  ? 'border-[#1D6B36] bg-[#1D6B36] text-white'
                  : 'border-[#E2E6DC] bg-white text-[#1A1F16] hover:border-[#1D6B36]'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <Card className="w-full max-w-full overflow-hidden rounded-2xl border-[#E2E6DC] bg-white shadow-sm">
        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[720px] table-auto text-sm text-[#1A1F16]" dir="rtl">
            <thead className="border-b border-[#E2E6DC] bg-[#F7F8F5]">
              <tr className="h-11">
                <th className="w-8 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="تحديد جميع المنتجات"
                    className="h-[13px] w-[13px] rounded-sm border-[#767676] accent-[#1D6B36]"
                  />
                </th>
                <th className="px-3 py-3 text-right font-bold text-[#6B7464]">المنتج</th>
                <th className="px-3 py-3 text-right font-bold text-[#6B7464]">السعر</th>
                <th className="px-3 py-3 text-right font-bold text-[#6B7464]">المخزون</th>
                <th className="px-3 py-3 text-right font-bold text-[#6B7464]">الحالة</th>
                <th className="px-3 py-3 text-right font-bold text-[#6B7464]">إجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F0F2ED]">
              {isProductsLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-[#6B7464]">
                    جاري تحميل المنتجات...
                  </td>
                </tr>
              ) : isProductsError ? (
                <tr>
                  <td colSpan={6} className="p-4">
                    <ErrorState
                      title="تعذر تحميل المنتجات"
                      message="حدث خطأ أثناء جلب المنتجات من الخادم."
                      onRetry={refetchProducts}
                    />
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const prodId = product._id || product.id;
                  const prodName = getText(product.name || product.title);
                  const prodCatName = getProductCategoryName(product.category);
                  const prodPrice = product.price !== undefined ? product.price : (product.originalPrice || 0);
                  const prodStock = product.quantity !== undefined ? product.quantity : (product.stock || 0);
                  const prodUnit = product.unit || 'كغ';
                  const prodImage = product.imageCover || product.image;
                  const hasDiscount = Boolean(product.originalPrice && prodPrice && Number(product.originalPrice) > Number(prodPrice));

                  return (
                    <tr key={prodId} className="h-[65px] hover:bg-[#F7F8F5]">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(prodId)}
                          onChange={() => toggleRow(prodId)}
                          aria-label={`تحديد ${prodName}`}
                          className="h-[13px] w-[13px] rounded-sm border-[#767676] accent-[#1D6B36]"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {prodImage ? (
                            <img
                              src={prodImage}
                              alt={prodName}
                              className="h-10 w-10 shrink-0 rounded-lg bg-[#E2E6DC] object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E2E6DC] text-[#6B7464]">
                              <Package className="h-5 w-5" aria-hidden="true" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold leading-5 text-[#1A1F16]">{prodName}</p>
                            <p className="whitespace-nowrap text-xs leading-4 text-[#6B7464]">
                              {prodCatName} · {prodUnit}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="whitespace-nowrap font-bold leading-5 text-[#1D6B36]">
                          {Number(prodPrice).toFixed(2)} EGP
                        </p>
                        {hasDiscount && (
                          <p className="whitespace-nowrap text-xs leading-4 text-[#CCCCCC] line-through">
                            {Number(product.originalPrice).toFixed(2)} EGP
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-bold ${
                            prodStock === 0
                              ? 'bg-[#FEE2E2] text-[#B91C1C]'
                              : prodStock < 20
                                ? 'bg-[#FEF3C7] text-[#B45309]'
                                : 'bg-[#DCFCE7] text-[#008236]'
                          }`}
                        >
                          {prodStock} {prodUnit}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.featured && (
                            <span className="whitespace-nowrap rounded-full bg-[#FEF9C2] px-1.5 py-0.5 text-[10px] font-bold text-[#A65F00]">
                              مميز
                            </span>
                          )}
                          {(product.offer || product.discountPercentage > 0) && (
                            <span className="whitespace-nowrap rounded-full bg-[#FFEDD5] px-1.5 py-0.5 text-[10px] font-bold text-[#C2410C]">
                              عرض
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(product)}
                            aria-label={`تعديل ${prodName}`}
                            title="تعديل"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7464] hover:bg-[#F0F2ED] hover:text-[#1D6B36]"
                          >
                            <Edit2 aria-hidden="true" className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(product)}
                            aria-label={product.status === 'hidden' ? `إظهار ${prodName}` : `إخفاء ${prodName}`}
                            title={product.status === 'hidden' ? 'إظهار' : 'إخفاء'}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7464] hover:bg-[#F0F2ED]"
                          >
                            {product.status === 'hidden' ? (
                              <Eye aria-hidden="true" className="h-4 w-4 text-amber-600" />
                            ) : (
                              <EyeOff aria-hidden="true" className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(product)}
                            aria-label={product.status === 'archived' ? `تنشيط ${prodName}` : `أرشفة ${prodName}`}
                            title={product.status === 'archived' ? 'تنشيط' : 'أرشفة'}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7464] hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Archive aria-hidden="true" className={`h-4 w-4 ${product.status === 'archived' ? 'text-amber-600' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            aria-label={`حذف ${prodName}`}
                            title="حذف"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <EmptyState
                      title="لا توجد منتجات"
                      description="لم نجد أي منتجات تطابق التصنيف أو البحث المحدد."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AppPagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={goToPage}
          itemLabel="منتج"
        />
      </Card>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <AddProductModal
        isOpen={Boolean(editingProduct)}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
      />

      {/* Single Product Delete Modal */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        variant="danger"
        title="تأكيد حذف المنتج"
        description={`هل أنت متأكد من حذف المنتج "${getText(productToDelete?.name || productToDelete?.title)}" نهائياً من المتجر؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف نهائياً"
        cancelText="إلغاء"
        isLoading={deleteProductMutation.isPending}
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => {
          if (!deleteProductMutation.isPending) setProductToDelete(null);
        }}
      />

      {/* Bulk Delete Modal */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        variant="danger"
        title="تأكيد حذف المنتجات المحددة"
        description={`هل أنت متأكد من حذف ${selectedRows.size} منتج نهائياً من المتجر؟ سيتم حذف بياناتها وصورها نهائياً.`}
        confirmText={`حذف (${selectedRows.size}) نهائياً`}
        cancelText="إلغاء"
        isLoading={deleteBulkProductsMutation.isPending}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => {
          if (!deleteBulkProductsMutation.isPending) setIsBulkDeleteOpen(false);
        }}
      />

      {/* Bulk Archive Modal */}
      <ConfirmDialog
        isOpen={isBulkArchiveOpen}
        variant="archive"
        title="تأكيد أرشفة المنتجات المحددة"
        description={`هل أنت متأكد من نقل ${selectedRows.size} منتج إلى الأرشيف؟ ستبقى بيانات المنتجات محفوظة ولكن لن تظهر في واجهة المتجر للعملاء.`}
        confirmText={`أرشفة (${selectedRows.size}) منتج`}
        cancelText="إلغاء"
        isLoading={updateBulkStatusMutation.isPending}
        onConfirm={handleConfirmBulkArchive}
        onCancel={() => {
          if (!updateBulkStatusMutation.isPending) setIsBulkArchiveOpen(false);
        }}
      />
    </div>
  );
}

export default AdminProductsPage;

