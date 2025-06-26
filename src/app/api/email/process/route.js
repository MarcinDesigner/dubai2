import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateResponse, categorizeEmail, getLocalizedSignature, getLocalizedTemplate, getLocalizedSubject } from '@/lib/ai';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { messageId, from, to, subject, content } = await request.json();

    // Sprawdź czy email już został przetworzony
    const existingEmail = await prisma.email.findUnique({
      where: { messageId }
    });

    if (existingEmail) {
      return NextResponse.json({ 
        message: 'Email już przetworzony',
        emailId: existingEmail.id 
      });
    }

    // 1. BASIC CATEGORIZATION & LANGUAGE DETECTION
    const emailCategory = await categorizeEmail(content);

    // 2. SAVE EMAIL
    const email = await prisma.email.create({
      data: {
        messageId,
        from,
        to,
        subject,
        content,
        status: 'PROCESSING'
      }
    });

    // 3. CREATE CONVERSATION
    const conversation = await prisma.conversation.create({
      data: {
        emailId: email.id,
        clientEmail: from,
        topic: emailCategory.category,
        language: emailCategory.detectedLanguage,
        sentiment: emailCategory.sentiment || 'neutral',
        priority: 'medium',
        purchaseProbability: 0.5, // Default value
        summary: `[${emailCategory.detectedLanguage.toUpperCase()}] ${emailCategory.category} - ${emailCategory.topics?.join(', ') || 'general'} | Sentiment: ${emailCategory.sentiment || 'neutral'}`
      }
    });

    // 4. ADD CLIENT MESSAGE
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content,
        sender: 'CLIENT'
      }
    });

    // 5. GENERATE AI RESPONSE
    const aiResult = await generateResponse(content, {});

    // 6. PREPARE RESPONSE
    const settings = await prisma.agentSettings.findFirst();
    const localizedSignature = getLocalizedSignature(aiResult.detectedLanguage, settings?.signature);
    const localizedTemplate = getLocalizedTemplate(aiResult.detectedLanguage);
    
    const fullResponse = `${localizedTemplate}\n\n${aiResult.response}\n\n${localizedSignature}`;

    // 7. SAVE AI RESPONSE
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: aiResult.response,
        sender: 'AGENT'
      }
    });

    // 8. UPDATE EMAIL STATUS
    await prisma.email.update({
      where: { id: email.id },
      data: {
        response: fullResponse,
        status: 'RESPONDED',
        responded: true
      }
    });

    // 9. AUTO-REPLY LOGIC
    if (settings?.autoReply) {
      const localizedSubject = getLocalizedSubject(aiResult.detectedLanguage, subject);
      
      await sendEmail({
        to: from,
        subject: localizedSubject,
        textContent: fullResponse,
        htmlContent: fullResponse.replace(/\n/g, '<br>')
      });
    }

    // 10. RETURN RESPONSE
    return NextResponse.json({
      success: true,
      emailId: email.id,
      conversationId: conversation.id,
      response: aiResult.response,
      detectedLanguage: aiResult.detectedLanguage,
      category: emailCategory.category,
      sentiment: emailCategory.sentiment || 'neutral',
      autoReplySent: !!settings?.autoReply
    });

  } catch (error) {
    console.error('Error processing email:', error);
    return NextResponse.json(
      { error: 'Błąd przetwarzania emaila', details: error.message },
      { status: 500 }
    );
  }
} 