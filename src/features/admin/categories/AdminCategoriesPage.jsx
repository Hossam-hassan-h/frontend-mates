import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/api/apiClient.js";
import { API_ENDPOINTS } from "@/api/apiEndpoints.js";
import { Card } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { AppPagination } from "@/components/common/Pagination.jsx";
import { EmptyState } from "@/components/feedback/EmptyState.jsx";
import { ErrorState } from "@/components/feedback/ErrorState.jsx";
import { Skeleton } from "@/components/feedback/Skeleton.jsx";
import { CategoryModal } from "./components/CategoryModal.jsx";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog.jsx";
import { getText } from "@/utils/getText.js";

const CATEGORIES_PER_PAGE = 10;

const mapCategoryPayload = ({ name, image }) => {
  const formData = new FormData();
  formData.append("name", name);
  if (image instanceof File) formData.append("image", image);
  return formData;
};

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
      return response.data?.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (values) => {
      const response = await apiClient.post(
        API_ENDPOINTS.CATEGORIES.LIST,
        mapCategoryPayload(values),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      toast.success("تمت إضافة التصنيف بنجاح");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "فشل إنشاء التصنيف");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, values }) => {
      const response = await apiClient.put(
        API_ENDPOINTS.CATEGORIES.DETAILS(id),
        mapCategoryPayload(values),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      setIsModalOpen(false);
      toast.success("تم تحديث التصنيف بنجاح");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "فشل تحديث التصنيف");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => apiClient.delete(API_ENDPOINTS.CATEGORIES.DETAILS(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryToDelete(null);
      toast.success("تم حذف التصنيف بنجاح");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "فشل حذف التصنيف");
    },
  });

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) => getText(category.name).toLowerCase().includes(query));
  }, [categories, searchQuery]);

  const pageStart = (currentPage - 1) * CATEGORIES_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(pageStart, pageStart + CATEGORIES_PER_PAGE);

  const handleSaveCategory = (values) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory._id, values });
      return;
    }
    createCategoryMutation.mutate(values);
  };

  const isSaving = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 font-['Cairo']" dir="rtl">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 w-full max-w-md flex-1">
          <label htmlFor="category-search" className="sr-only">
            بحث في التصنيفات
          </label>
          <Search
            aria-hidden="true"
            className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7464]"
          />
          <input
            id="category-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="بحث في التصنيفات..."
            className="h-[42px] w-full rounded-full border border-[#E2E6DC] bg-white py-2 pl-4 pr-10 text-sm text-[#1A1F16] placeholder:text-[#6B7464]/60 focus:border-[#1D6B36] focus:outline-none focus:ring-2 focus:ring-[#1D6B36]/30"
          />
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="h-[40px] w-full gap-1.5 rounded-full bg-[#1D6B36] px-4 text-xs font-bold text-white hover:bg-[#175A2D] sm:w-auto"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          إضافة تصنيف
        </Button>
      </div>

      {isError ? (
        <ErrorState
          title="تعذر تحميل التصنيفات"
          message="حدث خطأ أثناء جلب التصنيفات من قاعدة البيانات."
          onRetry={refetch}
        />
      ) : (
        <Card className="w-full max-w-full overflow-hidden rounded-2xl border-[#E2E6DC] bg-white shadow-sm">
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[620px] table-auto text-sm text-[#1A1F16]" dir="rtl">
              <thead className="border-b border-[#E2E6DC] bg-white">
                <tr className="h-12">
                  <th className="px-5 py-3 text-right font-bold text-[#6B7464]">التصنيف</th>
                  <th className="px-5 py-3 text-right font-bold text-[#6B7464]">تاريخ الإضافة</th>
                  <th className="px-5 py-3 text-left font-bold text-[#6B7464]">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6DC]/60">
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="h-[64px]">
                      <td colSpan={3} className="px-5 py-3.5">
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : filteredCategories.length > 0 ? (
                  paginatedCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="h-[64px] transition-colors hover:bg-[#F9FAF7]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 font-bold text-[#1A1F16]">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt=""
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2E6DC] text-[#6B7464]">
                              <Package className="h-5 w-5" aria-hidden="true" />
                            </div>
                          )}
                          <span>{getText(category.name)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-[#6B7464]">
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString("ar-EG")
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5 text-[#6B7464]">
                          <button
                            type="button"
                            aria-label={`تعديل تصنيف ${getText(category.name)}`}
                            onClick={() => {
                              setEditingCategory(category);
                              setIsModalOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 hover:text-[#1A1F16]"
                          >
                            <Pencil aria-hidden="true" className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`حذف تصنيف ${getText(category.name)}`}
                            onClick={() => setCategoryToDelete(category)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4">
                      <EmptyState
                        title={
                          categories.length === 0
                            ? "لا توجد تصنيفات حالياً"
                            : "لا توجد نتائج مطابقة"
                        }
                        description={
                          categories.length === 0
                            ? "أضف أول تصنيف ليظهر في المتجر."
                            : "جرّب تغيير عبارة البحث."
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <AppPagination
            currentPage={currentPage}
            totalItems={filteredCategories.length}
            pageSize={CATEGORIES_PER_PAGE}
            onPageChange={setCurrentPage}
            itemLabel="تصنيف"
          />
        </Card>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          if (isSaving) return;
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSave={handleSaveCategory}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        variant="danger"
        title="تأكيد حذف التصنيف"
        description={`سيتم حذف تصنيف «${getText(categoryToDelete?.name)}» نهائياً من قاعدة البيانات. لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف نهائياً"
        cancelText="إلغاء"
        isLoading={deleteCategoryMutation.isPending}
        onConfirm={() => deleteCategoryMutation.mutate(categoryToDelete._id)}
        onCancel={() => {
          if (!deleteCategoryMutation.isPending) setCategoryToDelete(null);
        }}
      />
    </div>
  );
}

export default AdminCategoriesPage;
