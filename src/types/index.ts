export interface Beautician {
  id: string;
  full_name: string;
  avatar_url?: string;
  specialties: string[];
  experience_years: number;
  bio: string;
  rating: number;
  review_count: number;
  created_at: string;
  beautician_services?: {
    services: Service;
  }[];
  reviews?: Review[];
}

export interface Review {
  id: string;
  beautician_id: string;
  user_id?: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  is_active: boolean;
  image_url?: string;
  beautician_services?: {
    beauticians: Beautician;
  }[];
}

export interface Booking {
  id: string;
  customer_name: string;
  service_name: string;
  service_id: string;
  beautician_id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  user_id: string;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  beautician_id: string;
  slot_time: string;
  is_booked: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'customer' | 'beautician' | 'admin';
  avatar_url?: string;
  updated_at: string;
}
