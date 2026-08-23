import { google } from 'googleapis';
import { createAdminClient } from '@/lib/supabase/server';
import { decrypt, encrypt } from '@/lib/utils/encryption';
import { processIncomingLead } from './processIncomingLead';
import { convert } from 'html-to-text';

export async function syncGmailInbox(companyId: string, connectedAtStr?: string) {
  const supabase = await createAdminClient();

  // 1. Fetch integration credentials
  const { data: integration, error } = await supabase
    .from('integrations')
    .select('id, credentials, connected_account')
    .eq('company_id', companyId)
    .eq('type', 'GMAIL')
    .eq('status', 'Active')
    .single();

  if (error || !integration || !integration.credentials) {
    console.error(`[Gmail Adapter] No active Gmail integration found for company ${companyId}`);
    return { success: false, error: 'No active integration' };
  }

  try {
    const rawTokens = decrypt(integration.credentials);
    const tokens = JSON.parse(rawTokens);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials(tokens);

    // Auto-save refreshed tokens if Google updates them
    oauth2Client.on('tokens', async (newTokens) => {
      // Merge with existing tokens to preserve refresh_token if newTokens doesn't include one
      const mergedTokens = { ...tokens, ...newTokens };
      await supabase
        .from('integrations')
        .update({ credentials: encrypt(JSON.stringify(mergedTokens)) })
        .eq('id', integration.id);
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 2. Fetch unread messages, excluding sent emails, within the last 24 hours
    let query = 'is:unread -from:me newer_than:1d';
    
    // Only fetch emails received AFTER the integration was connected
    if (connectedAtStr) {
      // Convert ISO string to Unix timestamp in seconds (Gmail format)
      const unixSeconds = Math.floor(new Date(connectedAtStr).getTime() / 1000);
      query += ` after:${unixSeconds}`;
    }

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20
    });

    const messages = response.data.messages || [];
    let processedCount = 0;

    for (const msg of messages) {
      if (!msg.id) continue;

      // Ensure idempotency using the Gmail message ID
      // If another process or a previous run already created an automation_run for this external_id,
      // processIncomingLead will catch it and return IDEMPOTENT_SKIPPED.
      // However, we must pass the external_id to processIncomingLead!

      // Fetch the full message payload
      const msgData = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      });

      const headers = msgData.data.payload?.headers || [];
      const getHeader = (name: string) => headers.find(h => h.name && h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const subject = getHeader('subject');
      let fromHeader = getHeader('from');
      const messageIdHeader = getHeader('message-id') || msg.id;
      
      // Simple parse of "Name <email>"
      let senderName = '';
      let senderEmail = '';
      
      const emailMatch = fromHeader.match(/<(.*?)>/);
      if (emailMatch) {
        senderEmail = emailMatch[1];
        senderName = fromHeader.replace(/<.*?>/, '').trim().replace(/"/g, '');
      } else {
        senderEmail = fromHeader;
        senderName = fromHeader;
      }

      // Very basic filtering (bounce emails, automated systems)
      if (senderEmail.toLowerCase().includes('mailer-daemon') || 
          senderEmail.toLowerCase().includes('noreply') || 
          senderEmail.toLowerCase().includes('no-reply')) {
        // Mark as read and skip
        await markAsRead(gmail, msg.id);
        continue;
      }

      // Extract Body
      let bodyText = '';
      const parts = msgData.data.payload?.parts;
      
      const extractText = (parts: any[]): string => {
        let text = '';
        for (const part of parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            text += Buffer.from(part.body.data, 'base64').toString('utf8');
          } else if (part.mimeType === 'text/html' && part.body?.data && !text) { // fallback to HTML
            const html = Buffer.from(part.body.data, 'base64').toString('utf8');
            text += convert(html, { wordwrap: 130 });
          } else if (part.parts) {
            text += extractText(part.parts);
          }
        }
        return text;
      };

      if (parts) {
        bodyText = extractText(parts);
      } else if (msgData.data.payload?.body?.data) {
        const mimeType = msgData.data.payload.mimeType;
        const decoded = Buffer.from(msgData.data.payload.body.data, 'base64').toString('utf8');
        if (mimeType === 'text/html') {
          bodyText = convert(decoded, { wordwrap: 130 });
        } else {
          bodyText = decoded;
        }
      }

      if (!bodyText.trim()) {
        bodyText = '(No readable text found in email)';
      }
      
      const fullRawContent = `Subject: ${subject}\n\n${bodyText}`;

      // 3. Process the lead
      try {
        const result = await processIncomingLead({
          companyId,
          source: 'GMAIL',
          externalId: messageIdHeader, // CRITICAL FOR IDEMPOTENCY
          rawContent: fullRawContent,
          structuredData: {
            fullName: senderName,
            email: senderEmail,
            message: subject // Map subject to message to satisfy TS
          }
        });

        if (result.status === 'ERROR') {
          console.error(`[Gmail Adapter] Error processing message ${msg.id}:`, (result as any).error);
        } else {
          processedCount++;
        }
        
        // 4. Mark as read ONLY if processing didn't throw a fatal exception (like 429 Rate Limit)
        await markAsRead(gmail, msg.id);
      } catch (err) {
        console.error(`[Gmail Adapter] Fatal error processing message ${msg.id}:`, err);
        // DO NOT mark as read. This leaves the email unread so the next cron run can retry it.
      }
    }

    return { success: true, processedCount };
  } catch (error: any) {
    console.error(`[Gmail Adapter] Sync failed for company ${companyId}:`, error);
    return { success: false, error: error.message };
  }
}

async function markAsRead(gmail: any, messageId: string) {
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  } catch (e) {
    console.error(`[Gmail Adapter] Failed to mark message ${messageId} as read:`, e);
  }
}
