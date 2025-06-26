import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST() {
  try {
    console.log('🔍 Testowanie konfiguracji SMTP...')
    
    const testEmail = {
      to: process.env.HUMAN_AGENT_EMAIL || 'marcin@deximlabs.com',
      subject: 'Test SMTP - Dubai Travel Agent',
      textContent: 'To jest testowy email z aplikacji Dubai Travel Agent. Jeśli otrzymałeś ten email, konfiguracja SMTP działa poprawnie.',
      htmlContent: '<p>To jest <strong>testowy email</strong> z aplikacji Dubai Travel Agent.</p><p>Jeśli otrzymałeś ten email, konfiguracja SMTP działa poprawnie.</p>'
    }
    
    console.log('📧 Wysyłanie testowego emaila do:', testEmail.to)
    
    await sendEmail(testEmail)
    
    return NextResponse.json({
      success: true,
      message: 'Email testowy został wysłany pomyślnie',
      recipient: testEmail.to
    })
    
  } catch (error) {
    console.error('❌ Błąd wysyłania emaila:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Sprawdź konfigurację SMTP w .env.local'
    })
  }
} 