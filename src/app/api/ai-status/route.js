import { NextResponse } from 'next/server';
import { getProviderStatus } from '@/lib/ai';

export async function GET() {
  try {
    console.log('🔍 Sprawdzanie statusu providerów AI...');
    
    const status = getProviderStatus();
    
    // Additional checks
    const envStatus = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 
        `Skonfigurowany (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : 
        'Brak',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? 
        `Skonfigurowany (${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...)` : 
        'Brak',
      AI_PROVIDER: process.env.AI_PROVIDER || 'auto'
    };

    const recommendations = [];
    
    if (!status.hasOpenAI && !status.hasClaude) {
      recommendations.push('⚠️ Brak konfiguracji API - używany będzie tylko fallback');
    }
    
    if (status.hasOpenAI && !status.hasClaude) {
      recommendations.push('💡 Rozważ dodanie ANTHROPIC_API_KEY dla większej niezawodności');
    }
    
    if (!status.hasOpenAI && status.hasClaude) {
      recommendations.push('💡 Rozważ dodanie OPENAI_API_KEY dla większej funkcjonalności');
    }
    
    if (status.hasOpenAI && status.hasClaude) {
      recommendations.push('✅ Masz oba providery - system automatycznie wybierze najlepszy');
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      status,
      environment: envStatus,
      recommendations,
      availableEndpoints: {
        openai: '/api/test-openai',
        claude: '/api/test-claude',
        fallback: '/api/test-ai-response',
        mixed: '/api/email/fetch'
      }
    });

  } catch (error) {
    console.error('❌ Błąd sprawdzania statusu:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 