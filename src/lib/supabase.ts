import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface Shop {
  id: string;
  slug: string;
  name: string;
  description: string;
  banner_url: string | null;
  logo_url: string | null;
  owner_email: string;
  created_at: string;
}

export interface Listing {
  id: string;
  shop_id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  images: string[];
  category: string;
  in_stock: boolean;
  created_at: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Provide a dummy client for build-time compatibility
  supabase = createClient("https://placeholder.supabase.co", "placeholder-key");
}

export { supabase };
