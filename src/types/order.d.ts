export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export interface CartItemProduct {
  _id?: string;
  name?: string;
  title?: string;
  image?: string;
  imageCover?: string;
  originalPrice?: number;
  discountedPrice?: number;
  unit?: string;
}

export interface OrderCartItem {
  _id: string;
  quantity: number;
  price: number;
  product?: CartItemProduct;
}

export interface OrderUser {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  loyaltyPoints?: number;
}

export interface Order {
  id: string;
  _id?: string;
  customerName: string;
  phone: string;
  address: string;
  totalOrderPrice: number;
  finalTotal: number;
  originalTotal?: number;
  taxPrice?: number;
  shippingPrice?: number;
  loyaltyDiscount?: number;
  redeemedPoints?: number;
  earnedPoints?: number;
  orderStatus: OrderStatus;
  orderDate?: string;
  user?: OrderUser | string;
  cartItems?: OrderCartItem[];
  isPaid?: boolean;
  isDelivered?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
