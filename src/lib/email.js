import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const gmail = google.gmail({ version: 'v1' });

// Konfiguracja SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, htmlContent, textContent }) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Nie udało się wysłać emaila');
  }
}

export async function setupGmailWebhook() {
  try {
    // Setup Gmail push notifications
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: 'v1', auth });
    
    const watchResponse = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: 'projects/your-project/topics/gmail-webhook',
        labelIds: ['INBOX']
      }
    });

    return watchResponse.data;
  } catch (error) {
    console.error('Error setting up Gmail webhook:', error);
    throw error;
  }
}

export async function getGmailMessages(auth, query = '', maxResults = 10) {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults
    });

    if (!response.data.messages) {
      return [];
    }

    const messages = await Promise.all(
      response.data.messages.map(async (message) => {
        const msgData = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        
        return parseGmailMessage(msgData.data);
      })
    );

    return messages;
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    throw error;
  }
}

function parseGmailMessage(message) {
  const headers = message.payload.headers;
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const from = headers.find(h => h.name === 'From')?.value || '';
  const to = headers.find(h => h.name === 'To')?.value || '';
  const date = headers.find(h => h.name === 'Date')?.value || '';

  let body = '';
  if (message.payload.parts) {
    const textPart = message.payload.parts.find(
      part => part.mimeType === 'text/plain'
    );
    if (textPart && textPart.body.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString();
    }
  } else if (message.payload.body.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString();
  }

  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    to,
    date,
    body,
    snippet: message.snippet
  };
} 