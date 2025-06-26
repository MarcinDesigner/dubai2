import { prisma } from './prisma';
import { detectLanguageFallback, generateResponseFallback, categorizeEmailFallback } from './ai-fallback';
import { detectLanguageClaude, generateResponseClaude, categorizeEmailClaude } from './ai-claude';

// AI Provider selection - only Claude and fallback
const AI_PROVIDER = process.env.AI_PROVIDER || 'claude'; // 'claude', 'fallback'

// Language detection with Claude or fallback
export async function detectLanguage(text) {
  const provider = getAvailableProvider();
  
  switch (provider) {
    case 'claude':
      return await detectLanguageClaude(text);
    default:
      return detectLanguageFallback(text);
  }
}

// Enhanced generateResponse with Claude only
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

// Email categorization with Claude only
export async function categorizeEmail(emailContent) {
  const provider = getAvailableProvider();
  
  switch (provider) {
    case 'claude':
      return await categorizeEmailClaude(emailContent);
    default:
      return categorizeEmailFallback(emailContent);
  }
}

function getAvailableProvider() {
  // If specific provider is set, try it first
  if (AI_PROVIDER === 'claude' && process.env.ANTHROPIC_API_KEY) {
    return 'claude';
  }
  
  if (AI_PROVIDER === 'fallback') {
    return 'fallback';
  }
  
  // Auto mode - try Claude first, then fallback
  if (process.env.ANTHROPIC_API_KEY) {
    return 'claude';
  }
  
  return 'fallback';
}

// Get provider status for debugging
export function getProviderStatus() {
  return {
    configured: AI_PROVIDER,
    available: getAvailableProvider(),
    hasClaude: !!process.env.ANTHROPIC_API_KEY,
    providers: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      fallback: true
    }
  };
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
    pl: "Re: ",
    en: "Re: ",
    de: "AW: ",
    fr: "Rép: ",
    es: "Re: ",
    it: "R: ",
    ru: "Отв: "
  };
  
  const prefix = prefixes[language] || prefixes.en;
  return originalSubject.startsWith(prefix) ? originalSubject : `${prefix}${originalSubject}`;
}