-- CRITICAL BUG FIX FOR SUPABASE INFINITE RECURSION
-- Open your Supabase Dashboard -> SQL Editor -> New query -> Paste and RUN this entirely!

-- 1. Create a SECURITY DEFINER function
-- This allows checking the admin role without triggering RLS recursively
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Fix Profiles Table Recursion (This is the main culprit!)
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
CREATE POLICY "Admins have full access" ON public.profiles USING (public.is_admin());

-- 3. Fix Products Table Recursion (Replace "Admins can manage products" or similar policy names)
-- Note: Replace with your exact policy names if different, but this drops the common ones.
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage all products" ON public.products USING (public.is_admin());

-- 4. Fix Categories Table Recursion
DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage all categories" ON public.categories USING (public.is_admin());

-- The recent tables already had this fix added to schema.sql, 
-- but you can run this to be completely safe:
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items" ON public.order_items USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view and insert any ticket message" ON public.ticket_messages;
CREATE POLICY "Admins can view and insert any ticket message" ON public.ticket_messages USING (public.is_admin());

-- After running this, your "stuck" database requests will instantly resolve!
