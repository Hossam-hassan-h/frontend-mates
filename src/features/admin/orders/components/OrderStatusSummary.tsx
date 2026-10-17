import React from 'react';
import type { OrderStatusFilter } from '../hooks/useOrderFilters';

interface OrderStatusSummaryProps {
  currentStatus: OrderStatusFilter;
  onSelectStatus: (status: OrderStatusFilter) => void;
  statusCounts?: Record<string, number>;
}

interface StatusCardConfig {
  key: OrderStatusFilter;
  label: string;
  colorClasses: {
    idle: string;
    active: string;
    badgeIdle: string;
    badgeActive: string;
  };
}

// Exactly matches the backend Order model status values:
// ['pending', 'preparing', 'out_for_delivery', 'completed', 'cancelled']
const STATUS_CARDS: StatusCardConfig[] = [
  {
    key: 'all',
    label: 'All',
    colorClasses: {
      idle: 'bg-card border-border/80 text-foreground hover:bg-secondary/40 hover:border-primary/30',
      active: 'bg-[#1D6B36] border-[#1D6B36] text-white shadow-xs font-black ring-2 ring-[#1D6B36]/30',
      badgeIdle: 'bg-secondary text-primary',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'pending',
    label: 'Pending',
    colorClasses: {
      idle: 'bg-card border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 hover:bg-amber-50/60 dark:hover:bg-amber-950/30',
      active: 'bg-amber-600 border-amber-600 text-white shadow-xs font-black ring-2 ring-amber-500/30',
      badgeIdle: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'preparing',
    label: 'Processing',
    colorClasses: {
      idle: 'bg-card border-indigo-200/80 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30',
      active: 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-black ring-2 ring-indigo-500/30',
      badgeIdle: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    colorClasses: {
      idle: 'bg-card border-cyan-200/80 dark:border-cyan-900/50 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30',
      active: 'bg-cyan-600 border-cyan-600 text-white shadow-xs font-black ring-2 ring-cyan-500/30',
      badgeIdle: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'completed',
    label: 'Completed',
    colorClasses: {
      idle: 'bg-card border-emerald-200/80 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30',
      active: 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-500/30',
      badgeIdle: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    colorClasses: {
      idle: 'bg-card border-rose-200/80 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 hover:bg-rose-50/60 dark:hover:bg-rose-950/30',
      active: 'bg-rose-600 border-rose-600 text-white shadow-xs font-black ring-2 ring-rose-500/30',
      badgeIdle: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300',
      badgeActive: 'bg-white/20 text-white',
    },
  },
];

/**
 * Clickable status filter chips using real backend status values.
 * If backend statusCounts is not provided, cards are displayed cleanly without fake numbers.
 */
export const OrderStatusSummary: React.FC<OrderStatusSummaryProps> = ({
  currentStatus,
  onSelectStatus,
  statusCounts,
}) => {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-muted"
      dir="ltr"
      role="group"
      aria-label="Filter orders by status"
    >
      {STATUS_CARDS.map((card) => {
        const isActive = currentStatus === card.key;
        const count = statusCounts ? statusCounts[card.key] : undefined;
        const hasCount = typeof count === 'number';

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectStatus(card.key)}
            aria-pressed={isActive}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive ? card.colorClasses.active : card.colorClasses.idle
            }`}
          >
            <span>{card.label}</span>
            {hasCount && (
              <span
                className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-extrabold transition-colors ${
                  isActive ? card.colorClasses.badgeActive : card.colorClasses.badgeIdle
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default OrderStatusSummary;
