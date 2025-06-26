// Fallback AI system - symuluje odpowiedzi bez OpenAI API

export function detectLanguageFallback(text) {
  // Prosta detekcja języka na podstawie słów kluczowych
  const polishWords = ['dzień', 'dobry', 'proszę', 'dziękuję', 'hotel', 'cena', 'dostępność']
  const englishWords = ['hello', 'please', 'thank', 'hotel', 'price', 'availability']
  const germanWords = ['hallo', 'bitte', 'danke', 'hotel', 'preis', 'verfügbarkeit']
  
  const lowerText = text.toLowerCase()
  
  const polishCount = polishWords.filter(word => lowerText.includes(word)).length
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length
  const germanCount = germanWords.filter(word => lowerText.includes(word)).length
  
  if (polishCount >= englishCount && polishCount >= germanCount) return 'pl'
  if (englishCount >= germanCount) return 'en'
  if (germanCount > 0) return 'de'
  
  return 'pl' // domyślnie polski
}

export function generateResponseFallback(emailContent, language = 'pl') {
  const responses = {
    pl: `Dzień dobry!

Dziękuję za zapytanie dotyczące pobytu w Dubaju. Z przyjemnością pomogę Państwu w organizacji wyjazdu.

🏨 **HOTELE W DUBAJU:**
• Burj Al Arab - 2,500 AED/noc (2,700 PLN)
• Atlantis The Palm - 1,800 AED/noc (1,944 PLN)
• Emirates Palace - 2,200 AED/noc (2,376 PLN)
• Four Seasons Resort - 1,600 AED/noc (1,728 PLN)

🎯 **ATRAKCJE:**
• Burj Khalifa - 149 AED (161 PLN)
• Dubai Mall + Fontanna - bezpłatne
• Palm Jumeirah - 89 AED (96 PLN)
• Dubai Marina - spacery bezpłatne

📅 **SIERPIEŃ 2024:**
Doskonały czas na wizytę! Temperatura 35-42°C, idealna pogoda na baseny i klimatyzowane atrakcje.

💰 **PAKIET ALL-INCLUSIVE (7 dni):**
• Hotel 4* + śniadania: od 8,500 PLN/os
• Hotel 5* + all inclusive: od 12,500 PLN/os
• Loty z Polski: od 2,200 PLN

🎁 **PROMOCJA:** Rezerwacja do końca miesiąca - 15% zniżki!

Chętnie przygotujemy spersonalizowaną ofertę. Proszę o kontakt:
📞 +48 123 456 789
📧 marcin@deximlabs.com

Pozdrawiam serdecznie,
Marcin - Ekspert ds. Dubaju
Dubai Travel Experts`,

    en: `Hello!

Thank you for your inquiry about Dubai accommodation. I'd be happy to help you plan your trip.

🏨 **DUBAI HOTELS:**
• Burj Al Arab - 2,500 AED/night ($675)
• Atlantis The Palm - 1,800 AED/night ($486)
• Emirates Palace - 2,200 AED/night ($594)
• Four Seasons Resort - 1,600 AED/night ($432)

🎯 **ATTRACTIONS:**
• Burj Khalifa - 149 AED ($40)
• Dubai Mall + Fountain - free
• Palm Jumeirah - 89 AED ($24)
• Dubai Marina - free walks

📅 **AUGUST 2024:**
Perfect time to visit! Temperature 35-42°C, ideal for pools and air-conditioned attractions.

💰 **ALL-INCLUSIVE PACKAGES (7 days):**
• 4* Hotel + breakfast: from $2,300/person
• 5* Hotel + all inclusive: from $3,400/person
• Flights from Europe: from $600

🎁 **PROMOTION:** Book by month end - 15% discount!

I'd be happy to prepare a personalized offer. Please contact:
📞 +48 123 456 789
📧 marcin@deximlabs.com

Best regards,
Marcin - Dubai Expert
Dubai Travel Experts`,

    de: `Hallo!

Vielen Dank für Ihre Anfrage bezüglich Dubai-Unterkünften. Gerne helfe ich Ihnen bei der Reiseplanung.

🏨 **DUBAI HOTELS:**
• Burj Al Arab - 2.500 AED/Nacht (625€)
• Atlantis The Palm - 1.800 AED/Nacht (450€)
• Emirates Palace - 2.200 AED/Nacht (550€)
• Four Seasons Resort - 1.600 AED/Nacht (400€)

🎯 **ATTRAKTIONEN:**
• Burj Khalifa - 149 AED (37€)
• Dubai Mall + Brunnen - kostenlos
• Palm Jumeirah - 89 AED (22€)
• Dubai Marina - kostenlose Spaziergänge

📅 **AUGUST 2024:**
Perfekte Reisezeit! Temperatur 35-42°C, ideal für Pools und klimatisierte Attraktionen.

💰 **ALL-INCLUSIVE PAKETE (7 Tage):**
• 4* Hotel + Frühstück: ab 2.100€/Person
• 5* Hotel + all inclusive: ab 3.100€/Person
• Flüge aus Deutschland: ab 550€

🎁 **AKTION:** Buchung bis Monatsende - 15% Rabatt!

Gerne erstelle ich ein personalisiertes Angebot. Kontakt:
📞 +48 123 456 789
📧 marcin@deximlabs.com

Mit freundlichen Grüßen,
Marcin - Dubai Experte
Dubai Travel Experts`
  }
  
  return responses[language] || responses.pl
}

export function categorizeEmailFallback(emailContent) {
  const lowerContent = emailContent.toLowerCase()
  
  // Kategoryzacja na podstawie słów kluczowych
  let category = 'general'
  let urgency = 'medium'
  let topics = ['general']
  let sentiment = 'neutral'
  let hasSpecificDates = false
  let priceRange = 'not-specified'
  
  // Kategorie
  if (lowerContent.includes('hotel') || lowerContent.includes('zakwaterowanie')) {
    category = 'hotels'
    topics = ['hotels', 'accommodation']
  } else if (lowerContent.includes('atrakcj') || lowerContent.includes('zwiedzanie')) {
    category = 'attractions'
    topics = ['attractions', 'sightseeing']
  } else if (lowerContent.includes('restauracj') || lowerContent.includes('jedzenie')) {
    category = 'restaurants'
    topics = ['restaurants', 'dining']
  } else if (lowerContent.includes('transport') || lowerContent.includes('lot')) {
    category = 'transport'
    topics = ['transport', 'flights']
  } else if (lowerContent.includes('rezerwacj') || lowerContent.includes('booking')) {
    category = 'booking'
    topics = ['booking', 'reservation']
  }
  
  // Pilność
  if (lowerContent.includes('pilne') || lowerContent.includes('urgent') || lowerContent.includes('szybko')) {
    urgency = 'high'
  } else if (lowerContent.includes('kiedy') || lowerContent.includes('when')) {
    urgency = 'low'
  }
  
  // Sentiment
  if (lowerContent.includes('dziękuję') || lowerContent.includes('świetnie') || lowerContent.includes('excellent')) {
    sentiment = 'positive'
  } else if (lowerContent.includes('problem') || lowerContent.includes('źle') || lowerContent.includes('bad')) {
    sentiment = 'negative'
  }
  
  // Daty
  const datePattern = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/
  if (datePattern.test(lowerContent) || lowerContent.includes('sierpień') || lowerContent.includes('august')) {
    hasSpecificDates = true
  }
  
  // Cena
  if (lowerContent.includes('budget') || lowerContent.includes('tani') || lowerContent.includes('cheap')) {
    priceRange = 'budget'
  } else if (lowerContent.includes('luxury') || lowerContent.includes('luksus') || lowerContent.includes('premium')) {
    priceRange = 'luxury'
  } else if (lowerContent.includes('średni') || lowerContent.includes('mid')) {
    priceRange = 'mid-range'
  }
  
  return {
    category,
    urgency,
    topics,
    sentiment,
    language: detectLanguageFallback(emailContent),
    hasSpecificDates,
    priceRange
  }
} 