import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    console.log('🔍 Testowanie połączenia z OpenAI...')
    
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Brak klucza API OpenAI'
      })
    }
    
    console.log('🔑 Klucz API:', apiKey.substring(0, 20) + '...')
    
    const openai = new OpenAI({
      apiKey: apiKey,
    })
    
    // Test prostego zapytania
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Odpowiedz krótko: Jak się masz?" }
      ],
      max_tokens: 50,
      temperature: 0.1
    })
    
    return NextResponse.json({
      success: true,
      message: 'Połączenie z OpenAI działa',
      response: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage
    })
    
  } catch (error) {
    console.error('❌ Błąd OpenAI:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.constructor.name
    })
  }
} 