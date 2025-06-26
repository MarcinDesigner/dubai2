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

// Generate response with Claude
export async function generateResponseClaude(emailContent, language = 'pl', senderInfo = {}) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Najlepszy model dla generowania odpowiedzi
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `You are a professional travel agent specializing in Dubai trips. 
        
        Respond to this customer inquiry in ${language === 'pl' ? 'Polish' : language === 'en' ? 'English' : 'German'} language:
        
        "${emailContent}"
        
        Provide a helpful, professional response with:
        - Hotel recommendations with approximate prices in local currency
        - Popular attractions and activities
        - Weather information if dates mentioned
        - Practical travel tips
        - Contact information for follow-up
        
        Keep the response warm, professional, and around 800-1200 characters.
        Include relevant emojis to make it engaging.
        
        Sign as: "Marcin - Dubai Travel Expert, Dubai Travel Experts"`
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
    const knowledge = await prisma.knowledge_base.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query.substring(0, 50) } },
          { content: { contains: query.substring(0, 50) } },
          { tags: { contains: 'dubai' } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    });
    return knowledge;
  } catch (error) {
    console.error('Error fetching knowledge:', error);
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