-- Add seller_id column to web_sites table
-- Run this in Supabase SQL Editor

-- Add the seller_id column
ALTER TABLE web_sites 
ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_web_sites_seller_id ON web_sites(seller_id);

-- Update existing websites to have a seller_id (optional - set to a default user or leave null)
-- You can uncomment and modify this if you want to assign existing websites to a specific user
-- UPDATE web_sites SET seller_id = 'your-user-id-here' WHERE seller_id IS NULL;

-- Add comment
COMMENT ON COLUMN web_sites.seller_id IS 'ID of the user who added this website'; 