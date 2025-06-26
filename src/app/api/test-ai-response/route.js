import { NextResponse } from 'next/server'
import { generateResponse } from '@/lib/ai'

export async function POST() {
  try {
    console.log('🔍 Testowanie funkcji generateResponse...')
    
    const testContent = 'Dzień dobry, chciałbym zapytać o dostępność hoteli w Dubaju na sierpień. Interesuje mnie coś w okolicy Burj Khalifa. Proszę o informacje o cenach i dostępności. Pozdrawiam, Jan Kowalski'
    
    const aiContext = {
      clientProfile: null,
      sentimentAnalysis: 'neutral',
      purchasePrediction: 0.3,
      personalizedRecommendations: []
    }
    
    console.log('📝 Generowanie odpowiedzi dla tekstu:', testContent.substring(0, 50) + '...')
    
    const result = await generateResponse(testContent, aiContext)
    
    console.log('🤖 Wynik:', {
      hasResponse: !!result.response,
      language: result.detectedLanguage,
      fallback: result.fallback,
      responseLength: result.response ? result.response.length : 0
    })
    
    return NextResponse.json({
      success: true,
      result: {
        hasResponse: !!result.response,
        language: result.detectedLanguage,
        fallback: result.fallback || false,
        responseLength: result.response ? result.response.length : 0,
        responsePreview: result.response ? result.response.substring(0, 200) + '...' : null
      }
    })
    
  } catch (error) {
    console.error('❌ Błąd testowania AI:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
} 