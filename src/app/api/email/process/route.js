import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateResponse, categorizeEmail, getLocalizedSignature, getLocalizedTemplate, getLocalizedSubject } from '@/lib/ai';
import { 
  analyzeSentiment, 
  predictPurchaseProbability, 
  generatePersonalizedRecommendations,
  getOrCreateClientProfile,
  determinePriority,
  checkEscalationCriteria,
  detectPurchaseReadyClient,
  notifyPurchaseReadyClient
} from '@/lib/ai-advanced';
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

    // 2. ADVANCED AI ANALYSIS
    console.log('Starting advanced AI analysis...');
    
    // Get or create client profile
    const clientProfile = await getOrCreateClientProfile(from);
    
    // Sentiment analysis
    const sentimentAnalysis = await analyzeSentiment(content, emailCategory.detectedLanguage);
    
    // Purchase prediction
    const purchasePrediction = await predictPurchaseProbability(content, clientProfile);
    
    // Personalized recommendations
    const personalizedRecommendations = await generatePersonalizedRecommendations(content, clientProfile);
    
    // 🎯 PURCHASE READINESS DETECTION - NOWA FUNKCJONALNOŚĆ
    const purchaseReadiness = await detectPurchaseReadyClient(
      content, 
      clientProfile, 
      sentimentAnalysis, 
      purchasePrediction
    );
    
    // Determine priority (może być podwyższony przez purchase readiness)
    let priority = determinePriority(sentimentAnalysis, purchasePrediction);
    if (purchaseReadiness.isPurchaseReady && purchaseReadiness.readinessScore > 0.8) {
      priority = 'URGENT'; // Automatycznie podnoś priorytet dla gotowych klientów
    }

    // 3. SAVE EMAIL WITH AI INSIGHTS
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

    // 4. CREATE ENHANCED CONVERSATION
    const conversation = await prisma.conversation.create({
      data: {
        emailId: email.id,
        clientEmail: from,
        clientId: clientProfile.id,
        topic: emailCategory.category,
        language: emailCategory.detectedLanguage,
        sentiment: sentimentAnalysis.sentiment,
        priority: priority,
        purchaseProbability: purchasePrediction.purchaseProbability,
        summary: `[${emailCategory.detectedLanguage.toUpperCase()}] ${emailCategory.category} - ${emailCategory.topics.join(', ')} | Sentiment: ${sentimentAnalysis.sentiment} | Purchase: ${Math.round(purchasePrediction.purchaseProbability * 100)}% | Ready: ${purchaseReadiness.isPurchaseReady ? 'YES' : 'NO'}`
      }
    });

    // 5. 🚨 PURCHASE READY CLIENT NOTIFICATION - KLUCZOWA FUNKCJONALNOŚĆ
    let purchaseAlert = null;
    if (purchaseReadiness.isPurchaseReady) {
      console.log(`🎯 PURCHASE READY CLIENT DETECTED: ${from} (${Math.round(purchaseReadiness.readinessScore * 100)}%)`);
      
      purchaseAlert = await notifyPurchaseReadyClient(conversation, purchaseReadiness, clientProfile);
      
      // Dodatkowe logowanie dla Ciebie
      console.log(`
🚨 === ALERT ZAKUPOWY === 🚨
Klient: ${from}
Gotowość: ${Math.round(purchaseReadiness.readinessScore * 100)}%
Wartość: ${purchaseReadiness.potentialValue} AED
Czas zamknięcia: ${purchaseReadiness.estimatedCloseTime}
Sygnały: ${purchaseReadiness.readySignals.join(', ')}
Akcje: ${purchaseReadiness.immediateActions.join(', ')}
========================
      `);
    }

    // 6. CHECK FOR ESCALATION
    const escalationCheck = await checkEscalationCriteria(sentimentAnalysis, conversation);
    
    if (escalationCheck.shouldEscalate || purchaseReadiness.isPurchaseReady) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { 
          escalated: true,
          priority: 'URGENT'
        }
      });
      
      // Send notification to human agents
      await notifyHumanAgents(conversation, escalationCheck.reasons, purchaseReadiness);
    }

    // 7. ADD CLIENT MESSAGE
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content,
        sender: 'CLIENT'
      }
    });

    // 8. GENERATE AI RESPONSE (Enhanced with personalization)
    const aiResult = await generateResponse(content, {
      clientProfile,
      sentimentAnalysis,
      purchasePrediction,
      personalizedRecommendations,
      purchaseReadiness // Dodaj informację o gotowości zakupu
    });

    // 9. PREPARE RESPONSE WITH PERSONALIZATION
    const settings = await prisma.agentSettings.findFirst();
    const localizedSignature = getLocalizedSignature(aiResult.detectedLanguage, settings?.signature);
    const localizedTemplate = getLocalizedTemplate(aiResult.detectedLanguage);
    
    // Add upsell suggestions if high purchase probability
    let enhancedResponse = aiResult.response;
    if (purchasePrediction.purchaseProbability > 0.7 && purchasePrediction.upsellOpportunities.length > 0) {
      enhancedResponse += `\n\n✨ Dodatkowe rekomendacje specjalnie dla Ciebie:\n${purchasePrediction.upsellOpportunities.join('\n')}`;
    }
    
    // 🎯 Special handling for purchase-ready clients
    if (purchaseReadiness.isPurchaseReady) {
      const urgentActions = purchaseReadiness.immediateActions.slice(0, 2).join('\n• ');
      enhancedResponse += `\n\n🚀 SPECJALNA OFERTA - DZIAŁAMY NATYCHMIAST:\n• ${urgentActions}\n\nSkontaktuj się z nami telefonicznie pod numerem +48 123 456 789 w ciągu najbliższych 2 godzin, aby otrzymać najlepszą ofertę!`;
    }
    
    const fullResponse = `${localizedTemplate}\n\n${enhancedResponse}\n\n${localizedSignature}`;

    // 10. SAVE AI RESPONSE
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: enhancedResponse,
        sender: 'AGENT'
      }
    });

    // 11. UPDATE EMAIL STATUS
    const finalStatus = escalationCheck.shouldEscalate || purchaseReadiness.isPurchaseReady ? 'ESCALATED' : 'RESPONDED';
    await prisma.email.update({
      where: { id: email.id },
      data: {
        response: fullResponse,
        status: finalStatus,
        responded: !escalationCheck.shouldEscalate && !purchaseReadiness.isPurchaseReady
      }
    });

    // 12. AUTO-REPLY LOGIC (only if not escalated and not purchase-ready)
    if (settings?.autoReply && !escalationCheck.shouldEscalate && !purchaseReadiness.isPurchaseReady) {
      const localizedSubject = getLocalizedSubject(aiResult.detectedLanguage, subject);
      
      await sendEmail({
        to: from,
        subject: localizedSubject,
        textContent: fullResponse,
        htmlContent: fullResponse.replace(/\n/g, '<br>')
      });
    }

    // 13. RETURN COMPREHENSIVE RESPONSE
    return NextResponse.json({
      success: true,
      emailId: email.id,
      conversationId: conversation.id,
      response: enhancedResponse,
      category: emailCategory,
      detectedLanguage: aiResult.detectedLanguage,
      aiInsights: {
        sentiment: sentimentAnalysis,
        purchasePrediction: purchasePrediction,
        purchaseReadiness: purchaseReadiness, // 🎯 Nowa informacja
        priority: priority,
        escalated: escalationCheck.shouldEscalate || purchaseReadiness.isPurchaseReady,
        escalationReasons: escalationCheck.reasons,
        purchaseAlert: purchaseAlert, // 🎯 Alert zakupowy
        clientProfile: {
          isReturning: clientProfile.bookings?.length > 0,
          loyaltyScore: clientProfile.loyaltyScore,
          valueScore: clientProfile.valueScore
        }
      }
    });

  } catch (error) {
    console.error('Error processing email:', error);
    return NextResponse.json(
      { error: 'Błąd przetwarzania emaila' },
      { status: 500 }
    );
  }
}

// Helper function for human agent notification (enhanced)
async function notifyHumanAgents(conversation, reasons, purchaseReadiness = null) {
  try {
    let subject = `🚨 URGENT: Email Escalation Required - ${conversation.clientEmail}`;
    let additionalInfo = '';
    
    if (purchaseReadiness?.isPurchaseReady) {
      subject = `💰 KLIENT GOTOWY DO ZAKUPU + Eskalacja - ${conversation.clientEmail}`;
      additionalInfo = `

🎯 KLIENT GOTOWY DO ZAKUPU:
Gotowość: ${Math.round(purchaseReadiness.readinessScore * 100)}%
Szacowana wartość: ${purchaseReadiness.potentialValue} AED
Czas zamknięcia: ${purchaseReadiness.estimatedCloseTime}

Sygnały gotowości:
${purchaseReadiness.readySignals.map(s => `- ${s}`).join('\n')}

Natychmiastowe akcje:
${purchaseReadiness.immediateActions.map(a => `- ${a}`).join('\n')}
      `;
    }
    
    // Send email notification to human agents
    await sendEmail({
      to: process.env.HUMAN_AGENT_EMAIL || 'agent@dubaitravel.com',
      subject: subject,
      textContent: `
ESCALATION ALERT${purchaseReadiness?.isPurchaseReady ? ' + PURCHASE READY' : ''}

Client: ${conversation.clientEmail}
Priority: ${conversation.priority}
Purchase Probability: ${Math.round(conversation.purchaseProbability * 100)}%
Sentiment: ${conversation.sentiment}

Escalation Reasons:
${reasons.map(r => `- ${r}`).join('\n')}
${additionalInfo}

Please review and respond manually.

Dashboard: ${process.env.NEXTAUTH_URL}/dashboard/conversations/${conversation.id}
      `,
      htmlContent: `
        <h2 style="color: red;">🚨 ESCALATION ALERT${purchaseReadiness?.isPurchaseReady ? ' + 💰 PURCHASE READY' : ''}</h2>
        <p><strong>Client:</strong> ${conversation.clientEmail}</p>
        <p><strong>Priority:</strong> <span style="color: red; font-weight: bold;">${conversation.priority}</span></p>
        <p><strong>Purchase Probability:</strong> ${Math.round(conversation.purchaseProbability * 100)}%</p>
        <p><strong>Sentiment:</strong> ${conversation.sentiment}</p>
        
        <h3>Escalation Reasons:</h3>
        <ul>
          ${reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
        
        ${purchaseReadiness?.isPurchaseReady ? `
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #92400e;">🎯 KLIENT GOTOWY DO ZAKUPU</h3>
          <p><strong>Gotowość:</strong> ${Math.round(purchaseReadiness.readinessScore * 100)}%</p>
          <p><strong>Szacowana wartość:</strong> ${purchaseReadiness.potentialValue} AED</p>
          <p><strong>Czas zamknięcia:</strong> ${purchaseReadiness.estimatedCloseTime}</p>
          
          <h4>Sygnały gotowości:</h4>
          <ul>
            ${purchaseReadiness.readySignals.map(s => `<li>${s}</li>`).join('')}
          </ul>
          
          <h4>Natychmiastowe akcje:</h4>
          <ul>
            ${purchaseReadiness.immediateActions.map(a => `<li><strong>${a}</strong></li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <p><a href="${process.env.NEXTAUTH_URL}/dashboard/conversations/${conversation.id}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review in Dashboard</a></p>
      `
    });
    
    console.log(`Escalation notification sent for conversation ${conversation.id}${purchaseReadiness?.isPurchaseReady ? ' (PURCHASE READY)' : ''}`);
  } catch (error) {
    console.error('Error notifying human agents:', error);
  }
} 