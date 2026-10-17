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
    label: 'الكل',
    colorClasses: {
      idle: 'bg-white border-[#E2E6DC] text-[#4A5E3D] hover:bg-[#F8FAF6] hover:border-[#1D6B36]/30',
      active: 'bg-[#1D6B36] border-[#1D6B36] text-white shadow-xs font-black ring-2 ring-[#1D6B36]/30',
      badgeIdle: 'bg-[#F0F3EE] text-[#1D6B36]',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'pending',
    label: 'قيد الانتظار',
    colorClasses: {
      idle: 'bg-white border-amber-200/80 text-amber-800 hover:bg-amber-50/60',
      active: 'bg-amber-600 border-amber-600 text-white shadow-xs font-black ring-2 ring-amber-500/30',
      badgeIdle: 'bg-amber-100 text-amber-800',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'preparing',
    label: 'جاري التجهيز',
    colorClasses: {
      idle: 'bg-white border-indigo-200/80 text-indigo-800 hover:bg-indigo-50/60',
      active: 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-black ring-2 ring-indigo-500/30',
      badgeIdle: 'bg-indigo-100 text-indigo-800',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'out_for_delivery',
    label: 'خارج للتوصيل',
    colorClasses: {
      idle: 'bg-white border-cyan-200/80 text-cyan-800 hover:bg-cyan-50/60',
      active: 'bg-cyan-600 border-cyan-600 text-white shadow-xs font-black ring-2 ring-cyan-500/30',
      badgeIdle: 'bg-cyan-100 text-cyan-800',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'completed',
    label: 'مكتمل',
    colorClasses: {
      idle: 'bg-white border-emerald-200/80 text-emerald-800 hover:bg-emerald-50/60',
      active: 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-500/30',
      badgeIdle: 'bg-emerald-100 text-emerald-800',
      badgeActive: 'bg-white/20 text-white',
    },
  },
  {
    key: 'cancelled',
    label: 'ملغى',
    colorClasses: {
      idle: 'bg-white border-rose-200/80 text-rose-800 hover:bg-rose-50/60',
      active: 'bg-rose-600 border-rose-600 text-white shadow-xs font-black ring-2 ring-rose-500/30',
      badgeIdle: 'bg-rose-100 text-rose-800',
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
      dir="rtl"
      role="group"
      aria-label="تصفية الطلبات حسب الحالة"
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
