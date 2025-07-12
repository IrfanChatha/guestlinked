# Database Schema Documentation

## Tables Required

### 1. users_settings_tb
This table stores additional user information and role assignments.

```sql
CREATE TABLE users_settings_tb (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'guest',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_settings_user_id ON users_settings_tb(user_id);
CREATE INDEX idx_users_settings_role ON users_settings_tb(role);
```

### 2. web_sites (existing table - needs modification)
Add seller_id column to track which seller owns each website.

```sql
-- Add seller_id column to existing web_sites table
ALTER TABLE web_sites ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_web_sites_seller_id ON web_sites(seller_id);
```

## User Roles

### Buyer
- Can browse websites
- Can place orders for guest posting
- Access to buyer dashboard
- Can view their orders

### Seller
- Can add websites to the marketplace
- Can manage incoming orders
- Access to seller dashboard
- Can view their listed websites

### Guest (default)
- Limited access
- Must upgrade to buyer or seller role

## Authentication Flow

1. User signs up with name, email, password, and role selection
2. User data is stored in both:
   - Supabase Auth (auth.users) with display_name and role metadata
   - Custom table (users_settings_tb) with additional information
3. Upon login, user is redirected to role-specific dashboard
4. Middleware enforces role-based access control

## Role-Based Routing

- `/buyer/buyer-dashboard` - Buyer-specific dashboard
- `/seller/seller-dashboard` - Seller-specific dashboard
- `/dashboard` - General dashboard (fallback)
- `/add-website` - Seller only
- `/my-orders` - Buyer only (guest posting orders)
- `/manage-orders` - Seller only
- `/buyer/websites` - Public (browsable by all)

### 3. buyer_orders
This table stores guest posting orders placed by buyers.

```sql
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
```

## Security Considerations

- Row Level Security (RLS) should be enabled on all tables
- Users can only access their own data
- Sellers can only manage their own websites
- Buyers can only view their own orders
- Orders have comprehensive RLS policies for data protection 