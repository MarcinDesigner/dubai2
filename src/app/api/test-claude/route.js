import { NextResponse } from 'next/server';
import { generateResponseClaude, detectLanguageClaude, categorizeEmailClaude } from '@/lib/ai-claude';

export async function GET() {
  try {
    console.log('🧪 Testowanie Claude API...');
    
    // Check if Claude API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'ANTHROPIC_API_KEY nie jest skonfigurowany',
        provider: 'claude'
      }, { status: 400 });
    }

    // Test email content
    const testEmail = `
    Dzień dobry,
    
    Planuję wyjazd do Dubaju w grudniu z rodziną (2 dorosłych + 2 dzieci).
    Interesują mnie hotele 4-5 gwiazdek z basenem i blisko atrakcji.
    Budżet około 5000 PLN na 7 dni.
    
    Proszę o propozycje hoteli i atrakcji dla dzieci.
    
    Pozdrawiam,
    Anna Kowalska
    `;

    console.log('🔍 Wykrywanie języka...');
    const detectedLanguage = await detectLanguageClaude(testEmail);
    console.log(`Wykryty język: ${detectedLanguage}`);

    console.log('📝 Kategoryzacja emaila...');
    const categorization = await categorizeEmailClaude(testEmail);
    console.log('Kategoryzacja:', categorization);

    console.log('🤖 Generowanie odpowiedzi...');
    const response = await generateResponseClaude(testEmail);
    console.log(`Odpowiedź wygenerowana: ${response.response.length} znaków`);

    return NextResponse.json({
      success: true,
      provider: 'claude',
      tests: {
        languageDetection: {
          success: true,
          detected: detectedLanguage,
          expected: 'pl'
        },
        categorization: {
          success: true,
          result: categorization
        },
        responseGeneration: {
          success: true,
          responseLength: response.response.length,
          detectedLanguage: response.detectedLanguage,
          provider: response.provider,
          preview: response.response.substring(0, 200) + '...'
        }
      },
      fullResponse: response
    });

  } catch (error) {
    console.error('❌ Błąd testowania Claude:', error);
    
    return NextResponse.json({
      success: false,
      provider: 'claude',
      error: error.message,
      details: {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3)
      }
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { email, testType = 'all' } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email content is required'
      }, { status: 400 });
    }

    console.log(`🧪 Testowanie Claude API - ${testType}...`);
    
    const results = {};

    if (testType === 'all' || testType === 'language') {
      console.log('🔍 Wykrywanie języka...');
      results.languageDetection = await detectLanguageClaude(email);
    }

    if (testType === 'all' || testType === 'categorize') {
      console.log('📝 Kategoryzacja emaila...');
      results.categorization = await categorizeEmailClaude(email);
    }

    if (testType === 'all' || testType === 'response') {
      console.log('🤖 Generowanie odpowiedzi...');
      results.responseGeneration = await generateResponseClaude(email);
    }

    return NextResponse.json({
      success: true,
      provider: 'claude',
      testType,
      results
    });

  } catch (error) {
    console.error('❌ Błąd testowania Claude:', error);
    
    return NextResponse.json({
      success: false,
      provider: 'claude',
      error: error.message,
      details: {
        name: error.name,
        message: error.message
      }
    }, { status: 500 });
  }
} 