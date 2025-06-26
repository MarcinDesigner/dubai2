import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { detectLanguage, generateResponse, categorizeEmail } from '@/lib/ai'
import { sendEmail } from '@/lib/email'
import IMAPEmailService from '@/lib/email-imap'

export async function POST(request) {
  console.log('\n🚀 === ROZPOCZĘCIE POBIERANIA EMAILI ===')
  console.log('🕐 Czas:', new Date().toISOString())
  
  try {
    // Sprawdź zmienne środowiskowe
    console.log('🔧 Sprawdzanie konfiguracji:')
    console.log('   IMAP_HOST:', process.env.IMAP_HOST || 'BRAK')
    console.log('   IMAP_USER:', process.env.IMAP_USER || process.env.SMTP_USER || 'BRAK')
    console.log('   IMAP_PASS:', process.env.IMAP_PASS ? '***' : 'BRAK')
    console.log('   DATABASE_URL:', process.env.DATABASE_URL || 'BRAK')

    if (!process.env.IMAP_HOST || !process.env.IMAP_USER || !process.env.IMAP_PASS) {
      throw new Error('Brak konfiguracji IMAP. Sprawdź zmienne środowiskowe.')
    }

    console.log('📧 Inicjalizacja IMAP Service...')
    const imapService = new IMAPEmailService()
    
    console.log('📥 Pobieranie emaili z IMAP...')
    const emails = await imapService.connectAndFetchEmails()
    console.log(`📧 Znaleziono ${emails.length} emaili`)
    
    if (emails.length === 0) {
      console.log('📭 Brak emaili - kończę przetwarzanie')
      return NextResponse.json({
        success: true,
        message: 'Brak nowych emaili do przetworzenia',
        emails: []
      })
    }
    
    const processedEmails = []
    
    for (const emailData of emails) {
      try {
        console.log(`\n🔄 Przetwarzanie: "${emailData.subject}" od ${emailData.from}`)
        
        // Sprawdź czy email już istnieje w bazie
        const existingEmail = await prisma.email.findUnique({
          where: { messageId: emailData.messageId }
        })
        
        if (existingEmail) {
          console.log(`⏭️ Email ${emailData.messageId} już istnieje, pomijam`)
          continue
        }
        
        // Zapisz email do bazy
        const savedEmail = await prisma.email.create({
          data: {
            messageId: emailData.messageId,
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            content: emailData.content,
            processed: false,
            responded: false,
            status: 'new',
            createdAt: emailData.date
          }
        })
        
        console.log(`💾 Zapisano email: ${savedEmail.subject}`)
        
        // Przetwórz email przez AI
        console.log('🧠 Analizowanie przez AI...')
        const language = await detectLanguage(emailData.content)
        const category = await categorizeEmail(emailData.content, emailData.subject)
        
        console.log(`🔍 Wykryty język: ${language}`)
        console.log(`📊 Kategoria: ${category.category}, Sentiment: ${category.sentiment}`)
        
        // Generuj odpowiedź AI
        const aiResponse = await generateResponse(emailData.content, {
          clientProfile: null,
          sentimentAnalysis: category.sentiment,
          purchasePrediction: 0.3,
          personalizedRecommendations: []
        })
        
        // Utwórz konwersację
        const conversation = await prisma.conversation.create({
          data: {
            emailId: savedEmail.id,
            clientEmail: emailData.from,
            topic: emailData.subject,
            summary: `Email od ${emailData.from}: ${emailData.subject}`,
            language: aiResponse.detectedLanguage || language,
            sentiment: category.sentiment || 'neutral',
            priority: category.urgency === 'high' ? 'high' : category.urgency === 'low' ? 'low' : 'medium',
            escalated: false,
            purchaseProbability: category.priceRange === 'luxury' ? 0.8 : category.priceRange === 'budget' ? 0.3 : 0.5,
            status: 'active'
          }
        })
        
        console.log(`📝 Utworzono konwersację ID: ${conversation.id}`)
        
        // Wyślij odpowiedź emailem
        if (aiResponse.response) {
          console.log('🤖 Odpowiedź AI wygenerowana:', aiResponse.response.length, 'znaków')
          console.log('📤 Próba wysłania odpowiedzi do:', emailData.from)
          
          // Najpierw zapisz odpowiedź do bazy
          await prisma.email.update({
            where: { id: savedEmail.id },
            data: { 
              response: aiResponse.response,
              processed: true,
              status: 'processing'
            }
          })
          
          try {
            // Wyślij email
            await sendEmail({
              to: emailData.from,
              subject: `Re: ${emailData.subject}`,
              textContent: aiResponse.response,
              htmlContent: `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px;">
                ${aiResponse.response.replace(/\n/g, '<br>')}
                <br><br>
                <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">
                  🤖 Ta wiadomość została wygenerowana automatycznie przez AI Agent Dubai Travel.<br>
                  W razie pytań, odpowiedz na tego emaila - zostanie przekazany do naszego zespołu.
                </p>
              </div>`
            })
            
            console.log('✅ Email wysłany pomyślnie')
            
            // Oznacz jako odpowiedziane
            await prisma.email.update({
              where: { id: savedEmail.id },
              data: { 
                responded: true,
                status: 'responded'
              }
            })
            
            // Oznacz email jako przeczytany na serwerze (opcjonalnie)
            try {
              await imapService.markAsRead(emailData.messageId)
              console.log('📖 Oznaczono jako przeczytane na serwerze')
            } catch (markError) {
              console.log('⚠️ Nie udało się oznaczyć jako przeczytane:', markError.message)
            }
            
            console.log(`✅ Kompletnie przetworzono email: ${emailData.subject}`)
            
          } catch (emailError) {
            console.error('❌ Błąd wysyłania emaila:', emailError)
            
            // Oznacz jako błąd, ale zachowaj odpowiedź
            await prisma.email.update({
              where: { id: savedEmail.id },
              data: { 
                status: 'send_error'
              }
            })
          }
        } else {
          console.log('⚠️ Brak odpowiedzi AI dla:', emailData.subject)
          
          // Brak odpowiedzi AI
          await prisma.email.update({
            where: { id: savedEmail.id },
            data: { 
              processed: true,
              status: 'no_response'
            }
          })
        }
        
        processedEmails.push({
          id: savedEmail.id,
          subject: savedEmail.subject,
          from: savedEmail.from,
          to: savedEmail.to,
          processed: true,
          responded: !!aiResponse.response,
          status: savedEmail.status,
          aiProvider: aiResponse.provider || 'unknown'
        })
        
      } catch (emailError) {
        console.error(`❌ Błąd przetwarzania emaila ${emailData.messageId}:`, emailError)
        processedEmails.push({
          messageId: emailData.messageId,
          subject: emailData.subject,
          from: emailData.from,
          error: emailError.message,
          processed: false
        })
      }
    }
    
    console.log(`\n🏁 Zakończono przetwarzanie. Pomyślnie: ${processedEmails.filter(e => e.processed).length}/${processedEmails.length}`)
    
    return NextResponse.json({
      success: true,
      message: `Przetworzono ${processedEmails.length} emaili`,
      processed: processedEmails.filter(e => e.processed).length,
      total: processedEmails.length,
      emails: processedEmails
    })
    
  } catch (error) {
    console.error('❌ Błąd pobierania emaili:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: 'Sprawdź konfigurację IMAP w .env.local. Wymagane: IMAP_HOST, SMTP_USER, SMTP_PASS'
      },
      { status: 500 }
    )
  }
} 