import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type OrderStatusFilter =
  | 'all'
  | 'pending'
  | 'preparing'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type OrderSort = '-createdAt' | 'createdAt' | '-finalTotal' | 'finalTotal';

export interface OrderFilters {
  search: string;
  status: OrderStatusFilter;
  dateFrom: string | null; // serialized as 'from' in URL
  dateTo: string | null;   // serialized as 'to' in URL
  sort: OrderSort;         // serialized as 'sort' in URL
  page: number;            // serialized as 'page' in URL
}

export interface UseOrderFiltersReturn {
  filters: OrderFilters;
  searchInput: string;
  setSearchInput: (value: string) => void;
  setStatus: (status: OrderStatusFilter) => void;
  setDateRange: (from: string | null, to: string | null) => void;
  setSort: (sort: OrderSort) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const VALID_STATUSES: readonly OrderStatusFilter[] = [
  'all',
  'pending',
  'preparing',
  'out_for_delivery',
  'completed',
  'cancelled',
];

const VALID_SORTS: readonly OrderSort[] = [
  '-createdAt',
  'createdAt',
  '-finalTotal',
  'finalTotal',
];

/**
 * Single source of truth for all filter state on the orders page.
 * Uses the exact debounced search and URL synchronization pattern from Products.
 */
export function useOrderFilters(): UseOrderFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get('search') || '';

  // Local state for debounced search input
  const [searchInput, setSearchInput] = useState<string>(urlSearch);

  // Sync searchInput when urlSearch changes from URL (matching Products implementation)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Debounced search input handler (400ms) - matching Products implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== urlSearch) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = searchInput.trim();
          if (trimmed) {
            next.set('search', trimmed);
          } else {
            next.delete('search');
          }
          next.set('page', '1');
          return next;
        });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, urlSearch, setSearchParams]);

  // Parse filters directly from URL search parameters
  const filters: OrderFilters = useMemo(() => {
    const search = searchParams.get('search') || '';

    const rawStatus = searchParams.get('status') as OrderStatusFilter | null;
    const status: OrderStatusFilter =
      rawStatus && VALID_STATUSES.includes(rawStatus) ? rawStatus : 'all';

    const dateFrom = searchParams.get('from') || null;
    const dateTo = searchParams.get('to') || null;

    const rawSort = searchParams.get('sort') as OrderSort | null;
    const sort: OrderSort =
      rawSort && VALID_SORTS.includes(rawSort) ? rawSort : '-createdAt';

    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

    return {
      search,
      status,
      dateFrom,
      dateTo,
      sort,
      page,
    };
  }, [searchParams]);

  // Status filter setter
  const setStatus = useCallback(
    (newStatus: OrderStatusFilter) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!newStatus || newStatus === 'all') {
          next.delete('status');
        } else {
          next.set('status', newStatus);
        }
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  // Date range filter setter
  const setDateRange = useCallback(
    (from: string | null, to: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (from) {
          next.set('from', from);
        } else {
          next.delete('from');
        }
        if (to) {
          next.set('to', to);
        } else {
          next.delete('to');
        }
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  // Sort setter
  const setSort = useCallback(
    (newSort: OrderSort) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newSort === '-createdAt') {
          next.delete('sort');
        } else {
          next.set('sort', newSort);
        }
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  // Page setter
  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(Math.max(1, newPage)));
        return next;
      });
    },
    [setSearchParams]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchInput('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      next.delete('status');
      next.delete('from');
      next.delete('to');
      next.delete('sort');
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(filters.search) ||
      filters.status !== 'all' ||
      Boolean(filters.dateFrom) ||
      Boolean(filters.dateTo) ||
      filters.sort !== '-createdAt'
    );
  }, [filters]);

  return {
    filters,
    searchInput,
    setSearchInput,
    setStatus,
    setDateRange,
    setSort,
    setPage,
    resetFilters,
    hasActiveFilters,
  };
}

export default useOrderFilters;
