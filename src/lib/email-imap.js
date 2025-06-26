const Imap = require('imap');
const { simpleParser } = require('mailparser');

class IMAPEmailService {
  constructor() {
    console.log('🔧 Inicjalizacja IMAP Service...');
    console.log('📧 IMAP Host:', process.env.IMAP_HOST);
    console.log('👤 IMAP User:', process.env.IMAP_USER || process.env.SMTP_USER);
    
    this.imap = new Imap({
      user: process.env.IMAP_USER || process.env.SMTP_USER,
      password: process.env.IMAP_PASS || process.env.SMTP_PASS,
      host: process.env.IMAP_HOST || 'imap.zenbox.pl',
      port: parseInt(process.env.IMAP_PORT) || 993,
      tls: true,
      tlsOptions: { 
        rejectUnauthorized: false,
        servername: process.env.IMAP_HOST || 'imap.zenbox.pl'
      },
      connTimeout: 60000,
      authTimeout: 60000,
      keepalive: {
        interval: 10000,
        idleInterval: 300000,
        forceNoop: true
      }
    });

    this.imap.on('error', (err) => {
      console.error('❌ IMAP Connection Error:', err);
    });
  }

  async connectAndFetchEmails() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Łączenie z serwerem IMAP...');
      
      this.imap.once('ready', () => {
        console.log('✅ Połączono z IMAP');
        
        this.imap.openBox('INBOX', true, (err, box) => {
          if (err) {
            console.error('❌ Błąd otwierania INBOX:', err);
            reject(err);
            return;
          }

          console.log(`📫 INBOX otwarta. Wiadomości: ${box.messages.total}, nowe: ${box.messages.new}`);

          // Pobierz najnowsze emaile (ostatnie 10)
          if (box.messages.total === 0) {
            console.log('📭 Brak wiadomości w skrzynce');
            this.imap.end();
            resolve([]);
            return;
          }

          // Pobierz ostatnie 10 wiadomości
          const start = Math.max(1, box.messages.total - 9);
          const end = box.messages.total;
          
          console.log(`📥 Pobieranie wiadomości ${start}:${end}`);
          
          const emails = [];
          let processedCount = 0;
          let totalMessages = 0;
          
          console.log('🔧 Tworzenie fetch...');
          const fetch = this.imap.seq.fetch(`${start}:${end}`, { 
            bodies: '',
            struct: true
          });
          
          console.log('📡 Fetch utworzony, dodaję listenery...');

          fetch.on('message', (msg, seqno) => {
            console.log(`📨 Przetwarzanie wiadomości #${seqno}`);
            totalMessages++;
            
            let buffer = '';
            
            msg.on('body', (stream, info) => {
              console.log(`📄 Otrzymano body dla wiadomości #${seqno}`);
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              
              stream.once('end', () => {
                console.log(`📝 Zakończono odczyt body dla wiadomości #${seqno}, parsowanie...`);
                simpleParser(buffer, (err, parsed) => {
                  processedCount++;
                  
                  if (err) {
                    console.error('❌ Błąd parsowania emaila:', err);
                  } else {
                    const emailData = {
                      messageId: parsed.messageId || `auto-${Date.now()}-${seqno}`,
                      from: parsed.from?.text || parsed.from?.value?.[0]?.address || 'unknown@domain.com',
                      to: parsed.to?.text || parsed.to?.value?.[0]?.address || process.env.SMTP_USER,
                      subject: parsed.subject || 'Bez tematu',
                      content: parsed.text || parsed.textAsHtml || parsed.html || 'Brak treści',
                      date: parsed.date || new Date(),
                      attachments: parsed.attachments || [],
                      seqno: seqno
                    };

                    console.log(`✉️ Sparsowano email: ${emailData.subject} od ${emailData.from}`);
                    emails.push(emailData);
                  }
                  
                  // Sprawdź czy wszystkie wiadomości zostały przetworzone
                  if (processedCount === totalMessages) {
                    console.log(`✅ Zakończono parsowanie. Znaleziono ${emails.length} emaili`);
                    this.imap.end();
                    resolve(emails);
                  }
                });
              });
            });

            msg.once('attributes', (attrs) => {
              console.log(`📋 Atrybuty wiadomości #${seqno}:`, {
                uid: attrs.uid,
                flags: attrs.flags,
                date: attrs.date
              });
            });
          });

          fetch.once('error', (err) => {
            console.error('❌ Błąd pobierania wiadomości:', err);
            reject(err);
          });
          
          fetch.once('end', () => {
            console.log(`📤 Zakończono pobieranie ${totalMessages} wiadomości, czekam na parsowanie...`);
            // Nie resolve tutaj - czekamy na zakończenie parsowania wszystkich wiadomości
            
            // Zabezpieczenie - jeśli nie ma wiadomości do parsowania
            if (totalMessages === 0) {
              console.log('📭 Brak wiadomości do parsowania');
              this.imap.end();
              resolve([]);
            }
          });
        });
      });

      this.imap.once('error', (err) => {
        console.error('❌ IMAP Error:', err);
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('🔌 Połączenie IMAP zakończone');
      });

      try {
        this.imap.connect();
      } catch (connectError) {
        console.error('❌ Błąd nawiązywania połączenia IMAP:', connectError);
        reject(connectError);
      }
    });
  }

  async markAsRead(messageId) {
    return new Promise((resolve, reject) => {
      console.log(`📖 Oznaczanie jako przeczytane: ${messageId}`);
      
      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            reject(err);
            return;
          }

          this.imap.search([['HEADER', 'MESSAGE-ID', messageId]], (err, results) => {
            if (err) {
              console.error('❌ Błąd wyszukiwania wiadomości:', err);
              reject(err);
              return;
            }

            if (results.length > 0) {
              console.log(`🔍 Znaleziono wiadomość do oznaczenia: ${results[0]}`);
              this.imap.addFlags(results, ['\\Seen'], (err) => {
                this.imap.end();
                if (err) {
                  console.error('❌ Błąd oznaczania jako przeczytane:', err);
                  reject(err);
                } else {
                  console.log('✅ Oznaczono jako przeczytane');
                  resolve();
                }
              });
            } else {
              console.log('⚠️ Nie znaleziono wiadomości do oznaczenia');
              this.imap.end();
              resolve();
            }
          });
        });
      });

      this.imap.once('error', reject);
      this.imap.connect();
    });
  }

  // Test połączenia
  async testConnection() {
    return new Promise((resolve, reject) => {
      console.log('🧪 Testowanie połączenia IMAP...');
      
      this.imap.once('ready', () => {
        console.log('✅ Test połączenia IMAP - SUKCES');
        this.imap.end();
        resolve(true);
      });

      this.imap.once('error', (err) => {
        console.error('❌ Test połączenia IMAP - BŁĄD:', err);
        reject(err);
      });

      this.imap.connect();
    });
  }
}

module.exports = IMAPEmailService; 