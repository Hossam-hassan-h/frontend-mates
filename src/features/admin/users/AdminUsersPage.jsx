import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  MessageCircle,
  Settings,
  Trash2,
  X,
  RotateCcw,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card } from '@/components/ui/card.jsx';
import { AppPagination } from '@/components/common/Pagination.jsx';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog.jsx';
import { EmptyState } from '@/components/feedback/EmptyState.jsx';
import { ErrorState } from '@/components/feedback/ErrorState.jsx';
import { useAdminCustomers } from '@/features/admin/customers/hooks/useAdminCustomers.js';
import { useDeleteCustomer } from '@/features/admin/customers/hooks/useDeleteCustomer.js';
import { useDebounce } from '@/hooks/useDebounce.js';
import { apiClient } from '@/api/apiClient.js';
import { toast } from 'sonner';

const CUSTOMERS_PER_PAGE = 10;

function AccountSettingsModal({ isOpen, onClose, user, onSaveSuccess }) {
  const [role, setRole] = useState(user?.role || 'user');
  const [active, setActive] = useState(user?.active !== false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role || 'user');
      setActive(user.active !== false);
      setPassword('');
      setPasswordConfirm('');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleAccountUpdate = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/users/${user.id}`, { role, active });
      toast.success('Account settings updated successfully');
      onSaveSuccess();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update account settings';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter the new password');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.put(`/users/changePassword/${user.id}`, {
        password,
        passwordConfirm,
      });
      toast.success('Password reset successfully');
      setPassword('');
      setPasswordConfirm('');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-y-auto border border-border/80 bg-card p-6 text-foreground shadow-xl rounded-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        dir="ltr"
      >
        <div className="flex items-center justify-between border-b border-border/60 bg-card pb-4 mb-4">
          <h2 className="text-lg font-bold text-foreground">Account Settings: {user.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Role & Status Settings */}
          <div className="space-y-4 border-b border-border/60 pb-6">
            <h3 className="font-bold text-sm text-foreground">Permissions & Account Status</h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground block">User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="user">Customer (User)</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground block">Account Status</label>
              <select
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
                className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="true">Active (Allowed to shop)</option>
                <option value="false">Blocked (Disabled)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAccountUpdate}
              disabled={isSubmitting}
              className="h-10 w-full rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Save Permissions & Status
            </button>
          </div>

          {/* Password Reset */}
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <h3 className="font-bold text-sm text-foreground">Reset Password</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground block">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground block">Confirm Password</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm Password"
                className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Save New Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [statusFilter, setStatusFilter] = useState('all'); // all, active, blocked
  const [ordersFilter, setOrdersFilter] = useState('all'); // all, has_orders, no_orders
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Reset page to 1 when any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [debouncedSearch, statusFilter, ordersFilter, dateFrom, dateTo]);

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: CUSTOMERS_PER_PAGE,
    };
    if (debouncedSearch.trim()) {
      params.keyword = debouncedSearch.trim();
    }
    if (statusFilter === 'active') {
      params.active = 'true';
    } else if (statusFilter === 'blocked') {
      params.active = 'false';
    }
    if (ordersFilter === 'has_orders') {
      params.hasOrders = 'true';
    } else if (ordersFilter === 'no_orders') {
      params.hasOrders = 'false';
    }
    if (dateFrom) {
      params.from = dateFrom;
    }
    if (dateTo) {
      params.to = dateTo;
    }
    return params;
  }, [currentPage, debouncedSearch, statusFilter, ordersFilter, dateFrom, dateTo]);

  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
  } = useAdminCustomers(queryParams);

  const rawCustomers = useMemo(() => {
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse)) return apiResponse;
    return [];
  }, [apiResponse]);

  const totalCount =
    typeof apiResponse?.total === 'number'
      ? apiResponse.total
      : rawCustomers.length;

  const totalPages = Math.max(1, Math.ceil(totalCount / CUSTOMERS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);

  const normalizedCustomers = useMemo(() => {
    return rawCustomers.map((u) => ({
      id: u._id || u.id,
      name: u.name || '—',
      email: u.email || '',
      phone: u.phone || '',
      ordersCount: u.ordersCount || 0,
      completedOrdersCount: u.completedOrdersCount || 0,
      totalSpent: u.totalSpent || 0,
      loyaltyPoints: u.loyaltyPoints || 0,
      lastOrderDate: u.lastOrderDate || null,
      role: u.role || 'user',
      active: u.active !== false,
      createdAt: u.createdAt || null,
    }));
  }, [rawCustomers]);

  const activeFiltersCount =
    (statusFilter !== 'all' ? 1 : 0) +
    (ordersFilter !== 'all' ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (debouncedSearch.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setOrdersFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const isAllSelected =
    normalizedCustomers.length > 0 &&
    normalizedCustomers.every((c) => selectedIds.has(c.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(normalizedCustomers.map((c) => c.id)));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const { mutate: deleteCustomer, isPending: isDeletePending } = useDeleteCustomer();

  const handleConfirmDelete = () => {
    if (!customerToDelete) return;
    deleteCustomer(customerToDelete.id, {
      onSuccess: () => {
        setCustomerToDelete(null);
        refetch();
      },
    });
  };

  const handleWhatsApp = (phone, name) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      toast.info(`Phone number not available for ${name}`);
    }
  };

  const getInitial = (name) => {
    if (!name) return 'C';
    return name.trim().charAt(0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div
      className="w-full min-w-0 max-w-full space-y-4 font-sans text-start"
      dir="ltr"
    >
      {/* Header & Breadcrumb */}
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#1A1F16] sm:text-2xl">Customer Management</h1>
          <p className="text-xs text-[#6B7464] mt-0.5">
            Total Customers: <span className="font-bold text-[#1A1F16]">{totalCount}</span>
          </p>
        </div>
        <div className="hidden text-xs font-semibold text-[#6B7464] sm:block">
          Mates Store <span className="mx-1">&gt;</span>{' '}
          <span className="text-[#1A1F16]">Customer Management</span>
        </div>
      </div>

      {/* Search & Filter Toolbar Card */}
      <Card className="p-4 rounded-2xl border-border/80 bg-card shadow-xs space-y-3.5">
        {/* Search Input */}
        <div className="relative w-full">
          <label htmlFor="customer-search" className="sr-only">
            Search by customer name, phone, or email
          </label>
          <Search
            aria-hidden="true"
            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="customer-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, or email..."
            className="h-11 w-full rounded-xl border border-input bg-background/60 py-2 pr-11 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="status-filter" className="text-xs font-bold text-muted-foreground">Status:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-input bg-background text-foreground px-3 text-xs font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">All (Active & Blocked)</option>
                <option value="active">Active only</option>
                <option value="blocked">Blocked only</option>
              </select>
            </div>

            {/* Orders Presence Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="orders-filter" className="text-xs font-bold text-muted-foreground">Orders:</label>
              <select
                id="orders-filter"
                value={ordersFilter}
                onChange={(e) => setOrdersFilter(e.target.value)}
                className="h-9 rounded-xl border border-input bg-background text-foreground px-3 text-xs font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">All (All Customers)</option>
                <option value="has_orders">Has previous orders</option>
                <option value="no_orders">No orders</option>
              </select>
            </div>

            {/* Registration Date Range */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground">Registration:</span>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 rounded-xl border border-input bg-background text-foreground px-2.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  title="From date"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 rounded-xl border border-input bg-background text-foreground px-2.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  title="To date"
                />
              </div>
            </div>
          </div>

          {/* Reset Filters & Active Badge */}
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-xs">
                {activeFiltersCount} active filter(s)
              </Badge>
            )}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 gap-1.5 rounded-xl border-dashed border-border text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Selected Rows Notification Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-2.5 border border-primary/20 animate-fade-in">
            <span className="text-xs font-bold text-primary">
              {selectedIds.size} of {normalizedCustomers.length} customers selected on this page
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Deselect
            </button>
          </div>
        )}
      </Card>

      {/* Customer Table Card */}
      <Card className="w-full max-w-full overflow-hidden rounded-2xl border-border/80 bg-card shadow-xs">
        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[920px] table-auto text-sm text-foreground" dir="ltr">
            <thead className="border-b border-border/60 bg-secondary/40">
              <tr className="h-12">
                <th className="w-12 px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    disabled={normalizedCustomers.length === 0}
                    className="flex h-5 w-5 items-center justify-center rounded text-[#1D6B36] hover:bg-[#1D6B36]/10 mx-auto transition-colors disabled:opacity-40"
                    aria-label="Select all"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4 text-[#6B7464]" />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-start font-bold text-[#6B7464]">Customer</th>
                <th className="px-4 py-3 text-center font-bold text-[#6B7464]">Status</th>
                <th className="px-4 py-3 text-center font-bold text-[#6B7464]">Orders</th>
                <th className="px-4 py-3 text-center font-bold text-[#6B7464]">Total Spent</th>
                <th className="px-4 py-3 text-center font-bold text-[#6B7464]">Loyalty Points</th>
                <th className="px-4 py-3 text-center font-bold text-[#6B7464]">Last Order</th>
                <th className="px-5 py-3 text-center font-bold text-[#6B7464]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E6DC]/60">
              {isLoading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="h-[72px] animate-pulse">
                    <td colSpan={8} className="px-5 py-3.5">
                      <div className="h-10 w-full rounded-xl bg-[#F0F2ED]" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center">
                    <ErrorState
                      title="Failed to load customer data"
                      message="An error occurred while fetching customer list from server. Please try again."
                      onRetry={() => refetch()}
                    />
                  </td>
                </tr>
              ) : normalizedCustomers.length > 0 ? (
                normalizedCustomers.map((customer) => {
                  const isSelected = selectedIds.has(customer.id);
                  return (
                    <tr
                      key={customer.id}
                      className={`h-[72px] transition-colors ${
                        isSelected ? 'bg-primary/5' : 'hover:bg-secondary/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-12 px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(customer.id)}
                          className="flex h-5 w-5 items-center justify-center rounded text-primary hover:bg-primary/10 mx-auto transition-colors"
                          aria-label={`Select ${customer.name}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </td>

                      {/* Customer Info (Avatar + Name, Role, Email, Phone) */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-black text-primary">
                            {getInitial(customer.name)}
                          </div>
                          <div className="min-w-0 text-start">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-extrabold text-sm text-foreground">
                                {customer.name}
                              </p>
                              {customer.role === 'admin' && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0 h-4">
                                  Admin
                                </Badge>
                              )}
                              {customer.role === 'manager' && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0 h-4">
                                  Manager
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#6B7464]">
                              {customer.email && <span className="truncate">{customer.email}</span>}
                              {customer.email && customer.phone && <span>•</span>}
                              {customer.phone && <span dir="ltr">{customer.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        {customer.active ? (
                          <Badge variant="success" className="gap-1.5 font-bold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1.5 font-bold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Blocked
                          </Badge>
                        )}
                      </td>

                      {/* Orders Count */}
                      <td className="px-4 py-3.5 text-center">
                        <p className="font-extrabold text-sm text-foreground">
                          {customer.ordersCount || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Completed: {customer.completedOrdersCount || 0}
                        </p>
                      </td>

                      {/* Total Spent */}
                      <td className="px-4 py-3.5 text-center font-extrabold text-sm text-foreground">
                        <span className="text-xs font-semibold mr-0.5">EGP</span>
                        {Number(customer.totalSpent || 0).toFixed(2)}
                      </td>

                      {/* Loyalty Points */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                          {customer.loyaltyPoints || 0} pts
                        </span>
                      </td>

                      {/* Last Order Date */}
                      <td className="px-4 py-3.5 text-center text-xs font-medium text-[#6B7464]">
                        {formatDate(customer.lastOrderDate)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(customer.phone, customer.name)}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#10B981] px-3 text-xs font-extrabold text-white shadow-xs hover:bg-[#059669] transition-all cursor-pointer"
                            title="Contact via WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4 fill-white text-white" />
                            <span className="hidden xl:inline">WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(customer);
                              setIsSettingsOpen(true);
                            }}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#1D6B36] px-3 text-xs font-extrabold text-white shadow-xs hover:bg-[#155227] transition-all cursor-pointer"
                            title="Account Settings & Permissions"
                          >
                            <Settings className="h-4 w-4 text-white" />
                            <span className="hidden xl:inline">Settings</span>
                          </button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCustomerToDelete(customer)}
                            aria-label={`Delete customer ${customer.name}`}
                            className="h-9 gap-1.5 rounded-xl px-3 text-xs font-extrabold shadow-xs cursor-pointer"
                            title="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden xl:inline">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center">
                    {activeFiltersCount > 0 ? (
                      <EmptyState
                        title="No results found"
                        description="No customers matched your search and filter criteria. Try changing your search query or clearing filters."
                        action={
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                            className="gap-1.5 rounded-xl text-xs font-bold text-[#1D6B36] border-[#1D6B36]/30 cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset Filters
                          </Button>
                        }
                      />
                    ) : (
                      <EmptyState
                        title="No customers yet"
                        description="No customers have registered in the store yet."
                      />
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AppPagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={totalCount}
          pageSize={CUSTOMERS_PER_PAGE}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          itemLabel="customer"
        />
      </Card>

      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSaveSuccess={() => {
          refetch();
        }}
      />

      <ConfirmDialog
        open={Boolean(customerToDelete)}
        isOpen={Boolean(customerToDelete)}
        onOpenChange={(open) => {
          if (!open) setCustomerToDelete(null);
        }}
        onCancel={() => {
          if (!isDeletePending) setCustomerToDelete(null);
        }}
        title="Delete customer"
        description={
          customerToDelete
            ? `Are you sure you want to delete customer "${customerToDelete.name}"? Order history will be retained for accounting, and personal data will be hidden.`
            : ''
        }
        confirmLabel="Delete Customer"
        confirmText="Delete Customer"
        cancelLabel="Cancel"
        cancelText="Cancel"
        isDestructive
        variant="danger"
        isLoading={isDeletePending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default AdminUsersPage;
