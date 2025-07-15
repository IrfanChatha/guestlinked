import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!process.env.NEXT_PUBLIC_SERVICE_ROLE) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to your environment variables.');
}

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    // Check if service role key is available
    if (!process.env.NEXT_PUBLIC_SERVICE_ROLE) {
      return NextResponse.json(
        { error: 'Service role key not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    const { agentName, agentEmail, tempPassword, buyerUserId } = await request.json();

    // Validate required fields
    if (!agentName || !agentEmail || !tempPassword || !buyerUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(agentEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Verify that the buyer exists and has the correct role
    const { data: buyerSettings, error: buyerError } = await supabaseAdmin
      .from('users_settings_tb')
      .select('role, user_id')
      .eq('user_id', buyerUserId)
      .single();

    if (buyerError || !buyerSettings) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      );
    }

    if (buyerSettings.role !== 'Buyer') {
      return NextResponse.json(
        { error: 'Only buyers can create agents' },
        { status: 403 }
      );
    }

    // Check if agent email already exists
    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from('users_settings_tb')
      .select('email')
      .eq('email', agentEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: agentEmail,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: agentName,
        role: 'Agent',
        parent_buyer_id: buyerUserId
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: `Failed to create user: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Failed to create user - no user returned' },
        { status: 500 }
      );
    }

    const agentUserId = authUser.user.id;

    // Insert into users_settings_tb with agent role
    const { error: settingsError } = await supabaseAdmin
      .from('users_settings_tb')
      .insert([
        {
          user_id: agentUserId,
          email: agentEmail,
          name: agentName,
          role: 'Agent',
          parent_buyer_id: buyerUserId,
          created_at: new Date().toISOString()
        }
      ]);

    if (settingsError) {
      console.error('Settings error:', settingsError);
      
      // If settings insertion fails, we should clean up the auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(agentUserId);
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }

      return NextResponse.json(
        { error: `Failed to create agent settings: ${settingsError.message}` },
        { status: 500 }
      );
    }

    // Log the successful creation
    console.log(`Agent created successfully: ${agentEmail} for buyer: ${buyerUserId}`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Agent invitation sent successfully',
        agentId: agentUserId
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Invite agent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 