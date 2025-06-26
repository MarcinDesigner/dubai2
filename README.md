# Dubai Travel Agent - AI Assistant

Inteligentny asystent AI dla biura podróży specjalizującego się w wyjazdach do Dubaju i ZEA. System automatycznie przetwarza emaile od klientów, analizuje ich potrzeby i generuje spersonalizowane odpowiedzi w 7 językach.

## 🚀 Funkcjonalności

### 🤖 AI Assistant
- **Wykrywanie języka** - Automatyczne rozpoznawanie języka zapytania (PL, EN, DE, FR, ES, IT, RU)
- **Analiza sentymentu** - Wykrywanie emocji klienta w czasie rzeczywistym
- **Predykcja zakupu** - Ocena prawdopodobieństwa konwersji (0-100%)
- **Spersonalizowane odpowiedzi** - Dopasowane do profilu i historii klienta

### 📊 Zaawansowana Analityka
- **Profile behawioralne** - Scoring klientów (lojalność, wartość, zaangażowanie)
- **Segmentacja** - Automatyczne kategoryzowanie klientów (VIP, powracający, nowy)
- **Insights AI** - Rekomendacje biznesowe oparte na analizie danych
- **Trendy** - Analiza godzin szczytu, popularnych destynacji, sezonowości

### 🎯 Smart Escalation
- **Automatyczne eskalacje** - Przekazywanie trudnych przypadków do człowieka
- **Priorytetyzacja VIP** - Specjalne traktowanie wysokowartościowych klientów
- **Alerty** - Powiadomienia o negatywnych emocjach lub pilnych sprawach
- **Notyfikacje** - Email/Slack alerts dla zespołu

### 🌍 Wielojęzyczność
- **7 języków** - Polski, Angielski, Niemiecki, Francuski, Hiszpański, Włoski, Rosyjski
- **Lokalizacja** - Automatyczne dostosowanie waluty i formatów
- **Kulturowe** - Uwzględnienie różnic kulturowych w komunikacji

## 🛠️ Stack Technologiczny

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI GPT-4, GPT-3.5-turbo
- **Email**: Gmail API, Nodemailer
- **Deployment**: Vercel (recommended)

## 📦 Instalacja

### Wymagania
- Node.js 18+
- PostgreSQL 14+
- Konto OpenAI API
- Konto Google (Gmail API)

### Krok 1: Klonowanie i instalacja
```bash
git clone <repository-url>
cd dubai-travel-agent
npm install
```

### Krok 2: Konfiguracja bazy danych
```bash
# Skopiuj .env.example do .env.local i wypełnij wartości
cp .env.example .env.local

# Inicjalizuj bazę danych
npx prisma db push

# Załaduj dane testowe
npm run db:seed
```

### Krok 3: Konfiguracja API

#### OpenAI API
1. Uzyskaj klucz API z [OpenAI Platform](https://platform.openai.com)
2. Dodaj do `.env.local`: `OPENAI_API_KEY=your-key`

#### Gmail API
1. Idź do [Google Cloud Console](https://console.cloud.google.com)
2. Włącz Gmail API
3. Stwórz credentials OAuth 2.0
4. Dodaj klucze do `.env.local`

### Krok 4: Uruchomienie
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

## 🔧 Konfiguracja

### Zmienne środowiskowe (.env.local)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dubai_agent"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Gmail API
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REFRESH_TOKEN="your-refresh-token"

# Email Settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App Settings
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Webhook URL for Gmail
WEBHOOK_URL="https://yourdomain.com/api/email/webhook"

# Human agent notification
HUMAN_AGENT_EMAIL="agent@dubaitravel.com"
```

## 📖 Użytkowanie

### Dashboard
- **Główny widok** - Statystyki, AI insights, ostatnie emaile
- **Analiza sentymentu** - Podział emocji klientów
- **Akcje priorytetowe** - Co wymaga uwagi

### Zarządzanie emailami
- **Automatyczne przetwarzanie** - Gmail webhook → AI analysis → Response
- **Ręczne odpowiedzi** - Dla eskalowanych przypadków
- **Historia konwersacji** - Pełna dokumentacja interakcji

### Profile klientów
- **Automatyczne tworzenie** - Na podstawie emaili
- **Scoring** - Lojalność, wartość, zaangażowanie
- **Rekomendacje** - Spersonalizowane dla każdego klienta

### Baza wiedzy
- **Hotele** - Informacje o ofercie hotelowej
- **Atrakcje** - Przewodnik po Dubaju
- **Transport** - Opcje przemieszczania się
- **Praktyczne** - Porady i wskazówki

## 🔄 API Endpoints

### Przetwarzanie emaili
```
POST /api/email/process
- Przetwarza nowy email
- Zwraca AI insights i odpowiedź
```

### Dashboard
```
GET /api/dashboard/enhanced-stats
- Statystyki z AI analytics
- Insights i rekomendacje
```

### Baza wiedzy
```
GET/POST/PUT/DELETE /api/knowledge
- CRUD operacje na bazie wiedzy
```

### Webhook Gmail
```
POST /api/email/webhook
- Endpoint dla Gmail push notifications
```

## 🎯 Przykłady użycia

### Automatyczna odpowiedź
```javascript
// Email od klienta (wykryty język: niemiecki)
"Hallo, ich interessiere mich für eine Reise nach Dubai im März..."

// AI generuje odpowiedź w języku niemieckim z personalizacją
"Vielen Dank für Ihr Interesse an einer Dubai-Reise. 
Basierend auf Ihren Präferenzen empfehlen wir..."
```

### Eskalacja VIP klienta
```javascript
// System wykrywa:
- Klient ma historię rezerwacji > 50,000 AED
- Negatywny sentiment w emailu
- Słowa kluczowe: "problem", "disappointed"

// Automatyczna eskalacja:
- Email do human agent
- Priorytet: URGENT
- Powiadomienie Slack/Teams
```

## 🔮 Roadmap

### Faza 1 (Aktualna)
- ✅ Podstawowy AI assistant
- ✅ Wielojęzyczność
- ✅ Analiza sentymentu
- ✅ Dashboard analytics

### Faza 2 (Q2 2024)
- 🔄 Integracja z systemami rezerwacji
- 🔄 Mobile app
- 🔄 Advanced ML models
- 🔄 WhatsApp/Telegram integration

### Faza 3 (Q3 2024)
- 📋 Voice assistants
- 📋 Predictive analytics
- 📋 Customer journey mapping
- 📋 ROI optimization

## 🤝 Wkład w projekt

1. Fork repository
2. Stwórz feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit zmiany (`git commit -m 'Add some AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📄 Licencja

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontakt

Dubai Travel Agent Team - contact@dubaitravel.com

Project Link: [https://github.com/your-org/dubai-travel-agent](https://github.com/your-org/dubai-travel-agent)

---

**Powered by OpenAI GPT-4, Next.js, and ❤️** 