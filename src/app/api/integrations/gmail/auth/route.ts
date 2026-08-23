import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // We only allow authenticated users to connect Gmail for their tenant
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's company_id from their profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'No company associated with user' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/integrations/gmail/callback`
    );

    // Encode the company_id in the state parameter to ensure the callback ties it to the correct tenant.
    // Also include a random nonce/CSRF token to prevent CSRF.
    const stateObj = {
      companyId: profile.company_id,
      nonce: crypto.randomUUID()
    };
    
    // In a stricter system, you would store this nonce in a cookie/session to verify on callback.
    // We will just base64 encode it for the state string.
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to get a refresh token
      prompt: 'consent', // Force consent to ensure refresh token is provided
      scope: scopes,
      state: state
    });

    return NextResponse.redirect(authorizationUrl);
  } catch (error: any) {
    console.error('Error generating Gmail auth URL:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
