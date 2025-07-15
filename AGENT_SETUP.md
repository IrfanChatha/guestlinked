# Agent-Buyer System Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# New variable required for agent system
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### How to get the Service Role Key:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the **service_role** key (not the anon key)
4. Add it to your `.env.local` file

⚠️ **Important**: The service role key has admin privileges. Never expose it in client-side code or commit it to version control.

## Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Step 1: Update users_settings_tb to include agent-buyer relationship
ALTER TABLE users_settings_tb
ADD COLUMN parent_buyer_id UUID NULL REFERENCES users_settings_tb(user_id) ON DELETE SET NULL;

-- Step 2: Add comment to clarify the relationship
COMMENT ON COLUMN users_settings_tb.parent_buyer_id IS 'References the buyer user_id that this agent belongs to. NULL for buyers and sellers.';

-- Step 3: Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_settings_parent_buyer_id ON users_settings_tb(parent_buyer_id);
CREATE INDEX IF NOT EXISTS idx_users_settings_role ON users_settings_tb(role);

-- Step 4: Add constraint to ensure agents have a parent buyer
ALTER TABLE users_settings_tb
ADD CONSTRAINT chk_agent_has_parent 
CHECK (
  (role = 'Agent' AND parent_buyer_id IS NOT NULL) OR 
  (role != 'Agent')
);
```

## Testing the System

1. **Create a Buyer Account**: Sign up with role "Buyer"
2. **Add an Agent**: Go to `/buyer/add-agent` and create an agent
3. **Test Agent Login**: Use the agent credentials to log in
4. **Verify Access**: Agent should see buyer's websites and orders

## Features Available

### For Buyers:
- `/buyer/add-agent` - Create new agents
- `/buyer/agents` - Manage existing agents
- `/buyer/buyer-orders` - Place orders (works for both buyers and agents)

### For Agents:
- `/agent/dashboard` - View buyer's websites and orders
- `/buyer/buyer-orders` - Place orders on behalf of buyer
- Limited access (cannot modify settings or add other agents)

## Troubleshooting

### "Service role key not configured" Error
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your environment variables
- Restart your development server after adding the environment variable

### Agent Creation Fails
- Check that the buyer exists and has the correct role
- Verify the email format is valid
- Ensure the agent email doesn't already exist

### Database Constraint Errors
- Make sure you've run all the SQL commands above
- Check that the `users_settings_tb` table has the new `parent_buyer_id` column

## Security Notes

- Service role key allows admin operations - keep it secure
- Agents can only access their assigned buyer's data
- All API endpoints validate user roles and permissions
- Database constraints prevent invalid agent-buyer relationships 