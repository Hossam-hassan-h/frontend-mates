import React from 'react';
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types/order';
import { OVERDUE_THRESHOLD_DAYS } from '../constants/ordersConstants';
import { formatRelativeDate } from '@/utils/formatDate';

interface OrdersTableProps {
  orders: Order[];
  onOpenDetails: (order: Order) => void;
}

// Status labels & color tokens matching the theme
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: 'قيد الانتظار',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  preparing: {
    label: 'جاري التجهيز',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Package,
  },
  out_for_delivery: {
    label: 'خارج للتوصيل',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Truck,
  },
  completed: {
    label: 'مكتمل',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'ملغى',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
};

/**
 * Check whether an order is overdue according to OVERDUE_THRESHOLD_DAYS.
 * Only non-terminal orders (not completed and not cancelled) can be overdue.
 */
function checkOverdue(order: Order): { isOverdue: boolean; daysAgo: number } {
  const terminalStatuses: OrderStatus[] = ['completed', 'cancelled'];
  if (terminalStatuses.includes(order.orderStatus)) {
    return { isOverdue: false, daysAgo: 0 };
  }

  const dateValue = order.createdAt || order.orderDate;
  if (!dateValue) {
    return { isOverdue: false, daysAgo: 0 };
  }

  const created = new Date(dateValue);
  if (Number.isNaN(created.getTime())) {
    return { isOverdue: false, daysAgo: 0 };
  }

  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    isOverdue: diffDays > OVERDUE_THRESHOLD_DAYS,
    daysAgo: diffDays,
  };
}

/**
 * Orders Table component with RTL layout, overdue highlights,
 * merged customer+phone column, relative dates, and action button.
 */
export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onOpenDetails }) => {
  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain" dir="rtl">
      <table className="w-full min-w-[1000px] text-sm text-right text-muted-foreground">
        <thead className="bg-[#F8FAF6] text-[11px] font-bold uppercase tracking-wider text-[#4A5E3D] border-b border-[#E2E6DC]">
          <tr>
            <th className="px-4 py-3.5">رقم الطلب</th>
            <th className="px-4 py-3.5">العميل + الهاتف</th>
            <th className="px-4 py-3.5">العنوان</th>
            <th className="px-4 py-3.5">التاريخ</th>
            <th className="px-4 py-3.5">المنتجات</th>
            <th className="px-4 py-3.5">الإجمالي</th>
            <th className="px-4 py-3.5">حالة الطلب</th>
            <th className="px-4 py-3.5 text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E6DC] bg-white">
          {orders.map((order) => {
            const rawId = order._id || order.id || '';
            const orderNumber = rawId ? `#${rawId.slice(-6).toUpperCase()}` : '—';
            const statusInfo =
              STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
            const StatusIcon = statusInfo.icon;
            const finalTotal = order.finalTotal || order.totalOrderPrice || 0;
            const productCount = order.cartItems?.length || 0;
            const { isOverdue, daysAgo } = checkOverdue(order);
            const overdueLabel = `الطلب متأخر — منذ ${daysAgo} ${
              daysAgo === 1 ? 'يوم' : daysAgo === 2 ? 'يومين' : daysAgo <= 10 ? 'أيام' : 'يوم'
            }`;

            return (
              <tr
                key={rawId}
                className={`hover:bg-[#F9FAF8] transition-colors ${
                  isOverdue ? 'border-r-4 border-r-amber-500 bg-amber-50/15' : ''
                }`}
              >
                {/* Order Number */}
                <td className="px-4 py-3.5 font-bold text-xs text-primary whitespace-nowrap">
                  {orderNumber}
                </td>

                {/* Combined Customer + Phone */}
                <td className="px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm text-[#1A1F16] truncate">
                      {order.customerName || 'عميل'}
                    </p>
                    <p className="text-xs text-[#6B7464] font-medium mt-0.5" dir="ltr">
                      {order.phone || '—'}
                    </p>
                  </div>
                </td>

                {/* Address (Truncated with tooltip) */}
                <td className="px-4 py-3.5 font-medium max-w-[200px]">
                  <div className="truncate" title={order.address}>
                    {order.address || '—'}
                  </div>
                </td>

                {/* Date (Relative for <7d, Absolute for >=7d) */}
                <td className="px-4 py-3.5 font-medium text-xs whitespace-nowrap">
                  {formatRelativeDate(order.createdAt || order.orderDate)}
                </td>

                {/* Product Items Count */}
                <td className="px-4 py-3.5 font-bold text-xs whitespace-nowrap">
                  {productCount} {productCount > 10 ? 'أصناف' : 'صنف'}
                </td>

                {/* Total */}
                <td className="px-4 py-3.5 font-extrabold text-sm text-[#1A1F16] whitespace-nowrap">
                  {Number(finalTotal).toFixed(2)} EGP
                </td>

                {/* Order Status + Overdue Warning */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusInfo.label}</span>
                    </span>

                    {isOverdue && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300"
                        title={overdueLabel}
                        aria-label={overdueLabel}
                      >
                        <AlertTriangle
                          className="w-3 h-3 text-amber-600 shrink-0"
                          aria-hidden="true"
                        />
                        <span>متأخر ({daysAgo}ي)</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions: Manage Order */}
                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-extrabold transition-all cursor-pointer"
                    title="عرض وإدارة تفاصيل الطلب"
                  >
                    <ClipboardCheck aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>إدارة الطلب</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
