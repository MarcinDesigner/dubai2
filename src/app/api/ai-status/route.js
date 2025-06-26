import { NextResponse } from 'next/server';
import { getProviderStatus } from '@/lib/ai';

export async function GET() {
  try {
    const status = getProviderStatus();
    
    const apiStatus = {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? 
        `Skonfigurowany (${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...)` : 
        'Nie skonfigurowany',
      AI_PROVIDER: process.env.AI_PROVIDER || 'claude (default)'
    };

    // Recommendations based on configuration
    const recommendations = [];
    
    if (!status.hasClaude) {
      recommendations.push('⚠️ Brak ANTHROPIC_API_KEY - aplikacja będzie używać fallback responses');
    }

    if (status.hasClaude) {
      recommendations.push('✅ Claude API skonfigurowane poprawnie');
    }

    const testEndpoints = {
      claude: '/api/test-claude'
    };

    return NextResponse.json({
      status: 'success',
      provider: status,
      apiKeys: apiStatus,
      recommendations,
      testEndpoints,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking AI status:', error);
    return NextResponse.json(
      { error: 'Błąd sprawdzania statusu AI', details: error.message },
      { status: 500 }
    );
  }
} 