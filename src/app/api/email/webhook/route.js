import { NextResponse } from 'next/server';
import { getGmailMessages } from '@/lib/email';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Verify webhook (Google Cloud Pub/Sub)
    if (body.message) {
      const data = JSON.parse(
        Buffer.from(body.message.data, 'base64').toString()
      );
      
      if (data.emailAddress) {
        // Nowy email otrzymany
        await processNewEmails();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}

async function processNewEmails() {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // Pobierz nieprzeczytane emaile
    const messages = await getGmailMessages(
      auth, 
      'is:unread label:inbox', 
      5
    );

    for (const message of messages) {
      // Przetwórz każdy email
      await fetch(`${process.env.NEXTAUTH_URL}/api/email/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          from: message.from,
          to: message.to,
          subject: message.subject,
          content: message.body
        })
      });
    }
  } catch (error) {
    console.error('Error processing new emails:', error);
  }
} 