import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to your environment variables.');
}

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function DELETE(request) {
  try {
    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Service role key not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    const { agentId } = await request.json();

    // Validate required fields
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // First, verify the agent exists and get their details
    const { data: agentSettings, error: agentError } = await supabaseAdmin
      .from('users_settings_tb')
      .select('role, parent_buyer_id, email')
      .eq('user_id', agentId)
      .single();

    if (agentError || !agentSettings) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Verify it's actually an agent
    if (agentSettings.role !== 'Agent') {
      return NextResponse.json(
        { error: 'User is not an agent' },
        { status: 400 }
      );
    }

    // Delete from users_settings_tb first
    const { error: settingsError } = await supabaseAdmin
      .from('users_settings_tb')
      .delete()
      .eq('user_id', agentId);

    if (settingsError) {
      console.error('Error deleting agent settings:', settingsError);
      return NextResponse.json(
        { error: `Failed to delete agent settings: ${settingsError.message}` },
        { status: 500 }
      );
    }

    // Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(agentId);

    if (authError) {
      console.error('Error deleting agent from auth:', authError);
      // If auth deletion fails, we should try to restore the settings
      // For now, we'll just log the error and continue
      console.error('Agent auth deletion failed, but settings were removed');
    }

    // Log the successful deletion
    console.log(`Agent deleted successfully: ${agentSettings.email} (${agentId})`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Agent deleted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete agent error:', error);
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

export async function POST() {
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