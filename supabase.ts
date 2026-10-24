import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Role = 'customer' | 'worker' | 'admin';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  phone: string;
  city: string;
  area: string;
  language: string;
  avatar_url: string;
  created_at: string;
}

export interface WorkerDetail {
  id: string;
  user_id: string;
  skills: string[];
  experience_years: number;
  hourly_rate: number;
  bio: string;
  id_verified: 'pending' | 'verified' | 'rejected';
  available: boolean;
  total_jobs: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface WorkerWithProfile extends WorkerDetail {
  profile: Profile;
}

export interface Booking {
  id: string;
  customer_id: string;
  worker_id: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  is_group: boolean;
  group_size: number;
  notes: string;
  price: number;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  worker_id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer?: Profile;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'topup' | 'payment' | 'refund' | 'earning';
  direction: 'credit' | 'debit';
  amount: number;
  booking_id: string | null;
  description: string;
  created_at: string;
}

export interface Wallet {
  user_id: string;
  balance: number;
  updated_at: string;
}

export const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Carpentry',
  'Painting',
  'Gardening',
  'Driving',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
