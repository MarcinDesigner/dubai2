import Anthropic from '@anthropic-ai/sdk';
import prisma from './prisma';
import { detectLanguageFallback, generateResponseFallback, categorizeEmailFallback } from './ai-fallback';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Language detection with Claude
export async function detectLanguageClaude(text) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022", // Najszybszy model dla prostych zadań
      max_tokens: 10,
      messages: [{
        role: "user",
        content: `Detect the language of the following text. Return only the language code: 
        - "pl" for Polish
        - "en" for English  
        - "de" for German
        - "fr" for French
        - "es" for Spanish
        - "it" for Italian
        - "ru" for Russian
        - "other" for any other language
        
        Text: "${text.substring(0, 500)}"`
      }]
    });

    return message.content[0].text.trim().toLowerCase();
  } catch (error) {
    console.error('❌ Claude language detection error:', error);
    return detectLanguageFallback(text);
  }
}

// Generate response with Claude using knowledge base
export async function generateResponseClaude(emailContent, language = 'pl', senderInfo = {}) {
  try {
    // Pobierz wszystkie aktywne wpisy z bazy wiedzy
    const knowledgeBase = await getRelevantKnowledge(emailContent);
    
    // Stwórz kontekst z bazy wiedzy
    let knowledgeContext = '';
    let hasRelevantKnowledge = false;
    
    if (knowledgeBase.length > 0) {
      // Sprawdź czy wpisy z bazy wiedzy rzeczywiście pasują do pytania
      const emailLower = emailContent.toLowerCase();
      const relevantEntries = knowledgeBase.filter(item => {
        const searchText = `${item.title} ${item.content} ${item.category}`.toLowerCase();
        const keywords = emailLower.split(' ').filter(word => word.length > 2);
        return keywords.some(keyword => searchText.includes(keyword));
      });
      
      if (relevantEntries.length > 0) {
        knowledgeContext = `
TWOJA BAZA WIEDZY - UŻYWAJ TYLKO TYCH INFORMACJI:

${relevantEntries.map(item => `
${item.title.toUpperCase()}:
${item.content}
Kategoria: ${item.category}
${item.tags ? `Tagi: ${JSON.parse(item.tags).join(', ')}` : ''}
`).join('\n---\n')}

WAŻNE: Używaj TYLKO informacji z powyższej bazy wiedzy. NIE WYMYŚLAJ własnych cen, hoteli ani ofert!`;
        hasRelevantKnowledge = true;
      } else {
        // Wszystkie wpisy z bazy wiedzy dla kontekstu, ale oznacz jako niepassujące
        knowledgeContext = `
TWOJA BAZA WIEDZY (dostępne oferty, ale niekoniecznie pasujące do pytania):

${knowledgeBase.map(item => `
${item.title.toUpperCase()}:
${item.content}
Kategoria: ${item.category}
${item.tags ? `Tagi: ${JSON.parse(item.tags).join(', ')}` : ''}
`).join('\n---\n')}

WAŻNE: Klient pyta o coś czego nie masz w bazie wiedzy. Przyznaj się do braku informacji i zaproponuj sprawdzenie.`;
        hasRelevantKnowledge = false;
      }
    }
    
    // Jeśli brak odpowiednich informacji, zapisz do kolejki uczenia
    if (!hasRelevantKnowledge) {
      try {
        console.log(`📚 Zapisuję pytanie do learning queue: ${emailContent.substring(0, 50)}...`);
        await saveLearningQuestion(emailContent, senderInfo.email || 'unknown', language);
      } catch (error) {
        console.error('❌ Błąd zapisywania do learning queue:', error);
      }
    }

    const languageNames = {
      'pl': 'Polish',
      'en': 'English', 
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'ru': 'Russian'
    };

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `You are a professional travel agent specializing in Dubai trips. 

${knowledgeContext}

CUSTOMER EMAIL:
"${emailContent}"

INSTRUCTIONS:
- Respond ONLY in ${languageNames[language] || 'Polish'} language
- Use ONLY the information from YOUR KNOWLEDGE BASE above
- If the customer asks about something not in your knowledge base, politely say you'll check and get back to them
- DO NOT invent prices, hotels, or offers that are not in your knowledge base
- Be helpful and professional
- Include relevant information from your knowledge base that matches the customer's inquiry
- End with contact information and encouragement to call or email for more details
- Keep response around 800-1200 characters
- Sign as: "Marcin - Dubai Travel Expert, Dubai Travel Experts"

If you don't have specific information in your knowledge base, say something like:
- Polish: "Sprawdzę szczegóły tej oferty i skontaktuję się z Państwem"
- English: "I'll check the details of this offer and get back to you"
- German: "Ich werde die Details dieses Angebots prüfen und mich bei Ihnen melden"`
      }]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('❌ Claude response generation error:', error);
    return generateResponseFallback(emailContent, language, senderInfo);
  }
}

// Categorize email with Claude
export async function categorizeEmailClaude(emailContent, subject = '') {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022", // Szybki model dla kategoryzacji
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Analyze this travel inquiry email and return a JSON response:

        Subject: "${subject}"
        Content: "${emailContent}"

        Return JSON with:
        {
          "category": "hotels|attractions|general|booking|complaint|info_request",
          "urgency": "low|medium|high",
          "sentiment": "positive|neutral|negative", 
          "hasSpecificDates": true/false,
          "priceRange": "budget|mid-range|luxury|not_specified",
          "topics": ["array", "of", "relevant", "topics"],
          "purchaseProbability": 0.1-1.0,
          "requiresHumanReview": true/false
        }`
      }]
    });

    try {
      const responseText = message.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('❌ Claude JSON parsing error:', parseError);
    }
    
    return categorizeEmailFallback(emailContent, subject);
  } catch (error) {
    console.error('❌ Claude categorization error:', error);
    return categorizeEmailFallback(emailContent, subject);
  }
}

// Test Claude API connection
export async function testClaudeConnection() {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 50,
      messages: [{
        role: "user",
        content: "Say 'Claude API is working!' in Polish"
      }]
    });

    return {
      success: true,
      response: message.content[0].text,
      model: "claude-3-5-haiku-20241022"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      model: "claude-3-5-haiku-20241022"
    };
  }
}

// Enhanced localized prompt generation for Claude
function getEnhancedLocalizedPromptClaude(language, context) {
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
- Na końcu zawsze dodaj zachętę do kontaktu
- Używaj profesjonalnego ale przyjaznego tonu`,
    
    en: `
RESPONSE INSTRUCTIONS:
- Respond ONLY in English
- Be specific and helpful
- Always provide prices in AED and USD (rate 1 AED = 0.27 USD)
- Suggest specific hotels, attractions and restaurants from our offer
- If you don't have information, suggest phone contact
- Always end with encouragement to contact us
- Use professional but friendly tone`,
    
    de: `
ANTWORT-ANWEISUNGEN:
- Antworten Sie NUR auf Deutsch
- Seien Sie spezifisch und hilfreich
- Geben Sie immer Preise in AED und EUR an (Kurs 1 AED = 0.25 EUR)
- Schlagen Sie spezifische Hotels, Attraktionen und Restaurants vor
- Bei fehlenden Informationen schlagen Sie telefonischen Kontakt vor
- Enden Sie immer mit einer Ermutigung zur Kontaktaufnahme
- Verwenden Sie einen professionellen aber freundlichen Ton`
  };

  const basePrompt = basePrompts[language] || basePrompts.en;
  const instruction = instructions[language] || instructions.en;
  
  let contextInfo = '';
  
  // Add knowledge context
  if (knowledgeContext && knowledgeContext.length > 0) {
    contextInfo += `\nBaza wiedzy:\n${knowledgeContext.map(k => `- ${k.title}: ${k.content.substring(0, 200)}...`).join('\n')}`;
  }
  
  // Add hotel context
  if (hotelContext && hotelContext.length > 0) {
    contextInfo += `\nDostępne hotele:\n${hotelContext.map(h => `- ${h.name} (${h.stars}*): ${h.description} - od ${h.pricePerNight} AED/noc`).join('\n')}`;
  }
  
  // Add attraction context
  if (attractionContext && attractionContext.length > 0) {
    contextInfo += `\nAtrakcje:\n${attractionContext.map(a => `- ${a.name}: ${a.description} - ${a.price} AED`).join('\n')}`;
  }
  
  // Add client profile if available
  if (clientProfile) {
    contextInfo += `\nProfil klienta: ${JSON.stringify(clientProfile)}`;
  }
  
  // Add sentiment analysis
  if (sentimentAnalysis) {
    contextInfo += `\nAnaliza sentymentu: ${sentimentAnalysis}`;
  }
  
  // Add purchase prediction
  if (purchasePrediction) {
    contextInfo += `\nPrawdopodobieństwo zakupu: ${purchasePrediction}%`;
  }
  
  // Add personalized recommendations
  if (personalizedRecommendations && personalizedRecommendations.length > 0) {
    contextInfo += `\nSpersonalizowane rekomendacje: ${personalizedRecommendations.join(', ')}`;
  }

  return `${basePrompt}

${instruction}

${contextInfo}

WAŻNE: Zawsze odpowiadaj w języku ${language}. Jeśli klient pyta o konkretne informacje których nie masz, zaproponuj kontakt telefoniczny lub osobisty.`;
}

// Helper functions (same as in ai.js)
async function getRelevantKnowledge(query) {
  try {
    // Najpierw spróbuj znaleźć wszystkie aktywne wpisy
    const allKnowledge = await prisma.knowledgeBase.findMany({
      where: {
        isActive: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`📚 Znaleziono ${allKnowledge.length} wpisów w bazie wiedzy`);

    // Jeśli mamy wpisy, zwróć wszystkie (lub przefiltrowane)
    if (allKnowledge.length > 0) {
      // Możesz dodać prostą filtrację po słowach kluczowych
      const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
      
      if (keywords.length > 0) {
        const filtered = allKnowledge.filter(item => {
          const searchText = `${item.title} ${item.content} ${item.category}`.toLowerCase();
          return keywords.some(keyword => searchText.includes(keyword));
        });
        
        // Jeśli znaleziono pasujące, zwróć je, w przeciwnym razie zwróć wszystkie
        return filtered.length > 0 ? filtered : allKnowledge;
      }
      
      return allKnowledge;
    }

    console.log('⚠️ Brak wpisów w bazie wiedzy');
    return [];
  } catch (error) {
    console.error('❌ Błąd pobierania bazy wiedzy:', error);
    return [];
  }
}

async function getHotelInfo() {
  // Mock hotel data - in real app this would come from database
  return [
    {
      name: "Burj Al Arab Jumeirah",
      stars: 7,
      description: "Luksusowy hotel w kształcie żagla",
      pricePerNight: 2500,
      location: "Jumeirah Beach"
    },
    {
      name: "Atlantis The Palm",
      stars: 5,
      description: "Resort na sztucznej wyspie Palm Jumeirah",
      pricePerNight: 800,
      location: "Palm Jumeirah"
    },
    {
      name: "Dubai Marina Hotel",
      stars: 4,
      description: "Nowoczesny hotel w dzielnicy Marina",
      pricePerNight: 300,
      location: "Dubai Marina"
    }
  ];
}

async function getAttractionInfo() {
  // Mock attraction data
  return [
    {
      name: "Burj Khalifa",
      description: "Najwyższy budynek świata z platformą widokową",
      price: 149,
      category: "architecture"
    },
    {
      name: "Dubai Mall",
      description: "Jedno z największych centrów handlowych świata",
      price: 0,
      category: "shopping"
    },
    {
      name: "Desert Safari",
      description: "Wycieczka na pustynię z kolacją i pokazami",
      price: 250,
      category: "adventure"
    }
  ];
}

// Funkcja do zapisywania pytań bez odpowiedzi do kolejki uczenia
async function saveLearningQuestion(question, customerEmail, language = 'pl') {
  try {
    // Kategoryzuj pytanie
    const category = await categorizeEmailClaude(question);
    
    // Wyciągnij słowa kluczowe
    const keywords = extractKeywords(question);
    
    // Zapisz do bazy
    const learningEntry = await prisma.learningQueue.create({
      data: {
        customerEmail,
        question,
        category: category.category || 'unknown',
        language,
        keywords: JSON.stringify(keywords),
        context: JSON.stringify({
          sentiment: category.sentiment,
          urgency: category.urgency,
          topics: category.topics,
          hasSpecificDates: category.hasSpecificDates,
          priceRange: category.priceRange
        }),
        status: 'pending',
        priority: determineLearningPriority(question, keywords, category),
        createdAt: new Date()
      }
    });

    console.log(`📚 Dodano do kolejki uczenia: ${question.substring(0, 50)}... (ID: ${learningEntry.id})`);
    return learningEntry;
  } catch (error) {
    console.error('❌ Błąd zapisywania pytania do learning queue:', error);
    throw error;
  }
}

// Funkcja do wyciągania słów kluczowych z pytania
function extractKeywords(text) {
  const commonWords = ['i', 'a', 'o', 'w', 'z', 'na', 'do', 'czy', 'jak', 'co', 'gdzie', 'kiedy', 'ile', 'and', 'or', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10); // Maksymalnie 10 słów kluczowych
}

// Funkcja do określania priorytetu pytania
function determineLearningPriority(question, keywords, category) {
  const highPriorityKeywords = ['cena', 'koszt', 'ile', 'price', 'cost', 'hotel', 'rezerwacja', 'booking', 'urgent', 'pilne'];
  const mediumPriorityKeywords = ['informacja', 'info', 'details', 'szczegóły', 'dostępność', 'availability'];
  
  const questionLower = question.toLowerCase();
  
  // Wysoki priorytet
  if (category.urgency === 'high' || 
      category.purchaseProbability > 0.7 ||
      highPriorityKeywords.some(keyword => questionLower.includes(keyword))) {
    return 'high';
  }
  
  // Średni priorytet
  if (category.urgency === 'medium' || 
      category.purchaseProbability > 0.4 ||
      mediumPriorityKeywords.some(keyword => questionLower.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
} 