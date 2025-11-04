// Shared TypeScript types for both client and server

export enum UserRole {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
  COD = 'cod',
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  googleId?: string;
  addresses?: IAddress[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddress {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
}

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  unit: string; // kg, liters, pieces, etc.
  seller: string | IUser;
  ratings: {
    average: number;
    count: number;
  };
  discount?: number;
  isActive: boolean;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartItem {
  product: string | IProduct;
  quantity: number;
  price: number;
}

export interface IOrder {
  _id?: string;
  customer: string | IUser;
  items: ICartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  shippingAddress: IAddress;
  deliveryDate?: Date;
  trackingNumber?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReview {
  _id?: string;
  product: string | IProduct;
  user: string | IUser;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: IUser;
}

export interface ApiError {
  message: string;
  errors?: { [key: string]: string };
}

