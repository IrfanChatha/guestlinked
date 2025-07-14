-- SQL Script to fix buyer_orders table issues
-- Run these commands in your Supabase SQL Editor

-- 1. Allow seller_id to be NULL (since websites may not have sellers)
ALTER TABLE public.buyer_orders ALTER COLUMN seller_id DROP NOT NULL;

-- 2. Change website_id from UUID to INTEGER to match web_sites table
-- First, drop the existing foreign key constraint
ALTER TABLE public.buyer_orders DROP CONSTRAINT IF EXISTS buyer_orders_website_id_fkey;

-- Change the column type from UUID to INTEGER
ALTER TABLE public.buyer_orders ALTER COLUMN website_id TYPE INTEGER USING website_id::text::integer;

-- Re-add the foreign key constraint with INTEGER type
ALTER TABLE public.buyer_orders ADD CONSTRAINT buyer_orders_website_id_fkey 
  FOREIGN KEY (website_id) REFERENCES web_sites (id) ON DELETE CASCADE;

-- 3. Drop the seller_id foreign key constraint since we're allowing NULL
ALTER TABLE public.buyer_orders DROP CONSTRAINT IF EXISTS buyer_orders_seller_id_fkey;

-- 4. Add back seller_id foreign key constraint that allows NULL and SET NULL on delete
ALTER TABLE public.buyer_orders ADD CONSTRAINT buyer_orders_seller_id_fkey 
  FOREIGN KEY (seller_id) REFERENCES auth.users (id) ON DELETE SET NULL;

-- 5. Ensure RLS is enabled
ALTER TABLE public.buyer_orders ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.buyer_orders;
DROP POLICY IF EXISTS "Sellers can view orders for their websites" ON public.buyer_orders;
DROP POLICY IF EXISTS "Buyers can create their own orders" ON public.buyer_orders;
DROP POLICY IF EXISTS "Sellers can update orders for their websites" ON public.buyer_orders;
DROP POLICY IF EXISTS "Buyers can update their pending orders" ON public.buyer_orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.buyer_orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.buyer_orders;
DROP POLICY IF EXISTS "Users can update their orders" ON public.buyer_orders;

-- 7. Create comprehensive RLS policies
-- Allow buyers to view their own orders
CREATE POLICY "buyers_view_own_orders" ON public.buyer_orders
  FOR SELECT USING (buyer_id = auth.uid());

-- Allow sellers to view orders for their websites (if they have seller_id)
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

-- 8. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.buyer_orders TO authenticated;
GRANT USAGE ON SEQUENCE public.buyer_orders_id_seq TO authenticated;

-- 9. Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'buyer_orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Test the policies are working
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'buyer_orders'; 