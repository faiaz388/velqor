-- THIS SCRIPT WILL DYNAMICALLY REMOVE ALL INFINITE RECURSION POLICIES
-- Paste this entirely into the Supabase SQL Editor and run it!

DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    -- 1. Create the safe is_admin function
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
      SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
      );
    $func$;

    -- 2. Dynamically drop EVERY policy on products, categories, and product_images that might cause recursion
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (tablename = 'products' OR tablename = 'categories' OR tablename = 'product_images' OR tablename = 'profiles')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 3. Recreate the precise, SAFE policies using the new is_admin() function

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles USING (public.is_admin());

-- Products
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage all products" ON public.products USING (public.is_admin());

-- Categories
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage all categories" ON public.categories USING (public.is_admin());

-- Product Images
CREATE POLICY "Public product images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage all product images" ON public.product_images USING (public.is_admin());

-- Done!
