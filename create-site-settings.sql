-- Create Site Settings table for platform-wide config
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY, -- 'payment' or 'general'
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Public settings are viewable by everyone" ON public.site_settings
FOR SELECT USING (true);

-- Allow admins to manage settings
CREATE POLICY "Admins can manage all settings" ON public.site_settings
USING (public.is_admin());

-- Insert initial payment settings (Admins can later update these in the DB/Admin Panel)
INSERT INTO public.site_settings (id, data) 
VALUES ('payment', '{
    "bkash": "017XX-XXXXXX",
    "nagad": "018XX-XXXXXX",
    "rocket": "019XX-XXXXXX"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;
