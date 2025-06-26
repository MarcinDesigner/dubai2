import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET() {
  try {
    console.log('🧪 Testowanie prawdziwego Claude API...');
    
    // Check if Claude API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'ANTHROPIC_API_KEY nie jest skonfigurowany',
        provider: 'claude'
      }, { status: 400 });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Test 1: Simple language detection
    console.log('Test 1: Wykrywanie języka...');
    const languageTest = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 10,
      messages: [{
        role: "user",
        content: `Detect the language of the following text. Return only the language code (pl, en, de, fr, es, it, ru, or other):

        "Dzień dobry, chciałbym zapytać o hotele w Dubaju na sierpień."`
      }]
    });

    const detectedLanguage = languageTest.content[0].text.trim().toLowerCase();
    console.log('Wykryty język:', detectedLanguage);

    // Test 2: Generate response for Dubai travel inquiry
    console.log('Test 2: Generowanie odpowiedzi...');
    const responseTest = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a professional travel agent specializing in Dubai trips. 
        
        Respond to this customer inquiry in Polish (the same language as the inquiry):
        
        "Dzień dobry, planuję wyjazd do Dubaju w grudniu z rodziną (2 dorosłych + 2 dzieci). Interesują mnie hotele 4-5 gwiazdek z basenem i blisko atrakcji. Budżet około 15000 PLN na 7 dni. Proszę o propozycje hoteli i atrakcji dla dzieci."
        
        Provide a helpful, professional response with:
        - Hotel recommendations with approximate prices
        - Family-friendly attractions
        - Weather information for December
        - Practical tips
        
        Keep the response warm and professional, around 800-1000 characters.`
      }]
    });

    const generatedResponse = responseTest.content[0].text;
    console.log('Wygenerowana odpowiedź:', generatedResponse.substring(0, 200) + '...');

    // Test 3: Email categorization
    console.log('Test 3: Kategoryzacja emaila...');
    const categorizationTest = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `Categorize this travel inquiry and return JSON:

        Email: "Dzień dobry, planuję wyjazd do Dubaju w grudniu z rodziną (2 dorosłych + 2 dzieci). Interesują mnie hotele 4-5 gwiazdek z basenem i blisko atrakcji. Budżet około 15000 PLN na 7 dni."

        Return JSON with:
        {
          "category": "hotels|attractions|general|booking|complaint",
          "urgency": "low|medium|high",
          "sentiment": "positive|neutral|negative",
          "hasSpecificDates": true/false,
          "priceRange": "budget|mid-range|luxury",
          "topics": ["array", "of", "topics"]
        }`
      }]
    });

    let categorization;
    try {
      const categorizationText = categorizationTest.content[0].text;
      // Extract JSON from response
      const jsonMatch = categorizationText.match(/\{[\s\S]*\}/);
      categorization = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      categorization = { error: 'Failed to parse JSON', raw: categorizationTest.content[0].text };
    }

    // Summary
    const summary = {
      success: true,
      provider: 'claude-real',
      apiKey: process.env.ANTHROPIC_API_KEY.substring(0, 20) + '...',
      tests: {
        languageDetection: {
          success: true,
          input: 'Polish travel inquiry',
          detected: detectedLanguage,
          expected: 'pl',
          correct: detectedLanguage === 'pl'
        },
        responseGeneration: {
          success: true,
          responseLength: generatedResponse.length,
          preview: generatedResponse.substring(0, 200) + '...',
          fullResponse: generatedResponse
        },
        categorization: {
          success: categorization !== null,
          result: categorization
        }
      },
      timestamp: new Date().toISOString(),
      models_used: {
        language: "claude-3-5-haiku-20241022",
        response: "claude-3-5-sonnet-20241022",
        categorization: "claude-3-5-haiku-20241022"
      }
    };

    console.log('✅ Wszystkie testy Claude API zakończone pomyślnie!');
    
    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ Błąd testowania Claude API:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      provider: 'claude-real',
      details: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
} 