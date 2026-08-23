import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/utils/encryption';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/integrations?error=oauth_rejected`);
    }

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // STRICT SECURITY: Do not trust state payload for company_id. 
    // Always derive from the actively authenticated user session.
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?redirect=/integrations`);
    }

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

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch the user's Gmail profile to get their email address
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profileRes = await gmail.users.getProfile({ userId: 'me' });
    const emailAddress = profileRes.data.emailAddress;

    if (!emailAddress) {
      return NextResponse.json({ error: 'Failed to retrieve email address' }, { status: 400 });
    }

    // Encrypt tokens before storing
    const encryptedCredentials = encrypt(JSON.stringify(tokens));

    const { data: existing, error: selectError } = await supabase
      .from('integrations')
      .select('id')
      .eq('company_id', profile.company_id)
      .eq('type', 'GMAIL')
      .maybeSingle();

    if (selectError) {
      console.error("Select Error:", selectError);
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existing) {
      const { error: updateError } = await supabase.from('integrations').update({
        connected_account: emailAddress,
        credentials: encryptedCredentials,
        status: 'Active',
        updated_at: new Date().toISOString()
      }).eq('id', existing.id);
      if (updateError) {
        console.error("Update Error:", updateError);
        throw new Error(`Update error: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await supabase.from('integrations').insert({
        company_id: profile.company_id,
        name: 'Gmail Intake',
        type: 'GMAIL',
        connected_account: emailAddress,
        credentials: encryptedCredentials,
        status: 'Active',
        created_by: user.id
      });
      if (insertError) {
        console.error("Insert Error:", insertError);
        throw new Error(`Insert error: ${insertError.message}`);
      }
    }

    // Redirect back to integrations page with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/integrations?success=gmail_connected`);
  } catch (error: any) {
    console.error('Error in Gmail callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/integrations?error=internal_error`);
  }
}
