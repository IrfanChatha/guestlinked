-- RLS Policies for buyer_orders table with UUID primary key
-- Run this in Supabase SQL Editor after creating the table

-- Enable RLS
ALTER TABLE public.buyer_orders ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "buyers_view_own_orders" ON public.buyer_orders;
DROP POLICY IF EXISTS "sellers_view_website_orders" ON public.buyer_orders;
DROP POLICY IF EXISTS "buyers_insert_orders" ON public.buyer_orders;
DROP POLICY IF EXISTS "sellers_update_orders" ON public.buyer_orders;
DROP POLICY IF EXISTS "buyers_update_pending_orders" ON public.buyer_orders;

-- Create comprehensive RLS policies
-- Allow buyers to view their own orders
CREATE POLICY "buyers_view_own_orders" ON public.buyer_orders
  FOR SELECT USING (buyer_id = auth.uid());

-- Allow sellers to view orders for their websites (when seller_id is not null)
CREATE POLICY "sellers_view_website_orders" ON public.buyer_orders
  FOR SELECT USING (seller_id = auth.uid());

-- Allow buyers to insert their own orders
CREATE POLICY "buyers_insert_orders" ON public.buyer_orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Allow sellers to update orders for their websites
CREATE POLICY "sellers_update_orders" ON public.buyer_orders
  FOR UPDATE USING (seller_id = auth.uid());

-- Allow buyers to update their own pending orders
CREATE POLICY "buyers_update_pending_orders" ON public.buyer_orders
  FOR UPDATE USING (buyer_id = auth.uid() AND status = 'pending');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.buyer_orders TO authenticated;

-- Test the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'buyer_orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test the policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'buyer_orders'; 