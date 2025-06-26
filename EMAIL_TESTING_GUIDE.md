# 📧 Przewodnik Testowania Emaili - Dubai Travel AI Agent

## 🎯 Przegląd

System jest teraz skonfigurowany do pobierania **prawdziwych emaili** ze skrzynki IMAP. Żadne dane nie są już symulowane.

## ✅ Status Konfiguracji

### IMAP (Pobieranie emaili)
- **Host**: `imap.zenbox.pl`
- **Port**: `993` (SSL)
- **User**: `marcin@deximlabs.com`
- **Status**: ✅ **DZIAŁA**

### SMTP (Wysyłanie odpowiedzi)
- **Host**: `smtp.zenbox.pl`  
- **Port**: `587` (STARTTLS)
- **User**: `marcin@deximlabs.com`
- **Status**: ✅ **DZIAŁA**

### AI Provider
- **Aktywny**: Claude API (Anthropic)
- **Fallback**: OpenAI API
- **Status**: ✅ **DZIAŁA**

## 🧪 Jak Przetestować

### 1. Test Połączenia IMAP
```bash
curl http://localhost:3003/api/email/test-imap | jq .
```

**Oczekiwany wynik:**
```json
{
  "success": true,
  "message": "Połączenie IMAP działa poprawnie",
  "config": {
    "host": "imap.zenbox.pl",
    "port": "993",
    "user": "marcin@deximlabs.com",
    "secure": true
  }
}
```

### 2. Wyślij Test Email

**Opcja A: Z innego konta email**
1. Wyślij email na `marcin@deximlabs.com`
2. Temat: `Pytanie o wyjazd do Dubaju`
3. Treść przykładowa:
```
Dzień dobry,

Planuję wyjazd do Dubaju w grudniu z rodziną (2 dorosłych + 2 dzieci).
Interesują mnie hotele 4-5 gwiazdek z basenem i blisko atrakcji.
Budżet około 8000 PLN na 7 dni.

Proszę o propozycje hoteli i atrakcji dla dzieci.

Pozdrawiam,
Jan Kowalski
```

**Opcja B: Z tego samego konta (dla testu)**
1. Zaloguj się na webmail `marcin@deximlabs.com`
2. Wyślij email do siebie z inną treścią
3. System pobierze wszystkie emaile z INBOX

### 3. Pobierz i Przetwórz Emaile
```bash
curl -X POST http://localhost:3003/api/email/fetch \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

**Oczekiwany wynik (jeśli są emaile):**
```json
{
  "success": true,
  "message": "Przetworzono 1 emaili",
  "processed": 1,
  "total": 1,
  "emails": [
    {
      "id": 123,
      "subject": "Pytanie o wyjazd do Dubaju",
      "from": "test@example.com",
      "to": "marcin@deximlabs.com",
      "processed": true,
      "responded": true,
      "status": "responded",
      "aiProvider": "claude"
    }
  ]
}
```

### 4. Sprawdź Dashboard
Otwórz: http://localhost:3003/dashboard/emails

## 🔍 Monitoring i Logi

### Sprawdź logi w terminalu podczas pobierania:
```
🚀 Rozpoczynam pobieranie emaili ze skrzynki IMAP...
🔧 Inicjalizacja IMAP Service...
📧 IMAP Host: imap.zenbox.pl
👤 IMAP User: marcin@deximlabs.com
🔌 Łączenie z serwerem IMAP...
✅ Połączono z IMAP
📫 INBOX otwarta. Wiadomości: 5, nowe: 1
📥 Pobieranie wiadomości 1:5
📨 Przetwarzanie wiadomości #1
✉️ Sparsowano email: Pytanie o wyjazd do Dubaju od test@example.com
🔄 Przetwarzanie: "Pytanie o wyjazd do Dubaju" od test@example.com
💾 Zapisano email: Pytanie o wyjazd do Dubaju
🧠 Analizowanie przez AI...
🔍 Wykryty język: pl
📊 Kategoria: travel_inquiry, Sentiment: positive
🤖 Używam providera: claude
📝 Wykryty język: pl
📝 Utworzono konwersację ID: 456
🤖 Odpowiedź AI wygenerowana: 1250 znaków
📤 Próba wysłania odpowiedzi do: test@example.com
✅ Email wysłany pomyślnie
📖 Oznaczono jako przeczytane na serwerze
✅ Kompletnie przetworzono email: Pytanie o wyjazd do Dubaju
```

## 🚨 Rozwiązywanie Problemów

### Problem: "Brak nowych emaili"
**Rozwiązanie:**
1. Sprawdź czy są emaile w skrzynce `marcin@deximlabs.com`
2. System pobiera ostatnie 10 wiadomości z INBOX
3. Wyślij nowy email testowy

### Problem: "IMAP Connection Error"
**Rozwiązanie:**
1. Sprawdź `.env.local`:
   ```env
   IMAP_HOST=imap.zenbox.pl
   IMAP_PORT=993
   IMAP_USER=marcin@deximlabs.com
   IMAP_PASS=twoje-hasło
   ```
2. Sprawdź czy hasło jest poprawne
3. Sprawdź czy IMAP jest włączony na koncie

### Problem: "Email już istnieje"
**Rozwiązanie:**
- System sprawdza `messageId` - każdy email jest przetwarzany tylko raz
- To normalne zachowanie - zapobiega duplikatom

### Problem: "Błąd wysyłania emaila"
**Rozwiązanie:**
1. Sprawdź konfigurację SMTP w `.env.local`
2. Email zostanie zapisany z odpowiedzią AI, ale status będzie `send_error`
3. Możesz ręcznie skopiować odpowiedź z dashboardu

## 📊 Dostępne Endpointy

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/email/test-imap` | GET | Test połączenia IMAP |
| `/api/email/fetch` | POST | Pobierz i przetwórz emaile |
| `/api/emails` | GET | Lista emaili z bazy |
| `/api/ai-status` | GET | Status providerów AI |
| `/api/test-claude` | GET | Test Claude API |
| `/dashboard/emails` | GET | Interfejs webowy |

## 🎉 Gotowe!

System jest teraz w pełni funkcjonalny z prawdziwymi emailami. Każdy email wysłany na `marcin@deximlabs.com` zostanie:

1. ✅ Pobrany przez IMAP
2. ✅ Przeanalizowany przez Claude AI
3. ✅ Zapisany do bazy danych
4. ✅ Automatycznie odpowiedziany
5. ✅ Oznaczony jako przeczytany

**Następny krok:** Wyślij test email i uruchom `/api/email/fetch`! 