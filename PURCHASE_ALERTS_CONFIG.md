# 🎯 Konfiguracja Alertów Zakupowych - Dubai Travel AI Agent

## Jak działa system wykrywania klientów gotowych do zakupu

### 1. Automatyczne wykrywanie gotowości zakupu

AI agent analizuje każdy email pod kątem **sygnałów gotowości zakupu**:

#### 🎯 Sygnały wysokiej gotowości (90%+):
- "Chcę zarezerwować na konkretne daty"
- "Jak mogę dokonać płatności?"
- "Kiedy muszę potwierdzić rezerwację?"
- "Czy dostępność jest gwarantowana?"
- "Proszę o umowę do podpisania"

#### 🔥 Sygnały średniej gotowości (70-89%):
- "Proszę o finalną wycenę"
- "Porównuję oferty i decyduję"
- "Mam konkretny budżet X AED"
- "Planujemy wyjazd za miesiąc"
- "Czy są jakieś promocje?"

#### 💡 Sygnały początkowej gotowości (50-69%):
- "Interesuje mnie oferta"
- "Jakie są ceny?"
- "Chciałbym więcej informacji"

### 2. Automatyczne powiadomienia

Gdy klient zostanie wykryty jako gotowy do zakupu (>80%), system automatycznie:

#### 📧 Wysyła email do zespołu sprzedaży:
```
Do: sales@dubaitravel.com
Temat: 🚨 KLIENT GOTOWY DO ZAKUPU - email@klienta.com (95%)

DANE KLIENTA:
• Email: email@klienta.com
• Gotowość zakupu: 95%
• Szacowana wartość: 15000 AED
• Czas do zamknięcia: 24 hours
• Status klienta: Nowy

SYGNAŁY GOTOWOŚCI:
• mentioned specific dates
• asked about booking process
• requested final quote

NATYCHMIASTOWE AKCJE:
• Send detailed quote within 2 hours
• Call client directly
• Prepare booking confirmation
```

#### 💬 Slack (jeśli skonfigurowany):
Wysyła strukturalne powiadomienie na kanał Slack z przyciskami akcji.

#### 📱 SMS (opcjonalnie):
Krótkie powiadomienie SMS do kluczowych osób.

### 3. Gdzie znajdziesz alerty

#### W aplikacji:
- **URL**: `http://localhost:3003/dashboard/purchase-alerts`
- **Nawigacja**: Czerwony przycisk "🎯 Alerty Zakupowe" w górnym menu

#### Widok alertów zawiera:
- **Priorytet**: URGENT (czerwony), HIGH (pomarańczowy), MEDIUM (żółty)
- **Gotowość**: Procent prawdopodobieństwa zakupu
- **Wartość**: Szacowana wartość transakcji w AED
- **Czas zamknięcia**: Przewidywany czas do decyzji
- **Sygnały**: Konkretne wypowiedzi klienta wskazujące na gotowość
- **Akcje**: Co zrobić natychmiast

### 4. Konfiguracja powiadomień

#### Zmienne środowiskowe (.env.local):
```env
# Email notifications
SALES_TEAM_EMAIL="twoj-email@firma.com"
HUMAN_AGENT_EMAIL="agent@firma.com"

# Slack integration (opcjonalnie)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# SMS notifications (opcjonalnie)
SMS_ENABLED="true"
SMS_API_KEY="twoj-klucz-sms"
SMS_PHONE_NUMBER="+48123456789"

# Progi alertów
PURCHASE_READINESS_THRESHOLD="0.8"  # 80% gotowości = alert
HIGH_VALUE_THRESHOLD="10000"        # 10000 AED = wysokiej wartości
```

### 5. Integracja z Slack

#### Krok 1: Stwórz Slack Webhook
1. Idź do `https://api.slack.com/apps`
2. Stwórz nową aplikację
3. Włącz "Incoming Webhooks"
4. Skopiuj URL webhooka

#### Krok 2: Dodaj do .env.local
```env
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
```

#### Przykład powiadomienia Slack:
```
🚨 KLIENT GOTOWY DO ZAKUPU (95%)

Email: klient@example.com
Wartość: 15000 AED
Czas zamknięcia: 24 hours
Status: Nowy

Sygnały gotowości:
• mentioned specific dates
• asked about booking process
• requested final quote

[Otwórz konwersację] [Zadzwoń] [Wyślij ofertę]
```

### 6. Działania po otrzymaniu alertu

#### ⚡ Natychmiastowe (w ciągu 2 godzin):
1. **Zadzwoń do klienta** - najskuteczniejsze
2. **Wyślij spersonalizowaną ofertę** z konkretnymi cenami
3. **Sprawdź dostępność** dla wspomnianych dat
4. **Przygotuj umowę** jeśli klient potwierdzi zainteresowanie

#### 📋 Kolejne kroki:
1. **Follow-up email** po 24h jeśli brak odpowiedzi
2. **SMS reminder** po 48h
3. **Alternatywne opcje** jeśli pierwotna oferta nie pasuje
4. **Deadline reminder** przed końcem promocji

### 7. Zarządzanie alertami

#### W panelu alertów możesz:
- **✓ Rozwiąż alert** - gdy skontaktowałeś się z klientem
- **💤 Odłóż alert** - gdy trzeba poczekać na odpowiedź klienta
- **👁️ Zobacz konwersację** - pełna historia emaili
- **📧 Wyślij email** - bezpośredni link do odpowiedzi
- **📞 Zadzwoń** - link do telefonu

### 8. Analityka i raporty

System automatycznie śledzi:
- **Conversion rate** - ile alertów kończy się sprzedażą
- **Response time** - jak szybko reagujesz na alerty
- **Value accuracy** - czy szacowane wartości są trafne
- **Signal effectiveness** - które sygnały najlepiej predykują zakup

### 9. Najlepsze praktyki

#### 🎯 Dla wysokiej konwersji:
1. **Reaguj w ciągu 2 godzin** - po tym czasie szanse spadają o 50%
2. **Dzwoń zamiast pisać** - telefon ma 10x wyższą konwersję
3. **Przygotuj konkretną ofertę** - nie ogólniki
4. **Stwórz poczucie pilności** - "ograniczona dostępność"
5. **Personalizuj komunikację** - użyj danych z profilu klienta

#### ⚠️ Częste błędy:
- Ignorowanie alertów w weekendy
- Wysyłanie ogólnych odpowiedzi
- Brak follow-up po pierwszym kontakcie
- Nie sprawdzanie dostępności przed ofertą

### 10. Monitoring i debugowanie

#### Logi w konsoli:
```bash
🎯 PURCHASE READY CLIENT DETECTED: klient@example.com (95%)
🚨 === ALERT ZAKUPOWY === 🚨
Klient: klient@example.com
Gotowość: 95%
Wartość: 15000 AED
Sygnały: mentioned specific dates, asked about booking process
========================
```

#### Sprawdzanie bazy danych:
```sql
SELECT * FROM purchase_alerts WHERE isActive = true ORDER BY readinessScore DESC;
SELECT * FROM purchase_readiness_logs ORDER BY createdAt DESC LIMIT 10;
```

### 11. Testowanie systemu

#### Wyślij testowy email z sygnałami:
```
Temat: Zapytanie o wyjazd do Dubaju

Dzień dobry,

Planuję wyjazd do Dubaju na daty 15-22 marca 2024 dla 2 osób. 
Mam budżet około 20000 PLN i chciałbym zarezerwować w ciągu tego tygodnia.
Czy mogą Państwo przygotować konkretną ofertę z cenami?
Interesuje mnie hotel 5* blisko plaży.

Proszę o szybką odpowiedź, bo porównuję kilka ofert.

Pozdrawiam,
Test Klient
```

#### Oczekiwany rezultat:
- Alert z gotowością 90%+
- Email do zespołu sprzedaży
- Wpis w panelu alertów
- Flagowanie jako URGENT

---

## 🚀 Gotowe do użycia!

System jest w pełni skonfigurowany i gotowy do wykrywania klientów gotowych do zakupu. Każdy email będzie automatycznie analizowany, a Ty otrzymasz natychmiastowe powiadomienie o najważniejszych leadach.

**Pamiętaj**: Im szybciej zareagujesz na alert, tym wyższa szansa na sprzedaż! 