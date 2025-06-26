# Claude API Setup Guide - Dubai Travel AI Agent

## 🎯 Przegląd

Dubai Travel AI Agent teraz obsługuje **Claude API** od Anthropic jako alternatywę lub dodatek do OpenAI. System automatycznie wybiera najlepszy dostępny provider lub może być skonfigurowany ręcznie.

## 🔧 Konfiguracja Claude API

### 1. Uzyskanie klucza API

1. Przejdź do [console.anthropic.com](https://console.anthropic.com)
2. Załóż konto lub zaloguj się
3. Przejdź do sekcji "API Keys"
4. Utwórz nowy klucz API
5. Skopiuj klucz (zaczyna się od `sk-ant-`)

### 2. Konfiguracja w projekcie

Dodaj do pliku `.env.local`:

```env
# AI Providers
ANTHROPIC_API_KEY="sk-ant-api03-your-actual-key-here"
AI_PROVIDER="claude"  # lub "auto" dla automatycznego wyboru
```

### 3. Opcje konfiguracji AI_PROVIDER

```env
AI_PROVIDER="claude"    # Wyłącznie Claude
AI_PROVIDER="openai"    # Wyłącznie OpenAI  
AI_PROVIDER="auto"      # Automatyczny wybór (domyślne)
AI_PROVIDER="fallback"  # Tylko lokalne odpowiedzi
```

## 🚀 Testowanie

### Dostępne endpointy testowe:

```bash
# Status wszystkich providerów
curl http://localhost:3003/api/ai-status

# Test Claude API
curl http://localhost:3003/api/test-claude

# Test OpenAI API
curl http://localhost:3003/api/test-openai

# Test lokalnego fallback
curl http://localhost:3003/api/test-ai-response
```

### Test w przeglądarce:

- **Status AI**: http://localhost:3003/api/ai-status
- **Test Claude**: http://localhost:3003/api/test-claude
- **Test OpenAI**: http://localhost:3003/api/test-openai

## 📊 Porównanie providerów

| Feature | Claude | OpenAI | Fallback |
|---------|--------|--------|----------|
| Wykrywanie języka | ✅ | ✅ | ✅ |
| Generowanie odpowiedzi | ✅ | ✅ | ✅ |
| Kategoryzacja emaili | ✅ | ✅ | ✅ |
| Koszt | Średni | Średni | Darmowy |
| Jakość | Wysoka | Wysoka | Podstawowa |
| Niezawodność | Wysoka | Średnia* | 100% |

*OpenAI ma problemy z limitami API

## 🔄 Automatyczny fallback

System automatycznie przełącza się między providerami:

1. **Claude** (jeśli dostępny i skonfigurowany)
2. **OpenAI** (jeśli Claude niedostępny)
3. **Fallback** (jeśli oba API niedostępne)

## 📝 Przykłady użycia

### Konfiguracja hybrydowa (zalecana):

```env
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-..."
AI_PROVIDER="auto"
```

### Tylko Claude:

```env
ANTHROPIC_API_KEY="sk-ant-..."
AI_PROVIDER="claude"
```

### Bez API (tylko fallback):

```env
AI_PROVIDER="fallback"
```

## 🐛 Rozwiązywanie problemów

### Błąd: "ANTHROPIC_API_KEY nie jest skonfigurowany"

```bash
# Sprawdź czy klucz jest ustawiony
echo $ANTHROPIC_API_KEY

# Lub w .env.local
grep ANTHROPIC_API_KEY .env.local
```

### Błąd: "model not found" lub limit exceeded

System automatycznie przełączy się na fallback:

```json
{
  "response": "...",
  "provider": "claude-fallback",
  "fallback": true
}
```

### Sprawdzenie logów

```bash
# Uruchom z debugowaniem
DEBUG=* npm run dev

# Lub sprawdź logi w konsoli przeglądarki
```

## 🎯 Zalecenia

### Dla rozwoju:
- Użyj `AI_PROVIDER="auto"` z oboma kluczami
- Testuj wszystkie endpointy regularnie

### Dla produkcji:
- Skonfiguruj monitoring API limits
- Użyj `AI_PROVIDER="claude"` jako główny
- Zachowaj OpenAI jako backup

### Dla testów:
- Użyj `AI_PROVIDER="fallback"` dla szybkich testów
- Przetestuj wszystkie scenariusze fallback

## 📞 Wsparcie

Jeśli masz problemy z konfiguracją:

1. Sprawdź `/api/ai-status` endpoint
2. Sprawdź logi konsoli
3. Przetestuj każdy provider osobno
4. Upewnij się że klucze API są aktywne

## 🔄 Aktualizacje

System automatycznie wykrywa dostępne providery i dostosowuje się do zmian w konfiguracji bez restartowania aplikacji. 