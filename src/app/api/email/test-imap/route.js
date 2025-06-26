import { NextResponse } from 'next/server'
import IMAPEmailService from '@/lib/email-imap'

export async function GET() {
  try {
    console.log('🧪 Testowanie konfiguracji IMAP...')
    
    // Sprawdź zmienne środowiskowe
    const config = {
      IMAP_HOST: process.env.IMAP_HOST || 'BRAK',
      IMAP_PORT: process.env.IMAP_PORT || '993',
      IMAP_USER: process.env.IMAP_USER || process.env.SMTP_USER || 'BRAK',
      IMAP_PASS: process.env.IMAP_PASS || process.env.SMTP_PASS ? '***USTAWIONE***' : 'BRAK'
    }
    
    console.log('📋 Konfiguracja IMAP:', config)
    
    // Sprawdź czy wszystkie wymagane zmienne są ustawione
    const required = ['IMAP_HOST', 'IMAP_USER', 'IMAP_PASS']
    const missing = []
    
    if (!process.env.IMAP_HOST) missing.push('IMAP_HOST')
    if (!process.env.IMAP_USER && !process.env.SMTP_USER) missing.push('IMAP_USER/SMTP_USER')
    if (!process.env.IMAP_PASS && !process.env.SMTP_PASS) missing.push('IMAP_PASS/SMTP_PASS')
    
    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Brak wymaganych zmiennych środowiskowych: ${missing.join(', ')}`,
        config,
        instructions: {
          message: 'Dodaj do .env.local:',
          variables: {
            'IMAP_HOST': 'np. imap.zenbox.pl',
            'IMAP_PORT': 'np. 993 (domyślnie)',
            'IMAP_USER': 'twój email (lub użyj SMTP_USER)',
            'IMAP_PASS': 'hasło do emaila (lub użyj SMTP_PASS)'
          }
        }
      }, { status: 400 })
    }
    
    // Test połączenia
    const imapService = new IMAPEmailService()
    
    console.log('🔌 Próba połączenia z serwerem IMAP...')
    await imapService.testConnection()
    
    console.log('✅ Test połączenia IMAP zakończony sukcesem')
    
    return NextResponse.json({
      success: true,
      message: 'Połączenie IMAP działa poprawnie',
      config: {
        host: config.IMAP_HOST,
        port: config.IMAP_PORT,
        user: config.IMAP_USER,
        secure: true
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Błąd testu IMAP:', error)
    
    let errorDetails = error.message
    let suggestions = []
    
    // Analiza błędów i sugestie
    if (error.message.includes('ENOTFOUND')) {
      suggestions.push('Sprawdź czy IMAP_HOST jest poprawny')
      suggestions.push('Sprawdź połączenie internetowe')
    } else if (error.message.includes('authentication')) {
      suggestions.push('Sprawdź IMAP_USER i IMAP_PASS')
      suggestions.push('Upewnij się, że konto email ma włączony dostęp IMAP')
    } else if (error.message.includes('timeout')) {
      suggestions.push('Sprawdź czy port 993 nie jest blokowany przez firewall')
      suggestions.push('Spróbuj z innym portem (143 dla niezabezpieczonego)')
    }
    
    return NextResponse.json({
      success: false,
      error: 'Test połączenia IMAP nieudany',
      details: errorDetails,
      suggestions,
      config: {
        host: process.env.IMAP_HOST || 'BRAK',
        port: process.env.IMAP_PORT || '993',
        user: process.env.IMAP_USER || process.env.SMTP_USER || 'BRAK'
      }
    }, { status: 500 })
  }
} 