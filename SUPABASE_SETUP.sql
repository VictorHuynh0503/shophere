-- Run this in your Supabase SQL Editor to set up the database

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  banner_url TEXT,
  logo_url TEXT,
  owner_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_zalo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  images TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'General',
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable public read access
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Anyone can insert shops" ON shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update shops" ON shops FOR UPDATE USING (true);

CREATE POLICY "Public read listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert listings" ON listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update listings" ON listings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete listings" ON listings FOR DELETE USING (true);

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-images', 'shop-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read images" ON storage.objects FOR SELECT USING (bucket_id = 'shop-images');
CREATE POLICY "Anyone upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shop-images');
