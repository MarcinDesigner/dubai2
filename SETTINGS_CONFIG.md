# ⚙️ Konfiguracja Ustawień - Dubai Travel AI Agent

## Przegląd Systemu Ustawień

Aplikacja Dubai Travel AI Agent oferuje kompleksowy system ustawień pozwalający na konfigurację wszystkich aspektów działania systemu. Ustawienia są podzielone na 7 głównych kategorii.

## 📍 Dostęp do Ustawień

**URL**: `http://localhost:3003/dashboard/settings`  
**Nawigacja**: Link "⚙️ Ustawienia" w górnym menu

## 🧠 AI Configuration

### Ustawienia Modelu AI
- **AI Model**: Wybór modelu GPT (GPT-4 Turbo, GPT-4, GPT-3.5 Turbo)
- **Temperature**: Kontrola kreatywności (0 = konserwatywny, 1 = kreatywny)
- **Max Tokens**: Maksymalna długość odpowiedzi (domyślnie 2000)
- **Timeout**: Limit czasu dla zapytań AI (domyślnie 30s)

### Funkcje AI
- ✅ **Fallback Responses**: Odpowiedzi awaryjne przy błędach AI
- ✅ **Language Detection**: Automatyczne wykrywanie języka
- ✅ **Sentiment Analysis**: Analiza sentymentu klientów
- ✅ **Purchase Prediction**: Przewidywanie prawdopodobieństwa zakupu

## 📧 Email Processing

### Automatyzacja
- ✅ **Auto-Reply**: Automatyczne odpowiedzi na emaile
- ✅ **Email Signature**: Dodawanie podpisu do odpowiedzi
- **Processing Delay**: Opóźnienie przetwarzania (w sekundach)
- **Max Emails/Hour**: Limit emaili na godzinę (domyślnie 100)

### Szablony Odpowiedzi
- **Professional**: Profesjonalny ton
- **Friendly**: Przyjazny ton
- **Concise**: Zwięzłe odpowiedzi
- **Detailed**: Szczegółowe odpowiedzi

### Eskalacja
- **Escalation Threshold**: Próg eskalacji (0-1)
- **Email Signature**: Konfigurowalna sygnatura

## 🎯 Purchase Alerts

### Wykrywanie Gotowości Zakupu
- ✅ **Enable Purchase Alerts**: Włączenie alertów zakupowych
- **Readiness Threshold**: Próg pewności (domyślnie 80%)
- **High Value Threshold**: Próg wysokiej wartości (domyślnie 10,000 AED)
- **Urgent Response Time**: Czas na pilną odpowiedź (domyślnie 2h)

### Powiadomienia
- ✅ **Email Notifications**: Powiadomienia email
- ❌ **Slack Notifications**: Powiadomienia Slack
- ❌ **SMS Notifications**: Powiadomienia SMS
- **Sales Team Email**: Email zespołu sprzedaży

## 🔔 Notifications

### Kanały Powiadomień
- **Escalation Email**: Email dla eskalacji (domyślnie: agent@dubaitravel.com)
- **Slack Webhook URL**: URL webhooka Slack
- **SMS API Key**: Klucz API dla SMS
- **SMS Phone Number**: Numer telefonu dla SMS

### Włączenie Kanałów
- ✅ **Email Notifications**: Powiadomienia email
- ❌ **Slack Notifications**: Powiadomienia Slack
- ❌ **SMS Notifications**: Powiadomienia SMS

## 🌍 Language Support

### Obsługiwane Języki
- ✅ Polish (pl)
- ✅ English (en)
- ✅ French (fr)
- ✅ German (de)
- ✅ Spanish (es)
- ✅ Italian (it)
- ✅ Russian (ru)

### Konfiguracja
- **Default Language**: Język domyślny (domyślnie: Polish)
- **Fallback Language**: Język zapasowy (domyślnie: English)
- ✅ **Auto-detect Language**: Automatyczne wykrywanie języka

## 📚 Knowledge Base

### Funkcje
- ✅ **Auto-update**: Automatyczne aktualizacje
- ✅ **Search Enabled**: Włączone wyszukiwanie
- ✅ **Categories Enabled**: Włączone kategorie

### Parametry Wyszukiwania
- **Max Results**: Maksymalna liczba wyników (domyślnie 10)
- **Relevance Threshold**: Próg relevantności (domyślnie 0.7)

## ⚡ Performance

### Cache i Wydajność
- ✅ **Cache Enabled**: Włączony cache
- **Cache TTL**: Czas życia cache (domyślnie 3600s = 1h)
- ✅ **Rate Limiting**: Ograniczenia częstotliwości

### Limity
- **Max Requests/Minute**: Maksymalne zapytania na minutę (domyślnie 60)
- **Timeout Seconds**: Timeout w sekundach (domyślnie 30)

## 🔧 Konfiguracja Zaawansowana

### Zmienne Środowiskowe (.env.local)

```env
# AI Configuration
OPENAI_API_KEY="your-openai-api-key"

# Email Configuration
GMAIL_USER="your-gmail@gmail.com"
GMAIL_PASS="your-app-password"

# Purchase Alerts
SALES_TEAM_EMAIL="sales@dubaitravel.com"
HUMAN_AGENT_EMAIL="agent@dubaitravel.com"
PURCHASE_READINESS_THRESHOLD="0.8"
HIGH_VALUE_THRESHOLD="10000"

# Slack Integration
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
SLACK_ENABLED="false"

# SMS Integration
SMS_ENABLED="false"
SMS_API_KEY="your-sms-api-key"
SMS_PHONE_NUMBER="+48123456789"

# Database
DATABASE_URL="file:./dev.db"
```

### API Endpoints

#### GET /api/settings
Pobiera aktualne ustawienia

```json
{
  "ai": { ... },
  "email": { ... },
  "purchaseAlerts": { ... },
  "notifications": { ... },
  "languages": { ... },
  "knowledgeBase": { ... },
  "performance": { ... }
}
```

#### POST /api/settings
Zapisuje nowe ustawienia

```json
{
  "ai": {
    "model": "gpt-4-turbo-preview",
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "email": {
    "autoReply": true,
    "signature": "Your signature"
  }
  // ... inne sekcje
}
```

#### PUT /api/settings
Aktualizuje pojedyncze ustawienie

```json
{
  "section": "ai",
  "key": "temperature",
  "value": 0.8
}
```

## 🎛️ Interfejs Użytkownika

### Struktura Strony
- **Sidebar Navigation**: 7 kategorii ustawień
- **Main Content**: Formularz dla aktywnej kategorii
- **Save Button**: Zapisywanie wszystkich zmian

### Funkcje UI
- **Real-time Validation**: Walidacja w czasie rzeczywistym
- **Auto-save Indication**: Wizualne potwierdzenie zapisania
- **Range Sliders**: Dla wartości numerycznych (temperature, thresholds)
- **Toggle Switches**: Dla opcji boolean
- **Dropdown Selects**: Dla opcji wyboru

## 🚀 Najlepsze Praktyki

### 1. Konfiguracja AI
```javascript
// Optymalne ustawienia dla produkcji
{
  "model": "gpt-4-turbo-preview",
  "temperature": 0.7,
  "maxTokens": 2000,
  "timeout": 30000
}
```

### 2. Purchase Alerts
```javascript
// Rekomendowane ustawienia alertów
{
  "enabled": true,
  "readinessThreshold": 0.8,
  "highValueThreshold": 10000,
  "urgentResponseTime": 2
}
```

### 3. Performance
```javascript
// Optymalne ustawienia wydajności
{
  "cacheEnabled": true,
  "cacheTTL": 3600,
  "maxRequestsPerMinute": 60
}
```

## 🔒 Bezpieczeństwo

### Ochrona Danych
- Hasła API są maskowane w UI
- Ustawienia są walidowane przed zapisem
- Backup automatyczny przed zmianami

### Kontrola Dostępu
- Dostęp tylko dla administratorów
- Logowanie wszystkich zmian
- Możliwość przywrócenia poprzednich ustawień

## 📊 Monitoring

### Logi Systemu
Wszystkie zmiany ustawień są logowane:
```
[2024-06-24 21:42:20] Settings updated: ai.temperature changed from 0.7 to 0.8
[2024-06-24 21:42:20] Settings updated: purchaseAlerts.readinessThreshold changed from 0.8 to 0.85
```

### Metryki Wydajności
System monitoruje wpływ ustawień na:
- Czas odpowiedzi AI
- Skuteczność wykrywania zakupów
- Zadowolenie klientów
- Konwersje sprzedażowe

## 🆘 Rozwiązywanie Problemów

### Częste Problemy

#### 1. AI nie odpowiada
- Sprawdź OPENAI_API_KEY
- Zwiększ timeout
- Włącz fallback responses

#### 2. Brak alertów zakupowych
- Sprawdź czy Purchase Alerts są włączone
- Obniż readinessThreshold
- Sprawdź SALES_TEAM_EMAIL

#### 3. Powiadomienia nie działają
- Sprawdź konfigurację email/Slack/SMS
- Sprawdź zmienne środowiskowe
- Sprawdź logi błędów

### Reset do Domyślnych
Aby przywrócić domyślne ustawienia:
```bash
curl -X DELETE http://localhost:3003/api/settings
```

## 📈 Aktualizacje

System ustawień jest regularnie aktualizowany o nowe funkcje:
- Nowe modele AI
- Dodatkowe kanały powiadomień
- Zaawansowane opcje personalizacji
- Integracje z zewnętrznymi systemami

---

**Ostatnia aktualizacja**: 24.06.2024  
**Wersja**: 1.0.0  
**Kompatybilność**: Dubai Travel AI Agent v2.0+ 