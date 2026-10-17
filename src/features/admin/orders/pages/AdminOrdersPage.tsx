import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingBag,
  Package,
  XCircle,
  User,
  MapPin,
  Phone,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/feedback/Skeleton.jsx';
import { EmptyState } from '@/components/feedback/EmptyState.jsx';
import { ErrorState } from '@/components/feedback/ErrorState.jsx';
import { AppPagination } from '@/components/common/Pagination.jsx';
import { useOrderFilters } from '../hooks/useOrderFilters';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import { getText } from '@/utils/getText.js';
import { formatEGP } from '@/utils/formatEGP.js';
import { OrdersToolbar } from '../components/OrdersToolbar';
import { OrdersTable } from '../components/OrdersTable';
import type { Order, OrderStatus } from '@/types/order';

const PAGE_SIZE = 10;

/**
 * Admin Orders Management Page.
 * Acts as a thin display layer connecting URL filters to the backend API.
 */
export const AdminOrdersPage: React.FC = () => {
  const {
    filters,
    searchInput,
    setSearchInput,
    setStatus,
    setDateRange,
    setSort,
    setPage,
    resetFilters,
    hasActiveFilters,
  } = useOrderFilters();

  const { data, isLoading, isError, error, refetch } = useOrders(filters);
  const updateStatusMutation = useUpdateOrderStatus();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');

  // Trigger Sonner toast when query fails
  useEffect(() => {
    if (isError && error) {
      toast.error('Failed to load orders from server');
    }
  }, [isError, error]);

  // Lock body scroll and listen for ESC key when details modal is open
  useEffect(() => {
    if (!selectedOrder) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedOrder(null);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedOrder]);

  const orders = data?.orders || [];
  const totalItems = data?.total ?? orders.length;
  const totalPages = data?.pages ?? Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const statusCounts = data?.statusCounts;

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;
    if (!orderId) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus,
      });
      toast.success('Order status updated successfully');
      setSelectedOrder((prev) =>
        prev ? { ...prev, orderStatus: newStatus } : null
      );
    } catch {
      toast.error('Failed to update order status, please try again');
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 font-sans text-start" dir="ltr">
      {/* Header & Breadcrumb */}
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#1A1F16] sm:text-2xl">Orders Management</h1>
          <p className="text-xs text-[#6B7464] mt-0.5">
            Real-time order tracking and delivery status updates
          </p>
        </div>
        <div className="hidden text-xs font-semibold text-[#6B7464] sm:block">
          Mates Store <span className="mx-1">&gt;</span>{' '}
          <span className="text-[#1A1F16]">Orders Management</span>
        </div>
      </div>

      {/* Orders Toolbar (Search, Date Filter, Sort, Status Summary Chips) */}
      <OrdersToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        status={filters.status}
        onStatusChange={setStatus}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onDateRangeChange={setDateRange}
        sort={filters.sort}
        onSortChange={setSort}
        statusCounts={statusCounts}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <Card className="min-w-0 overflow-hidden border border-border/60 p-4 space-y-4">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-36 rounded-md" />
                <Skeleton className="h-6 w-44 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        </Card>
      ) : isError ? (
        <ErrorState
          title="Failed to load orders"
          message="An error occurred while fetching orders from server. Please try again."
          onRetry={() => refetch()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No orders match selected filters' : 'No orders found'}
          description={
            hasActiveFilters
              ? 'No orders matched your selected search and filter criteria.'
              : 'Mates Store has not received any orders yet.'
          }
          icon={ShoppingBag}
          action={
            hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-2 rounded-xl text-xs font-bold text-primary cursor-pointer"
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="min-w-0 overflow-hidden border border-border/60">
          <OrdersTable orders={orders} onOpenDetails={handleOpenDetails} />

          {/* Server-Side Pagination directly using backend total and pages */}
          <AppPagination
            currentPage={filters.page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => {
              setPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            itemLabel="order"
          />
        </Card>
      )}

      {/* Details View Modal */}
      {selectedOrder && (() => {
        const orderId = selectedOrder._id || selectedOrder.id || '';
        const orderNumber = orderId ? `#${orderId.slice(-6).toUpperCase()}` : '—';
        const steps: Array<{ key: OrderStatus; label: string }> = [
          { key: 'pending', label: 'Pending' },
          { key: 'preparing', label: 'Processing' },
          { key: 'out_for_delivery', label: 'Out for Delivery' },
          { key: 'completed', label: 'Completed' },
        ];
        const currentStatus = selectedOrder.orderStatus;
        const isCancelled = currentStatus === 'cancelled';

        const getStepIndex = (status: OrderStatus) => {
          return ['pending', 'preparing', 'out_for_delivery', 'completed'].indexOf(status);
        };
        const activeStepIndex = getStepIndex(currentStatus);

        const finalTotal =
          selectedOrder.finalTotal || selectedOrder.totalOrderPrice || 0;
        const subTotal =
          (selectedOrder.originalTotal || finalTotal) -
          (selectedOrder.taxPrice || 0) -
          (selectedOrder.shippingPrice || 0);

        return createPortal(
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 backdrop-blur-xs flex justify-center items-start animate-fade-in"
            onClick={handleCloseDetails}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-3xl bg-card shadow-xl rounded-3xl border border-border/80 text-foreground my-8 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 px-4 py-3.5 sm:px-6 sm:py-4 bg-card">
                <h2 className="flex min-w-0 items-center gap-2 text-sm font-black sm:text-lg">
                  <ShoppingBag className="h-5 w-5 shrink-0 text-primary" />
                  <span className="truncate">Order Details #{orderNumber}</span>
                </h2>
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Dialog Content Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Order Stepper Progress Tracking */}
                {!isCancelled ? (
                  <div className="space-y-4 overflow-hidden rounded-2xl border border-border/40 bg-secondary/10 p-3 sm:p-5">
                    <h4 className="text-xs font-bold text-muted-foreground text-start">
                      Real-time Order Progress
                    </h4>
                    <div className="overflow-x-auto pb-2">
                      <div className="relative flex min-w-[480px] items-center justify-between px-2">
                        {/* Stepper Connection Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/60 -translate-y-1/2 z-0" />
                        <div
                          className="absolute top-1/2 right-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
                          style={{
                            left: `${100 - (Math.max(0, activeStepIndex) / (steps.length - 1)) * 100}%`,
                            right: '0',
                          }}
                        />
                        {steps.map((step, idx) => {
                          const isCompleted = idx <= activeStepIndex;
                          const isActive = idx === activeStepIndex;
                          return (
                            <div key={step.key} className="flex flex-col items-center z-10 relative">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border transition-all ${
                                  isCompleted
                                    ? 'bg-primary text-white border-primary shadow-xs'
                                    : 'bg-card text-muted-foreground border-border/80'
                                } ${isActive ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                              >
                                {idx + 1}
                              </div>
                              <span
                                className={`text-[10px] font-extrabold mt-1.5 ${
                                  isCompleted ? 'text-primary' : 'text-muted-foreground'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-xs font-bold flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    <span>This order has been cancelled by administration.</span>
                  </div>
                )}

                {/* Content Columns */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
                  {/* Customer Shipping Info */}
                  <div className="space-y-4 rounded-2xl border border-border/40 bg-secondary/10 p-4 sm:p-5 text-start">
                    <h3 className="font-extrabold text-sm border-b border-border/40 pb-2 text-[#1A1F16]">
                      Shipping & Contact Details
                    </h3>

                    <div className="space-y-3 text-xs text-muted-foreground">
                      <div className="flex min-w-0 items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-bold text-foreground">Customer Name:</span>
                        <span className="min-w-0 break-words text-foreground font-semibold">
                          {selectedOrder.customerName}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="font-bold text-foreground">Phone Number:</span>
                        <span className="text-foreground font-semibold" dir="ltr">
                          {selectedOrder.phone}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground block">Full Address:</span>
                          <span className="text-foreground mt-0.5 block leading-relaxed">
                            {selectedOrder.address}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-bold text-foreground">Order Date:</span>
                        <span className="text-foreground">
                          {selectedOrder.createdAt
                            ? new Date(selectedOrder.createdAt).toLocaleString('ar-EG')
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Form */}
                  <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-border/40 bg-secondary/10 p-4 sm:p-5 text-start">
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-sm border-b border-border/40 pb-2 text-[#1A1F16]">
                        Manage Order Status
                      </h3>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="order-status-select"
                          className="text-xs font-bold text-muted-foreground block"
                        >
                          Update Delivery Status:
                        </label>
                        <select
                          id="order-status-select"
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                          className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-[#1A1F16]"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Processing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleUpdateStatus}
                      disabled={
                        updateStatusMutation.isPending ||
                        newStatus === selectedOrder.orderStatus
                      }
                      className="w-full mt-4 h-10 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-extrabold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {updateStatusMutation.isPending ? 'Updating...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-3 text-start">
                  <h3 className="font-extrabold text-sm border-b border-border/40 pb-2 text-[#1A1F16]">
                    Ordered Products
                  </h3>

                  <div className="border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/60">
                    {selectedOrder.cartItems?.map((item) => {
                      const prod = item.product || {};
                      const title = getText(prod.title || prod.name) || 'Product';
                      const img = prod.imageCover || prod.image;

                      return (
                        <div
                          key={item._id}
                          className="flex min-w-0 items-center justify-between gap-2 p-3 text-xs sm:p-3.5 bg-card"
                        >
                          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            {img ? (
                              <img
                                src={img}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground/50">
                                <Package className="h-5 w-5" aria-hidden="true" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-bold text-foreground">{title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Unit Price: {formatEGP(item.price || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-end">
                            <span className="font-bold text-foreground block">
                              x{item.quantity}
                            </span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {formatEGP((item.quantity || 1) * (item.price || 0))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Invoice Calculations */}
              <div className="flex shrink-0 flex-col items-end space-y-1.5 border-t border-border/40 px-4 py-3 sm:px-6 sm:py-4 text-xs bg-secondary/30">
                <div className="flex w-full justify-between gap-3 sm:w-64">
                  <span className="text-muted-foreground font-bold">Subtotal:</span>
                  <span className="font-bold text-foreground">
                    {formatEGP(Math.max(0, subTotal))}
                  </span>
                </div>
                {Boolean(selectedOrder.taxPrice && selectedOrder.taxPrice > 0) && (
                  <div className="flex w-full justify-between gap-3 sm:w-64">
                    <span className="text-muted-foreground font-bold">Tax:</span>
                    <span className="text-foreground">
                      {formatEGP(selectedOrder.taxPrice)}
                    </span>
                  </div>
                )}
                {Boolean(
                  selectedOrder.shippingPrice && selectedOrder.shippingPrice > 0
                )}
                <div className="flex w-full justify-between gap-3 sm:w-64">
                  <span className="text-muted-foreground font-bold">Shipping Cost:</span>
                  <span className="text-foreground">
                    {formatEGP(selectedOrder.shippingPrice || 0)}
                  </span>
                </div>
                {Boolean(
                  selectedOrder.loyaltyDiscount && selectedOrder.loyaltyDiscount > 0
                ) && (
                  <div className="flex w-full justify-between gap-3 text-rose-600 font-extrabold sm:w-64">
                    <span>
                      Loyalty Points Discount ({selectedOrder.redeemedPoints} pts):
                    </span>
                    <span>-{formatEGP(selectedOrder.loyaltyDiscount)}</span>
                  </div>
                )}
                <div className="flex w-full justify-between gap-3 border-t border-border/40 pt-2 text-sm font-black text-foreground sm:w-64">
                  <span>Final Total:</span>
                  <span>{formatEGP(finalTotal)}</span>
                </div>
                {Boolean(
                  selectedOrder.earnedPoints && selectedOrder.earnedPoints > 0
                ) && (
                  <div className="flex w-full justify-between gap-3 text-[10px] text-primary font-bold sm:w-64">
                    <span>Earned Loyalty Points:</span>
                    <span>+{selectedOrder.earnedPoints} pts</span>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
};

export default AdminOrdersPage;
