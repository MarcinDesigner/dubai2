import OpenAI from 'openai';
import prisma from './prisma';
import { detectLanguageFallback, generateResponseFallback, categorizeEmailFallback } from './ai-fallback';
import { detectLanguageClaude, generateResponseClaude, categorizeEmailClaude } from './ai-claude';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Provider selection based on environment or fallback
const AI_PROVIDER = process.env.AI_PROVIDER || 'auto'; // 'openai', 'claude', 'auto', 'fallback'

// Language detection with provider selection
export async function detectLanguage(text) {
  const provider = getAvailableProvider();
  
  switch (provider) {
    case 'claude':
      return await detectLanguageClaude(text);
    case 'openai':
      return await detectLanguageOpenAI(text);
    default:
      return detectLanguageFallback(text);
  }
}

// OpenAI language detection
async function detectLanguageOpenAI(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Detect the language of the following text. Return only the language code: 
          - "pl" for Polish
          - "en" for English  
          - "de" for German
          - "fr" for French
          - "es" for Spanish
          - "it" for Italian
          - "ru" for Russian
          - "other" for any other language
          
          Return ONLY the language code, nothing else.`
        },
        { role: "user", content: text }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    return completion.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error('Error detecting language with OpenAI:', error);
    console.log('🔄 Używam fallback detection...');
    return detectLanguageFallback(text);
  }
}

// Enhanced generateResponse with provider selection
export async function generateResponse(emailContent, aiContext = {}) {
  const provider = getAvailableProvider();
  
  console.log(`🤖 Używam providera: ${provider}`);
  
  switch (provider) {
    case 'claude':
      // Najpierw wykryj język
      const claudeDetectedLanguage = await detectLanguageClaude(emailContent);
      console.log(`📝 Wykryty język: ${claudeDetectedLanguage}`);
      
      // Wywołaj Claude z nowym interfejsem
      const claudeResponse = await generateResponseClaude(emailContent, claudeDetectedLanguage, {});
      
      return {
        response: claudeResponse,
        detectedLanguage: claudeDetectedLanguage,
        originalEmail: emailContent,
        provider: 'claude'
      };
      
    case 'openai':
      return await generateResponseOpenAI(emailContent, aiContext);
    default:
      console.log('🔄 Używam fallback response...');
      const fallbackDetectedLanguage = detectLanguageFallback(emailContent);
      const fallbackResponse = generateResponseFallback(emailContent, fallbackDetectedLanguage);
      return {
        response: fallbackResponse,
        detectedLanguage: fallbackDetectedLanguage,
        originalEmail: emailContent,
        fallback: true,
        provider: 'fallback'
      };
  }
}

// OpenAI generateResponse
async function generateResponseOpenAI(emailContent, aiContext = {}) {
  try {
    // Rozpoznaj język emaila
    const detectedLanguage = await detectLanguageOpenAI(emailContent);
    
    // Pobierz kontekst z bazy wiedzy
    const knowledgeContext = await getRelevantKnowledge(emailContent);
    const hotelContext = await getHotelInfo();
    const attractionContext = await getAttractionInfo();
    
    // Extract AI context
    const { 
      clientProfile, 
      sentimentAnalysis, 
      purchasePrediction, 
      personalizedRecommendations 
    } = aiContext;
    
    // Przygotuj enhanced prompt z AI insights
    const systemPrompt = getEnhancedLocalizedPrompt(detectedLanguage, {
      knowledgeContext,
      hotelContext,
      attractionContext,
      clientProfile,
      sentimentAnalysis,
      purchasePrediction,
      personalizedRecommendations
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: emailContent }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      timeout: 30000 // 30 second timeout
    });

    const response = completion.choices[0].message.content;
    
    return {
      response,
      detectedLanguage,
      originalEmail: emailContent,
      provider: 'openai'
    };
  } catch (error) {
    console.error('Error generating OpenAI response:', error);
    console.log('🔄 Używam fallback response...');
    
    // Fallback response based on language
    const detectedLanguage = detectLanguageFallback(emailContent);
    const fallbackResponse = generateResponseFallback(emailContent, detectedLanguage);
    
    return {
      response: fallbackResponse,
      detectedLanguage,
      originalEmail: emailContent,
      fallback: true,
      provider: 'openai-fallback'
    };
  }
}

// Email categorization with provider selection
export async function categorizeEmail(emailContent) {
  const provider = getAvailableProvider();
  
  switch (provider) {
    case 'claude':
      return await categorizeEmailClaude(emailContent);
    case 'openai':
      return await categorizeEmailOpenAI(emailContent);
    default:
      return categorizeEmailFallback(emailContent);
  }
}

// OpenAI email categorization
async function categorizeEmailOpenAI(emailContent) {
  try {
    // Najpierw wykryj język
    const language = await detectLanguageOpenAI(emailContent);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Categorize email about travel to Dubai. Return JSON with categories:
{
  "category": "hotels|attractions|restaurants|transport|general|booking",
  "urgency": "low|medium|high",
  "topics": ["array", "of", "topics"],
  "sentiment": "positive|neutral|negative",
  "language": "${language}",
  "hasSpecificDates": true|false,
  "priceRange": "budget|mid-range|luxury|not-specified"
}`
        },
        { role: "user", content: emailContent }
      ],
      temperature: 0.1,
      timeout: 15000
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return { ...result, detectedLanguage: language, provider: 'openai' };
  } catch (error) {
    console.error('Error categorizing email with OpenAI:', error);
    console.log('🔄 Używam fallback categorization...');
    const fallback = categorizeEmailFallback(emailContent);
    return { ...fallback, provider: 'openai-fallback' };
  }
}

// Determine available AI provider
function getAvailableProvider() {
  // If specific provider is set, try it first
  if (AI_PROVIDER === 'claude' && process.env.ANTHROPIC_API_KEY) {
    return 'claude';
  }
  
  if (AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
    return 'openai';
  }
  
  if (AI_PROVIDER === 'fallback') {
    return 'fallback';
  }
  
  // Auto mode - try available providers
  if (process.env.ANTHROPIC_API_KEY) {
    return 'claude';
  }
  
  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }
  
  return 'fallback';
}

// Get provider status for debugging
export function getProviderStatus() {
  return {
    configured: AI_PROVIDER,
    available: getAvailableProvider(),
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasClaude: !!process.env.ANTHROPIC_API_KEY,
    providers: {
      openai: !!process.env.OPENAI_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY,
      fallback: true
    }
  };
}

// Enhanced localized prompt generation
function getEnhancedLocalizedPrompt(language, context) {
  const { 
    knowledgeContext, 
    hotelContext, 
    attractionContext, 
    clientProfile,
    sentimentAnalysis,
    purchasePrediction,
    personalizedRecommendations
  } = context;
  
  const basePrompts = {
    pl: `Jesteś profesjonalnym agentem biura podróży specjalizującym się w wyjazdach do Dubaju i ZEA.`,
    en: `You are a professional travel agent specializing in trips to Dubai and UAE.`,
    de: `Sie sind ein professioneller Reiseberater, der sich auf Reisen nach Dubai und die VAE spezialisiert hat.`,
    fr: `Vous êtes un agent de voyage professionnel spécialisé dans les voyages à Dubaï et aux EAU.`,
    es: `Eres un agente de viajes profesional especializado en viajes a Dubái y EAU.`,
    it: `Sei un agente di viaggio professionale specializzato in viaggi a Dubai e EAU.`,
    ru: `Вы профессиональный турагент, специализирующийся на поездках в Дубай и ОАЭ.`
  };

  const instructions = {
    pl: `
INSTRUKCJE ODPOWIEDZI:
- Odpowiadaj TYLKO po polsku
- Bądź konkretny i pomocny
- Zawsze podaj ceny w AED i PLN (kurs 1 AED = 1.08 PLN)
- Sugeruj konkretne hotele, atrakcje i restauracje z naszej oferty
- Jeśli nie masz informacji, zaproponuj kontakt telefoniczny
- Na końcu zawsze dodaj zachętę do kontaktu`,
    
    en: `
RESPONSE INSTRUCTIONS:
- Respond ONLY in English
- Be specific and helpful
- Always provide prices in AED and USD (rate 1 AED = 0.27 USD)
- Suggest specific hotels, attractions and restaurants from our offer
- If you don't have information, suggest phone contact
- Always end with encouragement to contact us`,
    
    de: `
ANTWORT-ANWEISUNGEN:
- Antworten Sie NUR auf Deutsch
- Seien Sie spezifisch und hilfreich
- Geben Sie immer Preise in AED und EUR an (Kurs 1 AED = 0.25 EUR)
- Schlagen Sie spezifische Hotels, Attraktionen und Restaurants vor
- Bei fehlenden Informationen schlagen Sie telefonischen Kontakt vor
- Enden Sie immer mit einer Ermutigung zur Kontaktaufnahme`,

    fr: `
INSTRUCTIONS DE RÉPONSE:
- Répondez UNIQUEMENT en français
- Soyez précis et utile
- Fournissez toujours les prix en AED et EUR (taux 1 AED = 0.25 EUR)
- Suggérez des hôtels, attractions et restaurants spécifiques
- Si vous n'avez pas d'informations, proposez un contact téléphonique
- Terminez toujours par un encouragement à nous contacter`,

    es: `
INSTRUCCIONES DE RESPUESTA:
- Responde SOLO en español
- Sé específico y útil
- Proporciona siempre precios en AED y EUR (tipo 1 AED = 0.25 EUR)
- Sugiere hoteles, atracciones y restaurantes específicos
- Si no tienes información, sugiere contacto telefónico
- Termina siempre con ánimo de contactarnos`,

    it: `
ISTRUZIONI DI RISPOSTA:
- Rispondi SOLO in italiano
- Sii specifico e utile
- Fornisci sempre prezzi in AED ed EUR (tasso 1 AED = 0.25 EUR)
- Suggerisci hotel, attrazioni e ristoranti specifici
- Se non hai informazioni, suggerisci contatto telefonico
- Termina sempre con incoraggiamento a contattarci`,

    ru: `
ИНСТРУКЦИИ ПО ОТВЕТУ:
- Отвечайте ТОЛЬКО на русском языке
- Будьте конкретны и полезны
- Всегда указывайте цены в AED и USD (курс 1 AED = 0.27 USD)
- Предлагайте конкретные отели, достопримечательности и рестораны
- Если у вас нет информации, предложите телефонный контакт
- Всегда заканчивайте призывом связаться с нами`
  };

  // Client-specific instructions based on AI analysis
  let clientContext = '';
  if (clientProfile) {
    const returningClient = clientProfile.bookings?.length > 0;
    const loyaltyLevel = clientProfile.loyaltyScore > 0.7 ? 'VIP' : clientProfile.loyaltyScore > 0.3 ? 'returning' : 'new';
    
    clientContext = `
INFORMACJE O KLIENCIE / CLIENT CONTEXT:
- Status: ${returningClient ? 'Powracający klient' : 'Nowy klient'} (${loyaltyLevel})
- Preferencje budżetowe: ${clientProfile.budgetRange || 'nieznane'}
- Styl podróży: ${clientProfile.travelStyle || 'nieznany'}
- Poziom zaangażowania: ${Math.round((clientProfile.engagementScore || 0) * 100)}%
- Wartość: ${Math.round((clientProfile.valueScore || 0) * 100)}%
${returningClient ? '- WAŻNE: To powracający klient - odnieś się do jego wcześniejszych doświadczeń!' : ''}`;
  }

  // Sentiment-based instructions
  let sentimentContext = '';
  if (sentimentAnalysis) {
    const sentiment = sentimentAnalysis.sentiment;
    const emotion = sentimentAnalysis.emotion;
    
    if (sentiment === 'negative' || sentiment === 'frustrated') {
      sentimentContext = `
⚠️ UWAGA SPECJALNA - SENTIMENT ANALYSIS:
- Klient wykazuje negatywne emocje: ${sentiment} / ${emotion}
- PRIORYTET: Bądź szczególnie empatyczny i pomocny
- Zaproponuj bezpośredni kontakt telefoniczny
- Skup się na rozwiązaniu problemów, nie na sprzedaży`;
    } else if (sentiment === 'positive' || emotion === 'excited') {
      sentimentContext = `
✨ POZYTYWNE NASTAWIENIE KLIENTA:
- Klient jest pozytywnie nastawiony: ${sentiment} / ${emotion}
- Możesz być bardziej proaktywny w sugerowaniu dodatkowych opcji
- Skorzystaj z entuzjazmu do prezentacji premium opcji`;
    }
  }

  // Purchase prediction context
  let purchaseContext = '';
  if (purchasePrediction) {
    const probability = Math.round(purchasePrediction.purchaseProbability * 100);
    const timeframe = purchasePrediction.timeToDecision;
    
    if (probability > 80) {
      purchaseContext = `
🎯 WYSOKA PRAWDOPODOBIEŃSTWO ZAKUPU (${probability}%):
- Klient prawdopodobnie kupi w okresie: ${timeframe}
- PRIORYTET: Przekaż konkretną ofertę z cenami
- Zaproponuj szybkie ustalenie szczegółów
- Wspomnij o ograniczonej dostępności dla terminów`;
    } else if (probability > 60) {
      purchaseContext = `
📊 ŚREDNIE ZAINTERESOWANIE ZAKUPEM (${probability}%):
- Potrzebuje więcej informacji przed decyzją
- Skup się na edukacji i budowaniu zaufania
- Zaproponuj bezpłatną wycenę`;
    }
  }

  // Personalized recommendations
  let recommendationsContext = '';
  if (personalizedRecommendations) {
    recommendationsContext = `
🎨 SPERSONALIZOWANE REKOMENDACJE:
${JSON.stringify(personalizedRecommendations, null, 2)}
- Wykorzystaj te rekomendacje w swojej odpowiedzi
- Wyjaśnij dlaczego są dopasowane do klienta`;
  }

  const basePrompt = basePrompts[language] || basePrompts.en;
  const instruction = instructions[language] || instructions.en;
  
  return `${basePrompt}

${instruction}

${clientContext}

${sentimentContext}

${purchaseContext}

${recommendationsContext}

DOSTĘPNE INFORMACJE / AVAILABLE INFORMATION:
${knowledgeContext}

HOTELE W OFERCIE / HOTELS IN OFFER:
${hotelContext}

ATRAKCJE / ATTRACTIONS:
${attractionContext}

ZADANIE:
Odpowiedz na zapytanie klienta w sposób maksymalnie spersonalizowany, wykorzystując wszystkie dostępne informacje o kliencie i analizę AI. Twoja odpowiedź powinna być:
1. Dopasowana do wykrytych emocji i potrzeb
2. Uwzględniająca historię klienta (jeśli istnieje)
3. Zawierająca konkretne rekomendacje i ceny
4. Profesjonalna ale ciepła w tonie
5. Zawierająca konkretny call-to-action`;
}

// Helper functions for knowledge base
async function getRelevantKnowledge(query) {
  try {
    const knowledge = await prisma.knowledgeBase.findMany({
      where: { isActive: true },
      select: { title: true, content: true, category: true }
    });
    
    return knowledge.map(k => `${k.title}: ${k.content}`).join('\n\n');
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return 'Baza wiedzy niedostępna';
  }
}

async function getHotelInfo() {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true },
      select: { name: true, description: true, location: true, priceRange: true, rating: true }
    });
    
    return hotels.map(h => 
      `${h.name} (${h.location}) - ${h.description}. Cena: ${h.priceRange}, Ocena: ${h.rating}/5`
    ).join('\n');
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return 'Informacje o hotelach niedostępne';
  }
}

async function getAttractionInfo() {
  try {
    const attractions = await prisma.attraction.findMany({
      where: { isActive: true },
      select: { name: true, description: true, location: true, priceRange: true, hours: true }
    });
    
    return attractions.map(a => 
      `${a.name} - ${a.description}. Lokalizacja: ${a.location}, Cena: ${a.priceRange}, Godziny: ${a.hours || 'Sprawdź lokalnie'}`
    ).join('\n');
  } catch (error) {
    console.error('Error fetching attractions:', error);
    return 'Informacje o atrakcjach niedostępne';
  }
}

// Fallback responses when AI fails
function getFallbackResponse(language) {
  const fallbacks = {
    pl: `Dziękujemy za Twoje zapytanie dotyczące podróży do Dubaju. 
    
Ze względu na czasowe problemy techniczne, nie mogę w tej chwili udzielić szczegółowej odpowiedzi. 

Prosimy o kontakt telefoniczny pod numerem +48 123 456 789 lub odpowiedź na tego emaila, a nasz zespół pomoże Ci zaplanować idealną podróż do Dubaju.

Pozdrawiam,
Dubai Travel Team`,

    en: `Thank you for your inquiry about traveling to Dubai.

Due to temporary technical issues, I cannot provide a detailed response at the moment.

Please contact us by phone at +48 123 456 789 or reply to this email, and our team will help you plan the perfect trip to Dubai.

Best regards,
Dubai Travel Team`,

    de: `Vielen Dank für Ihre Anfrage bezüglich einer Reise nach Dubai.

Aufgrund temporärer technischer Probleme kann ich momentan keine detaillierte Antwort geben.

Bitte kontaktieren Sie uns telefonisch unter +48 123 456 789 oder antworten Sie auf diese E-Mail, und unser Team wird Ihnen bei der Planung der perfekten Dubai-Reise helfen.

Mit freundlichen Grüßen,
Dubai Travel Team`
  };

  return fallbacks[language] || fallbacks.en;
}

// Localization helper functions
export function getLocalizedTemplate(language) {
  const templates = {
    pl: "Dziękujemy za zainteresowanie podróżą do Dubaju. Oto informacje dotyczące Twojego zapytania:",
    en: "Thank you for your interest in traveling to Dubai. Here is the information regarding your inquiry:",
    de: "Vielen Dank für Ihr Interesse an einer Reise nach Dubai. Hier sind die Informationen zu Ihrer Anfrage:",
    fr: "Merci pour votre intérêt pour un voyage à Dubaï. Voici les informations concernant votre demande:",
    es: "Gracias por su interés en viajar a Dubai. Aquí está la información sobre su consulta:",
    it: "Grazie per il vostro interesse per un viaggio a Dubai. Ecco le informazioni riguardo alla vostra richiesta:",
    ru: "Спасибо за ваш интерес к поездке в Дубай. Вот информация по вашему запросу:"
  };
  
  return templates[language] || templates.en;
}

export function getLocalizedSignature(language, defaultSignature) {
  const signatures = {
    pl: `Pozdrawiam,\nDubai Travel Assistant\n\nBiuro Podróży Dubai Dreams\nTel: +48 123 456 789\nEmail: kontakt@dubaitravel.com`,
    en: `Best regards,\nDubai Travel Assistant\n\nDubai Dreams Travel Agency\nTel: +48 123 456 789\nEmail: contact@dubaitravel.com`,
    de: `Mit freundlichen Grüßen,\nDubai Travel Assistant\n\nReisebüro Dubai Dreams\nTel: +48 123 456 789\nEmail: kontakt@dubaitravel.com`,
    fr: `Cordialement,\nDubai Travel Assistant\n\nAgence de Voyage Dubai Dreams\nTél: +48 123 456 789\nEmail: contact@dubaitravel.com`,
    es: `Saludos cordiales,\nDubai Travel Assistant\n\nAgencia de Viajes Dubai Dreams\nTel: +48 123 456 789\nEmail: contacto@dubaitravel.com`,
    it: `Cordiali saluti,\nDubai Travel Assistant\n\nAgenzia di Viaggi Dubai Dreams\nTel: +48 123 456 789\nEmail: contatto@dubaitravel.com`,
    ru: `С уважением,\nDubai Travel Assistant\n\nТуристическое агентство Dubai Dreams\nТел: +48 123 456 789\nEmail: kontakt@dubaitravel.com`
  };
  
  return signatures[language] || defaultSignature || signatures.en;
}

export function getLocalizedSubject(language, originalSubject) {
  const prefixes = {
    pl: "Re:",
    en: "Re:",
    de: "AW:",
    fr: "Re:",
    es: "Re:",
    it: "Re:",
    ru: "Re:"
  };
  
  const prefix = prefixes[language] || "Re:";
  return `${prefix} ${originalSubject}`;
}