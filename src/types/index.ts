export interface User {
  id: string | number;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  phone?: string | null;
}

export interface AuthError {
  message: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  bookingCount?: number;
}

export interface ServiceType {
  id: number;
  name: string;
  category: Category;
  description?: string;
}

export interface ProviderProfile {
  id: number;
  userId: number;
  user: User;
  description?: string;
  experience?: number;
  rating?: number;
  totalReviews?: number;
  isVerified: boolean;
  isActive: boolean;
  specialties?: string[];
}

export interface ProviderService {
  id: number;
  providerId: number;
  provider: ProviderProfile;
  serviceTypeId: number;
  serviceType: ServiceType;
  price: number;
  duration: number;
  description?: string;
  images?: string[];
  isActive: boolean;
}

export interface Booking {
  id: number;
  userId: number;
  user?: User;
  providerServiceId: number;
  providerService?: ProviderService;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  totalPrice: number;
  notes?: string;
  paymentStatus?: 'HELD' | 'RELEASED';
  completedAt?: string;
  serviceAddress?: string;
  createdAt: string;
  review?: Review;
}

export interface Review {
  id: number;
  bookingId: number;
  userId: number;
  providerId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}
