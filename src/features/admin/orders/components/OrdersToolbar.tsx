import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrdersSearchBar } from './OrdersSearchBar';
import { OrdersDateFilter } from './OrdersDateFilter';
import { OrderStatusSummary } from './OrderStatusSummary';
import type { OrderStatusFilter, OrderSort } from '../hooks/useOrderFilters';

interface OrdersToolbarProps {
  searchInput: string;
  onSearchChange: (val: string) => void;
  status: OrderStatusFilter;
  onStatusChange: (status: OrderStatusFilter) => void;
  dateFrom: string | null;
  dateTo: string | null;
  onDateRangeChange: (from: string | null, to: string | null) => void;
  sort: OrderSort;
  onSortChange: (sort: OrderSort) => void;
  statusCounts?: Record<string, number>;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

/**
 * Orders toolbar component with visual design matching AdminUsersPage:
 * - Card container with border-[#E2E6DC]
 * - Row 1: Full-width search bar
 * - Row 2: Separator, filters row (Sort, Date Range), Reset button
 * - Row 3: Status filter summary chips
 */
export const OrdersToolbar: React.FC<OrdersToolbarProps> = ({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateRangeChange,
  sort,
  onSortChange,
  statusCounts,
  hasActiveFilters,
  onResetFilters,
}) => {
  const activeFiltersCount =
    (status !== 'all' ? 1 : 0) +
    (Boolean(dateFrom) ? 1 : 0) +
    (Boolean(dateTo) ? 1 : 0) +
    (sort !== '-createdAt' ? 1 : 0) +
    (searchInput.trim() ? 1 : 0);

  return (
    <div className="space-y-4" dir="ltr">
      {/* Search & Filter Toolbar Card (matches AdminUsersPage) */}
      <Card className="p-4 rounded-2xl border-border/80 bg-card shadow-xs space-y-3.5">
        {/* Row 1: Full-width Search Input */}
        <OrdersSearchBar value={searchInput} onChange={onSearchChange} />

        {/* Row 2: Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="orders-sort" className="text-xs font-bold text-muted-foreground">
                Sort by:
              </label>
              <select
                id="orders-sort"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as OrderSort)}
                aria-label="Sort orders"
                className="h-9 rounded-xl border border-input bg-background text-foreground px-3 text-xs font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="-createdAt">Newest first</option>
                <option value="createdAt">Oldest first</option>
                <option value="-finalTotal">Highest amount</option>
                <option value="finalTotal">Lowest amount</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <OrdersDateFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onChange={onDateRangeChange}
            />
          </div>

          {/* Reset Filters & Active Badge */}
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-[#1D6B36]/10 text-[#1D6B36] font-bold text-xs">
                {activeFiltersCount} active filter(s)
              </Badge>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="h-9 gap-1.5 rounded-xl border-dashed border-[#E2E6DC] text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Row 3: Status Summary Filter Chips */}
      <OrderStatusSummary
        currentStatus={status}
        onSelectStatus={onStatusChange}
        statusCounts={statusCounts}
      />
    </div>
  );
};

export default OrdersToolbar;
