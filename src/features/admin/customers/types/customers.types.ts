export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  ordersCount?: number;
  completedOrdersCount?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
  lastOrderDate?: string | null;
  role?: 'user' | 'manager' | 'admin' | string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFilters {
  keyword?: string;
  active?: 'all' | 'true' | 'false';
  hasOrders?: 'all' | 'true' | 'false';
  role?: 'all' | 'user' | 'manager' | 'admin';
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CustomerDeleteResponse {
  status: string;
  message: string;
  data?: {
    id: string;
  };
}
