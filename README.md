# 🏙️ Dubai Travel AI Agent

Inteligentny system zarządzania emailami dla biura podróży specjalizującego się w wyjazdach do Dubaju. System wykorzystuje AI Claude do automatycznego odpowiadania na zapytania klientów w wielu językach.

## ✨ Funkcjonalności

### 🤖 Inteligentne Odpowiedzi AI
- **Claude AI**: Zaawansowane generowanie odpowiedzi
- **Wielojęzyczność**: Automatyczne wykrywanie i odpowiadanie w 7+ językach
- **Kontekstowe odpowiedzi**: Wykorzystanie bazy wiedzy o Dubaju
- **Personalizacja**: Dostosowanie do profilu klienta

### 📧 Zarządzanie Emailami
- **IMAP Integration**: Automatyczne pobieranie emaili
- **Kategoryzacja**: AI klasyfikuje emaile według tematyki
- **Auto-odpowiedzi**: Automatyczne wysyłanie odpowiedzi
- **Status tracking**: Śledzenie statusu każdego emaila

### 📊 Analityka i Insights
- **Analiza sentymentu**: Wykrywanie emocji klientów
- **Predykcja zakupów**: Ocena prawdopodobieństwa zakupu
- **Statystyki**: Szczegółowe raporty i dashboardy
- **Alerty**: Powiadomienia o ważnych klientach

### 🧠 Baza Wiedzy
- **Zarządzanie treści**: Dodawanie/edycja informacji o Dubaju
- **Kategoryzacja**: Organizacja według tematów
- **Wersjonowanie**: Śledzenie zmian w bazie wiedzy
- **Integracja z AI**: Automatyczne wykorzystanie w odpowiedziach

## 🛠️ Technologie

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite z Prisma ORM
- **AI**: Claude AI (Anthropic)
- **Email**: IMAP/SMTP, Nodemailer
- **Deployment**: Vercel

## 📋 Wymagania

- Node.js 18+
- Konto Claude API (Anthropic)
- Dostęp do skrzynki email (IMAP/SMTP)

## 🚀 Instalacja

1. **Klonowanie repozytorium**
```bash
git clone [repository-url]
cd dubai-travel-agent
```

2. **Instalacja zależności**
```bash
npm install
```

3. **Konfiguracja środowiska**
```bash
cp env-template.txt .env.local
```

#### Claude AI
1. Uzyskaj klucz API z [Anthropic Console](https://console.anthropic.com)
2. Dodaj do `.env.local`: `ANTHROPIC_API_KEY=your-key`

#### Email IMAP/SMTP
1. Skonfiguruj dostęp do skrzynki email
2. Dodaj dane do `.env.local`

4. **Konfiguracja bazy danych**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Uruchomienie aplikacji**
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3003

## ⚙️ Konfiguracja

### Przykładowy `.env.local`
```bash
# Database
DATABASE_URL="file:./dev.db"

# Claude AI
ANTHROPIC_API_KEY="your-claude-api-key"

# AI Provider Configuration  
AI_PROVIDER="claude"

# Email Configuration
IMAP_HOST="your-imap-host"
IMAP_PORT=993
IMAP_USER="your-email@domain.com"
IMAP_PASS="your-email-password"

# SMTP Configuration
SMTP_HOST="your-smtp-host"
SMTP_PORT=587
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3003"
```

### Ustawienia AI Provider
- `claude` - Używa Claude AI (zalecane)
- `fallback` - Używa prostych, predefiniowanych odpowiedzi

## 📱 Użytkowanie

### Dashboard
- **Przegląd**: Statystyki i aktywność systemu
- **Emaile**: Lista i zarządzanie emailami klientów
- **Baza wiedzy**: Dodawanie/edycja informacji o Dubaju
- **Alerty**: Powiadomienia o potencjalnych klientach
- **Ustawienia**: Konfiguracja systemu i AI

### API Endpoints
- `GET /api/emails` - Lista emaili
- `POST /api/email/fetch` - Pobieranie nowych emaili
- `GET /api/knowledge` - Baza wiedzy
- `GET /api/ai-status` - Status konfiguracji AI
- `POST /api/settings` - Ustawienia systemu

## 🧪 Testowanie

### Test Claude API
```bash
curl http://localhost:3003/api/test-claude
```

### Test połączenia IMAP
```bash
curl http://localhost:3003/api/email/test-imap
```

### Test SMTP
```bash
curl http://localhost:3003/api/test-smtp
```

## 🚀 Deployment

### Vercel (zalecane)
1. Fork repozytorium
2. Połącz z Vercel
3. Dodaj zmienne środowiskowe
4. Deploy

### Inne platformy
Aplikacja jest kompatybilna z każdą platformą obsługującą Next.js.

## 📊 Monitorowanie

### Logi
System generuje szczegółowe logi dla:
- Przetwarzania emaili
- Odpowiedzi AI
- Błędów systemu
- Aktywności użytkowników

### Metryki
- Liczba przetworzonych emaili
- Czas odpowiedzi AI
- Współczynnik konwersji
- Zadowolenie klientów

## 🔧 Rozwój

### Struktura projektu
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API endpoints
│   ├── dashboard/      # Dashboard pages
│   └── globals.css     # Global styles
├── components/         # React components
├── lib/               # Utilities and services
│   ├── ai.js          # AI integration
│   ├── ai-claude.js   # Claude AI specific
│   ├── ai-fallback.js # Fallback responses
│   ├── email.js       # Email handling
│   └── prisma.js      # Database client
└── prisma/            # Database schema
```

### Dodawanie nowych funkcji
1. Utwórz odpowiedni endpoint w `src/app/api/`
2. Dodaj logikę biznesową w `src/lib/`
3. Utwórz komponenty UI w `src/components/`
4. Dodaj strony w `src/app/dashboard/`

## 🐛 Troubleshooting

### Częste problemy

**Claude API nie odpowiada**
- Sprawdź klucz API w `.env.local`
- Zweryfikuj limity API w Anthropic Console

**Błędy bazy danych**
- Uruchom `npx prisma generate`
- Sprawdź `DATABASE_URL` w `.env.local`

**Problemy z emailami**
- Zweryfikuj ustawienia IMAP/SMTP
- Sprawdź czy serwer email obsługuje połączenia programistyczne

## 📄 Licencja

MIT License - zobacz plik LICENSE

## 🤝 Wsparcie

Jeśli masz pytania lub problemy:
1. Sprawdź dokumentację
2. Przejrzyj istniejące issues
3. Utwórz nowe issue z opisem problemu

---

**Powered by Claude AI, Next.js, and ❤️** 