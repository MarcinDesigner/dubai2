const { google } = require('googleapis');
const readline = require('readline');

// Konfiguracja OAuth2
const CLIENT_ID = 'your-client-id';
const CLIENT_SECRET = 'your-client-secret';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Scopes dla Gmail
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify'
];

// Generuj URL autoryzacji
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getAccessToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    
    console.log('Your refresh token is:', token.refresh_token);
    console.log('Add this to your .env.local file as GOOGLE_REFRESH_TOKEN');
  });
}); 