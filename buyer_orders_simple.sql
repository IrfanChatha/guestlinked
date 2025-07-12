-- Simplified buyer_orders table creation
-- Run this in Supabase SQL Editor

CREATE TABLE buyer_orders (
  id SERIAL PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id INTEGER NOT NULL REFERENCES web_sites(id) ON DELETE CASCADE,
  article_title VARCHAR(500) NOT NULL,
  article_content TEXT NOT NULL,
  target_url VARCHAR(1000) NOT NULL,
  anchor_text VARCHAR(200),
  special_requirements TEXT,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  seller_response TEXT,
  delivery_url VARCHAR(1000),
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE buyer_orders ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view their own orders" ON buyer_orders
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Buyers can create orders" ON buyer_orders
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their orders" ON buyer_orders
    FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON buyer_orders TO authenticated;
GRANT USAGE ON SEQUENCE buyer_orders_id_seq TO authenticated; 