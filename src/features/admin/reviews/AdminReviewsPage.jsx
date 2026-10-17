import { useState } from 'react';
import { Star, Trash2, MessageSquare, Search, Calendar, User, Package } from 'lucide-react';
import { useAllReviews, useDeleteReview } from '@/features/products/hooks/useProducts.js';
import { Loader } from '@/components/feedback/Loader.jsx';
import { ErrorState } from '@/components/feedback/ErrorState.jsx';
import { EmptyState } from '@/components/feedback/EmptyState.jsx';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog.jsx';
import { Card } from '@/components/ui/card.jsx';
import { AppPagination } from '@/components/common/Pagination.jsx';

const REVIEWS_PER_PAGE = 10;

export function AdminReviewsPage() {
  const { data: reviewsData, isLoading, isError, refetch } = useAllReviews();
  const deleteReviewMutation = useDeleteReview();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const reviews = reviewsData?.data || reviewsData?.reviews || [];

  const filteredReviews = reviews.filter((rev) => {
    const productName = rev.product?.name || rev.product?.title || '';
    const userName = rev.user?.name || rev.user?.email || '';
    const reviewText = rev.title || '';
    const search = searchTerm.toLowerCase();

    return (
      productName.toLowerCase().includes(search) ||
      userName.toLowerCase().includes(search) ||
      reviewText.toLowerCase().includes(search)
    );
  });

  const pageStart = (currentPage - 1) * REVIEWS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(pageStart, pageStart + REVIEWS_PER_PAGE);

  const handleConfirmDelete = () => {
    if (!reviewToDelete) return;
    deleteReviewMutation.mutate(
      { reviewId: reviewToDelete._id, isAdmin: true },
      {
        onSettled: () => setReviewToDelete(null),
      }
    );
  };

  if (isLoading) {
    return <Loader text="جاري تحميل تقييمات العملاء..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="فشل تحميل التقييمات"
        message="حدث خطأ أثناء الاتصال بالخادم لجلب التقييمات."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 dir-rtl text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span>تقييمات العملاء</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة ومراجعة تقييمات المنتجات المكتوبة من قبل العملاء ({reviews.length} تقييم)
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالمنتج أو العميل أو النص..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full ps-9 pe-4 py-2 text-xs rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          />
        </div>
      </div>

      {/* Reviews Table / List */}
      {filteredReviews.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'لا توجد نتائج مطابقة' : 'لا توجد تقييمات حتى الآن'}
          description={
            searchTerm
              ? 'لم يتم العثور على أي تقييم يطابق نص البحث.'
              : 'لم يقم أي عميل بإضافة تقييم لأي منتج بعد.'
          }
        />
      ) : (
        <Card className="overflow-hidden border border-border/60 bg-card rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-secondary/40 text-muted-foreground border-b border-border/60 font-bold">
                <tr>
                  <th className="py-3.5 px-4 text-start">المنتج</th>
                  <th className="py-3.5 px-4 text-start">المستخدم</th>
                  <th className="py-3.5 px-4 text-start">التقييم</th>
                  <th className="py-3.5 px-4 text-start">التعليق</th>
                  <th className="py-3.5 px-4 text-start">التاريخ</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedReviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-secondary/20 transition-colors">
                    {/* Product */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {rev.product?.imageCover || rev.product?.image ? (
                          <img
                            src={rev.product.imageCover || rev.product.image}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-border/60 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-bold text-foreground truncate max-w-[150px]">
                          {rev.product?.name || rev.product?.title || 'منتج غير محدد'}
                        </span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-foreground">{rev.user?.name || 'عميل'}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3 h-3 ${
                                idx < rev.ratings ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] ms-1">({rev.ratings})</span>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="truncate text-muted-foreground" title={rev.title}>
                        {rev.title || 'بدون تعليق مكتوب'}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>
                          {rev.createdAt
                            ? new Date(rev.createdAt).toLocaleDateString('ar-EG')
                            : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setReviewToDelete(rev)}
                        disabled={deleteReviewMutation.isPending}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="حذف التقييم"
                        aria-label="حذف التقييم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AppPagination
            currentPage={currentPage}
            totalItems={filteredReviews.length}
            pageSize={REVIEWS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemLabel="تقييم"
          />
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        title="هل أنت متأكد من حذف هذا التقييم؟"
        description="سيتم حذف هذا التقييم نهائياً ولن يظهر في المتجر مرة أخرى."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteReviewMutation.isPending}
        onCancel={() => setReviewToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default AdminReviewsPage;
