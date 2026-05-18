-- Add image_url to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS policies just in case
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
CREATE POLICY "Public categories are viewable by everyone" ON public.categories 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;
CREATE POLICY "Admins can manage all categories" ON public.categories 
USING (public.is_admin());
