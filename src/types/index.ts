export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  is_active: boolean;
  image_url?: string;
}

export interface Booking {
  id: string;
  customer_name: string;
  service_name: string;
  service_id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  user_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'customer' | 'beautician' | 'admin';
  avatar_url?: string;
  updated_at: string;
}
