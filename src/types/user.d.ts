export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'manager';
  profileImg?: string;
  ordersCount?: number;
  completedOrdersCount?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
  lastOrderDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
