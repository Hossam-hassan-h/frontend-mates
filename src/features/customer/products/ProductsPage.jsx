import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts.js';
import { useCategories } from '@/features/customer/categories/hooks/useCategories.js';
import { ProductCard } from '@/components/common/ProductCard.jsx';
import { AppPagination } from '@/components/common/Pagination.jsx';
import { EmptyState } from '@/components/feedback/EmptyState.jsx';
import { ErrorState } from '@/components/feedback/ErrorState.jsx';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';
import { getText } from '@/utils/getText.js';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || '';
  const keywordParam = searchParams.get('keyword') || '';
  const genderParam = searchParams.get('gender') || '';
  const sizeParam = searchParams.get('size') || '';
  const colorParam = searchParams.get('color') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = 24;

  const [searchInput, setSearchInput] = useState(keywordParam);

  useEffect(() => {
    setSearchInput(keywordParam);
  }, [keywordParam]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== keywordParam) {
        setSearchParams((prev) => {
          if (searchInput.trim()) {
            prev.set('keyword', searchInput.trim());
          } else {
            prev.delete('keyword');
          }
          prev.set('page', '1');
          return prev;
        });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, keywordParam, setSearchParams]);

  // Fetch categories
  const { data: categories = [] } = useCategories();

  // Fetch sizes and colors for filtering
  const { data: sizes = [] } = useQuery({
    queryKey: ['filterSizes'],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.SIZES.LIST);
      return res.data?.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: colors = [] } = useQuery({
    queryKey: ['filterColors'],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.COLORS.LIST);
      return res.data?.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Query products
  const queryParams = {
    category: categoryParam || undefined,
    gender: genderParam || undefined,
    keyword: keywordParam || undefined,
    sort: sortParam || undefined,
    page: pageParam,
    limit: limitParam,
  };

  const { data, isLoading, isError, refetch } = useProducts(queryParams);

  const rawProducts = data?.products || [];

  // Strict Single-Variant Matching Rule:
  // "Filters (size, color, price) must match the same variant.
  // Example: a product with Red/M and White/L must not appear for White/M."
  const filteredProducts = useMemo(() => {
    if (!sizeParam && !colorParam && !maxPriceParam) {
      return rawProducts;
    }

    const numMaxPrice = maxPriceParam ? Number(maxPriceParam) : null;

    return rawProducts.filter((product) => {
      if (!product.variants || product.variants.length === 0) {
        return false;
      }

      // Check if at least ONE variant fulfills ALL active criteria simultaneously
      return product.variants.some((v) => {
        if (v.isActive === false) return false;

        const vSizeCode = v.size?.code || v.size;
        const vColorSlug = v.color?.slug || v.color?.name?.en || v.color;
        const vPriceEgp = v.priceEGP ? v.priceEGP / 100 : (product.price || 0);

        if (sizeParam && vSizeCode !== sizeParam) return false;
        if (colorParam && vColorSlug !== colorParam) return false;
        if (numMaxPrice !== null && vPriceEgp > numMaxPrice) return false;

        return true;
      });
    });
  }, [rawProducts, sizeParam, colorParam, maxPriceParam]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.ceil(totalCount / limitParam) || 1;

  const handleSelectCategory = (catId) => {
    setSearchParams((prev) => {
      if (catId === categoryParam) {
        prev.delete('category');
      } else if (catId) {
        prev.set('category', catId);
      } else {
        prev.delete('category');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSelectGender = (gender) => {
    setSearchParams((prev) => {
      if (gender === genderParam) {
        prev.delete('gender');
      } else if (gender) {
        prev.set('gender', gender);
      } else {
        prev.delete('gender');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSelectSize = (szCode) => {
    setSearchParams((prev) => {
      if (szCode === sizeParam) {
        prev.delete('size');
      } else if (szCode) {
        prev.set('size', szCode);
      } else {
        prev.delete('size');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSelectColor = (colSlug) => {
    setSearchParams((prev) => {
      if (colSlug === colorParam) {
        prev.delete('color');
      } else if (colSlug) {
        prev.set('color', colSlug);
      } else {
        prev.delete('color');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const activeCategoryObj = categories.find((c) => (c._id || c.id) === categoryParam);
  const pageTitle = activeCategoryObj
    ? `قسم ${getText(activeCategoryObj.name)}`
    : genderParam === 'men'
    ? 'أزياء رجالية'
    : genderParam === 'women'
    ? 'أزياء نسائية'
    : 'تشكيلة ملابس Mates Store';

  return (
    <div className="space-y-6 py-4 animate-fade-in dir-rtl text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{pageTitle}</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            تصفح أحدث الأزياء والقطع العصرية من Mates Store للأفراد والأزواج
          </p>
        </div>

        {(categoryParam || keywordParam || genderParam || sizeParam || colorParam || maxPriceParam || sortParam) && (
          <button
            onClick={handleClearFilters}
            className="self-start sm:self-auto text-xs font-bold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20 transition-colors"
          >
            مسح جميع الفلاتر
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن هودي، تيشيرت، طقم كابلز..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 rounded-2xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            />
          </div>

          {/* Gender Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: '', label: 'الكل' },
              { id: 'men', label: 'رجالي' },
              { id: 'women', label: 'نسائي' },
              { id: 'unisex', label: 'للجنسين' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => handleSelectGender(g.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  genderParam === g.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-secondary/40 text-foreground hover:bg-secondary'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size & Color Filter Row */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/40 text-xs">
          {/* Size Filter */}
          {sizes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-muted-foreground">المقاس:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {sizes.map((sz) => (
                  <button
                    key={sz.code}
                    onClick={() => handleSelectSize(sz.code)}
                    className={`h-7 px-2.5 rounded-lg border text-[11px] font-black transition-all ${
                      sizeParam === sz.code
                        ? 'border-primary bg-primary text-white'
                        : 'border-border/80 bg-background hover:bg-secondary/60'
                    }`}
                  >
                    {sz.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Filter */}
          {colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-muted-foreground">اللون:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {colors.map((c) => {
                  const isSelected = colorParam === c.slug;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => handleSelectColor(c.slug)}
                      title={getText(c.name)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'ring-2 ring-primary ring-offset-2 scale-110 border-black/20'
                          : 'border-black/10 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 ${c.slug === 'white' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-border/40 pt-2">
            <button
              onClick={() => handleSelectCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                !categoryParam
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary/30 hover:bg-secondary text-foreground'
              }`}
            >
              جميع الأقسام
            </button>
            {categories.map((cat) => {
              const catId = cat._id || cat.id;
              const isSelected = categoryParam === catId;
              const catName = getText(cat.name);
              return (
                <button
                  key={catId}
                  onClick={() => handleSelectCategory(catId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-secondary/30 hover:bg-secondary text-foreground'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-3/4 rounded-2xl bg-secondary/30" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="لا توجد قطع تطابق اختياراتك"
          description="جرب إزالة أو تغيير فلاتر المقاس أو اللون أو البحث للعثور على ملابس أخرى"
          actionLabel="عرض جميع الملابس"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <AppPagination
          currentPage={pageParam}
          totalPages={totalPages}
          onPageChange={(p) => {
            setSearchParams((prev) => {
              prev.set('page', String(p));
              return prev;
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}

export default ProductsPage;
