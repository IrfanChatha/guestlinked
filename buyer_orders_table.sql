-- SQL Script for buyer_orders table
-- This table stores guest posting orders placed by buyers

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

-- Create indexes for better performance
CREATE INDEX idx_buyer_orders_buyer_id ON buyer_orders(buyer_id);
CREATE INDEX idx_buyer_orders_seller_id ON buyer_orders(seller_id);
CREATE INDEX idx_buyer_orders_website_id ON buyer_orders(website_id);
CREATE INDEX idx_buyer_orders_status ON buyer_orders(status);
CREATE INDEX idx_buyer_orders_created_at ON buyer_orders(created_at);

-- Add foreign key constraint to users_settings_tb for better data integrity
ALTER TABLE buyer_orders 
ADD CONSTRAINT fk_buyer_orders_buyer_settings 
FOREIGN KEY (buyer_id) REFERENCES users_settings_tb(user_id) ON DELETE CASCADE;

ALTER TABLE buyer_orders 
ADD CONSTRAINT fk_buyer_orders_seller_settings 
FOREIGN KEY (seller_id) REFERENCES users_settings_tb(user_id) ON DELETE CASCADE;

-- Add check constraint for valid status values
ALTER TABLE buyer_orders 
ADD CONSTRAINT chk_buyer_orders_status 
CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'));

-- Add check constraint for positive budget
ALTER TABLE buyer_orders 
ADD CONSTRAINT chk_buyer_orders_budget 
CHECK (budget >= 0);

-- Create a trigger to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_buyer_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_buyer_orders_updated_at
    BEFORE UPDATE ON buyer_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_buyer_orders_updated_at();

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE buyer_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Buyers can only see their own orders
CREATE POLICY "Buyers can view their own orders" ON buyer_orders
    FOR SELECT USING (buyer_id = auth.uid());

-- Sellers can only see orders for their websites
CREATE POLICY "Sellers can view orders for their websites" ON buyer_orders
    FOR SELECT USING (seller_id = auth.uid());

-- Buyers can insert their own orders
CREATE POLICY "Buyers can create their own orders" ON buyer_orders
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Sellers can update orders for their websites (status, response, delivery info)
CREATE POLICY "Sellers can update orders for their websites" ON buyer_orders
    FOR UPDATE USING (seller_id = auth.uid());

-- Buyers can update their own orders (only before acceptance)
CREATE POLICY "Buyers can update their pending orders" ON buyer_orders
    FOR UPDATE USING (buyer_id = auth.uid() AND status = 'pending');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON buyer_orders TO authenticated;
GRANT USAGE ON SEQUENCE buyer_orders_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE buyer_orders IS 'Stores guest posting orders placed by buyers';
COMMENT ON COLUMN buyer_orders.buyer_id IS 'ID of the buyer who placed the order';
COMMENT ON COLUMN buyer_orders.seller_id IS 'ID of the seller who owns the website';
COMMENT ON COLUMN buyer_orders.website_id IS 'ID of the website where the guest post will be published';
COMMENT ON COLUMN buyer_orders.article_title IS 'Title of the article to be published';
COMMENT ON COLUMN buyer_orders.article_content IS 'Full content of the article';
COMMENT ON COLUMN buyer_orders.target_url IS 'URL that the guest post should link to';
COMMENT ON COLUMN buyer_orders.anchor_text IS 'Anchor text for the backlink';
COMMENT ON COLUMN buyer_orders.special_requirements IS 'Any special requirements or notes from the buyer';
COMMENT ON COLUMN buyer_orders.budget IS 'Budget allocated for this order';
COMMENT ON COLUMN buyer_orders.status IS 'Current status of the order (pending, accepted, rejected, in_progress, completed, cancelled)';
COMMENT ON COLUMN buyer_orders.seller_response IS 'Response from the seller (acceptance message, rejection reason, etc.)';
COMMENT ON COLUMN buyer_orders.delivery_url IS 'URL where the published article can be found';
COMMENT ON COLUMN buyer_orders.delivery_date IS 'Date when the article was published'; 