# 📧 Przewodnik Konfiguracji Email & AI

## 1. 🔑 Konfiguracja OpenAI API

### Krok 1: Uzyskaj klucz API
1. Idź na https://platform.openai.com/api-keys
2. Zaloguj się lub utwórz konto
3. Kliknij "Create new secret key"
4. Skopiuj klucz (zaczyna się od `sk-...`)

### Krok 2: Dodaj do .env.local
```bash
OPENAI_API_KEY="sk-twoj-klucz-api"
```

## 2. 📧 Konfiguracja Email

### Opcja A: Gmail

#### Krok 1: Utwórz projekt w Google Cloud
1. Idź na https://console.cloud.google.com/
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz Gmail API:
   - Idź do "APIs & Services" > "Library"
   - Wyszukaj "Gmail API"
   - Kliknij "Enable"

#### Krok 2: Utwórz credentials
1. Idź do "APIs & Services" > "Credentials"
2. Kliknij "Create Credentials" > "OAuth 2.0 Client IDs"
3. Wybierz "Desktop application"
4. Skopiuj Client ID i Client Secret

#### Krok 3: Uzyskaj Refresh Token
```bash
# Edytuj plik scripts/gmail-auth.js
# Wstaw swoje CLIENT_ID i CLIENT_SECRET
node scripts/gmail-auth.js
```

#### Krok 4: Konfiguracja .env.local dla Gmail
```bash
# Gmail API
GOOGLE_CLIENT_ID="twoj-client-id"
GOOGLE_CLIENT_SECRET="twoj-client-secret"
GOOGLE_REFRESH_TOKEN="twoj-refresh-token"

# SMTP Gmail
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="twoj-email@gmail.com"
SMTP_PASS="hasło-aplikacji-gmail"
```

#### Krok 5: Hasło aplikacji Gmail
1. Idź do https://myaccount.google.com/security
2. Włącz "2-Step Verification"
3. Idź do "App passwords"
4. Wygeneruj hasło dla "Mail"
5. Użyj tego hasła jako SMTP_PASS

### Opcja B: Własna domena (marcin@dexx.pl)

#### Krok 1: Uzyskaj dane IMAP/SMTP
Skontaktuj się z dostawcą hostingu lub sprawdź panel:
- **IMAP Host**: mail.dexx.pl (lub imap.dexx.pl)
- **IMAP Port**: 993 (SSL) lub 143 (STARTTLS)
- **SMTP Host**: mail.dexx.pl (lub smtp.dexx.pl)
- **SMTP Port**: 465 (SSL) lub 587 (STARTTLS)

#### Krok 2: Konfiguracja .env.local dla własnej domeny
```bash
# IMAP - do odczytywania emaili
IMAP_HOST="mail.dexx.pl"
IMAP_PORT=993
IMAP_USER="marcin@dexx.pl"
IMAP_PASS="twoje-hasło"

# SMTP - do wysyłania odpowiedzi
SMTP_HOST="mail.dexx.pl"
SMTP_PORT=587
SMTP_USER="marcin@dexx.pl"
SMTP_PASS="twoje-hasło"
```

## 3. 🚀 Uruchomienie

### Krok 1: Zainstaluj zależności
```bash
npm install
```

### Krok 2: Skonfiguruj bazę danych
```bash
npx prisma db push
npm run db:seed
```

### Krok 3: Uruchom aplikację
```bash
npm run dev
```

### Krok 4: Testuj pobieranie emaili
1. Idź na http://localhost:3003/dashboard/emails
2. Kliknij "📧 Pobierz nowe emaile"
3. Sprawdź logi w konsoli

## 4. ⚙️ Ustawienia w aplikacji

### Dane w ustawieniach
**TAK, dane w ustawieniach są częściowo symulowane!**

Aby skonfigurować prawdziwe ustawienia:
1. Idź na http://localhost:3003/dashboard/settings
2. Zaktualizuj:
   - **Email Account**: marcin@dexx.pl
   - **Agent Name**: Twoje imię
   - **Signature**: Twoja sygnatura
   - **Working Hours**: Twoje godziny pracy
   - **Auto Reply**: Włącz/wyłącz automatyczne odpowiedzi

## 5. 🔄 Automatyzacja

### Opcja A: Cron Job (Linux/Mac)
```bash
# Dodaj do crontab (crontab -e)
# Pobieraj emaile co 5 minut
*/5 * * * * curl -X POST http://localhost:3003/api/email/fetch
```

### Opcja B: Node.js Scheduler
```javascript
// Dodaj do package.json scripts:
"email:fetch": "curl -X POST http://localhost:3003/api/email/fetch"

// Uruchom co 5 minut:
npm run email:fetch
```

### Opcja C: Gmail Push Notifications (Zaawansowane)
Po wdrożeniu na produkcję możesz skonfigurować webhook:
1. Ustaw WEBHOOK_URL w .env.local
2. Skonfiguruj Gmail Push w Google Cloud Console

## 6. 🔧 Rozwiązywanie problemów

### Problem: "Environment variable not found: OPENAI_API_KEY"
**Rozwiązanie**: Sprawdź czy plik .env.local istnieje i zawiera klucz API

### Problem: "IMAP connection failed"
**Rozwiązanie**: 
- Sprawdź dane IMAP w .env.local
- Upewnij się, że IMAP jest włączony u dostawcy
- Sprawdź firewall/antywirus

### Problem: "SMTP authentication failed"
**Rozwiązanie**:
- Dla Gmail: użyj hasła aplikacji, nie hasła konta
- Dla własnej domeny: sprawdź czy SMTP auth jest włączony

### Problem: "No new emails found"
**Rozwiązanie**:
- Wyślij testowy email na skonfigurowany adres
- Sprawdź czy email nie jest w spam
- Sprawdź logi w konsoli przeglądarki

## 7. 🎯 Następne kroki

1. **Przetestuj z prawdziwymi emailami**
2. **Dostosuj prompty AI** w src/lib/ai.js
3. **Skonfiguruj powiadomienia** (Slack, SMS)
4. **Wdróż na produkcję** (Vercel, Railway, etc.)
5. **Ustaw monitoring** i logi

## 8. 💡 Wskazówki

- **Bezpieczeństwo**: Nigdy nie commituj .env.local do Git
- **Testowanie**: Zacznij od małej liczby emaili
- **Performance**: Rozważ rate limiting dla OpenAI API
- **Backup**: Regularnie backupuj bazę danych
- **Monitoring**: Ustaw alerty dla błędów SMTP/IMAP

---

**Potrzebujesz pomocy?** Sprawdź logi w konsoli lub skontaktuj się z administratorem. 