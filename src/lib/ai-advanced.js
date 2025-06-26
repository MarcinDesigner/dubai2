import OpenAI from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Advanced sentiment analysis
export async function analyzeSentiment(content, language = 'pl') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze the sentiment and emotion of the email content. Return JSON:
{
  "sentiment": "positive|neutral|negative|frustrated|angry",
  "emotion": "excited|happy|neutral|concerned|frustrated|angry|disappointed",
  "confidence": 0.85,
  "urgency": "low|medium|high|urgent",
  "keywords": ["emotion", "indicators"],
  "reasoning": "Brief explanation"
}`
        },
        { role: "user", content: content }
      ],
      temperature: 0.1,
      max_tokens: 300
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      sentiment: 'neutral',
      emotion: 'neutral',
      confidence: 0.5,
      urgency: 'medium',
      keywords: [],
      reasoning: 'Analysis failed'
    };
  }
}

// Purchase probability prediction
export async function predictPurchaseProbability(content, clientProfile) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Analyze the email content and client profile to predict purchase probability. Return JSON:
{
  "purchaseProbability": 0.75,
  "confidence": 0.85,
  "timeToDecision": "1-3 days|1-2 weeks|1 month|3+ months",
  "priceRange": "budget|mid-range|luxury",
  "urgency": "low|medium|high",
  "buyingSignals": ["specific dates", "budget mentioned", "comparing options"],
  "barriers": ["price concerns", "timing issues", "decision makers"],
  "upsellOpportunities": ["premium hotels", "extended stay", "additional services"],
  "reasoning": "Detailed analysis"
}`
        },
        { 
          role: "user", 
          content: `Email Content: ${content}\n\nClient Profile: ${JSON.stringify(clientProfile)}` 
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error predicting purchase probability:', error);
    return {
      purchaseProbability: 0.5,
      confidence: 0.5,
      timeToDecision: "1-2 weeks",
      priceRange: "mid-range",
      urgency: "medium",
      buyingSignals: [],
      barriers: [],
      upsellOpportunities: [],
      reasoning: "Analysis failed"
    };
  }
}

// Generate personalized recommendations
export async function generatePersonalizedRecommendations(content, clientProfile) {
  try {
    // Get available options from database
    const hotels = await prisma.hotel.findMany({ where: { isActive: true } });
    const attractions = await prisma.attraction.findMany({ where: { isActive: true } });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Based on the email content and client profile, generate personalized recommendations. Return JSON:
{
  "hotels": [
    {
      "name": "Hotel Name",
      "reason": "Why this hotel fits the client",
      "priority": "high|medium|low"
    }
  ],
  "attractions": [
    {
      "name": "Attraction Name", 
      "reason": "Why this attraction fits",
      "priority": "high|medium|low"
    }
  ],
  "experiences": [
    {
      "name": "Experience Name",
      "description": "What makes it special for this client",
      "priority": "high|medium|low"
    }
  ],
  "travelTips": ["Personalized tip 1", "Personalized tip 2"],
  "bestTime": "When to visit based on client preferences",
  "budgetAdvice": "Budget recommendations for this client"
}`
        },
        { 
          role: "user", 
          content: `Email: ${content}\n\nClient Profile: ${JSON.stringify(clientProfile)}\n\nAvailable Hotels: ${JSON.stringify(hotels)}\n\nAvailable Attractions: ${JSON.stringify(attractions)}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return {
      hotels: [],
      attractions: [],
      experiences: [],
      travelTips: [],
      bestTime: "November to March",
      budgetAdvice: "Plan for mid-range options"
    };
  }
}

// Get or create client profile
export async function getOrCreateClientProfile(email) {
  try {
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { email },
      include: {
        bookings: true,
        interactions: true,
        conversations: true
      }
    });

    if (!clientProfile) {
      clientProfile = await prisma.clientProfile.create({
        data: {
          email,
          loyaltyScore: 0.0,
          valueScore: 0.0,
          engagementScore: 0.0
        },
        include: {
          bookings: true,
          interactions: true,
          conversations: true
        }
      });
    }

    return clientProfile;
  } catch (error) {
    console.error('Error getting/creating client profile:', error);
    return {
      email,
      bookings: [],
      interactions: [],
      conversations: [],
      loyaltyScore: 0.0,
      valueScore: 0.0,
      engagementScore: 0.0
    };
  }
}

// Determine priority based on AI analysis
export function determinePriority(sentimentAnalysis, purchasePrediction) {
  const sentiment = sentimentAnalysis.sentiment;
  const urgency = sentimentAnalysis.urgency;
  const purchaseProb = purchasePrediction.purchaseProbability;

  // High priority conditions
  if (sentiment === 'angry' || sentiment === 'frustrated') {
    return 'URGENT';
  }
  
  if (urgency === 'urgent' || purchaseProb > 0.8) {
    return 'HIGH';
  }
  
  if (urgency === 'high' || purchaseProb > 0.6) {
    return 'HIGH';
  }
  
  if (purchaseProb > 0.4 || urgency === 'medium') {
    return 'MEDIUM';
  }
  
  return 'LOW';
}

// Check if conversation should be escalated to human
export async function checkEscalationCriteria(sentimentAnalysis, conversation) {
  const reasons = [];
  let shouldEscalate = false;

  // Negative sentiment escalation
  if (sentimentAnalysis.sentiment === 'angry' || sentimentAnalysis.sentiment === 'frustrated') {
    reasons.push(`Negative sentiment detected: ${sentimentAnalysis.sentiment}`);
    shouldEscalate = true;
  }

  // High urgency escalation
  if (sentimentAnalysis.urgency === 'urgent') {
    reasons.push('High urgency email');
    shouldEscalate = true;
  }

  // High-value client escalation
  try {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { email: conversation.clientEmail },
      include: { bookings: true }
    });

    if (clientProfile) {
      const totalBookingValue = clientProfile.bookings.reduce((sum, booking) => sum + booking.totalValue, 0);
      
      if (totalBookingValue > 50000 || clientProfile.loyaltyScore > 0.8) {
        reasons.push('High-value client (VIP treatment required)');
        shouldEscalate = true;
      }
    }
  } catch (error) {
    console.error('Error checking client value:', error);
  }

  // Complex query escalation
  const complexKeywords = ['complaint', 'refund', 'cancel', 'problem', 'issue', 'disappointed', 'legal'];
  const hasComplexKeywords = complexKeywords.some(keyword => 
    conversation.email?.content?.toLowerCase().includes(keyword)
  );

  if (hasComplexKeywords) {
    reasons.push('Complex query detected (complaint/refund/legal)');
    shouldEscalate = true;
  }

  return {
    shouldEscalate,
    reasons,
    escalationType: shouldEscalate ? 'HUMAN_REQUIRED' : 'AI_HANDLED'
  };
}

// Update client profile based on interaction
export async function updateClientProfile(clientEmail, interactionData) {
  try {
    const profile = await getOrCreateClientProfile(clientEmail);
    
    // Calculate new scores based on interaction
    const engagementBoost = interactionData.responseTime < 2 ? 0.1 : 0.05;
    const sentimentBoost = interactionData.sentiment === 'positive' ? 0.1 : 
                          interactionData.sentiment === 'negative' ? -0.05 : 0;
    
    const updatedProfile = await prisma.clientProfile.update({
      where: { email: clientEmail },
      data: {
        engagementScore: Math.min(1.0, (profile.engagementScore || 0) + engagementBoost),
        // Update other scores based on interaction patterns
        responseTime: interactionData.responseTime,
        preferredLanguage: interactionData.language
      }
    });

    // Log the interaction
    await prisma.clientInteraction.create({
      data: {
        clientId: profile.id,
        type: 'EMAIL',
        content: interactionData.content,
        sentiment: interactionData.sentiment,
        outcome: interactionData.outcome || 'no-action'
      }
    });

    return updatedProfile;
  } catch (error) {
    console.error('Error updating client profile:', error);
    return null;
  }
}

// Machine learning model training data logging
export async function logPrediction(modelName, input, prediction, actual = null) {
  try {
    await prisma.predictionLog.create({
      data: {
        modelName,
        input,
        prediction,
        actual,
        confidence: prediction.confidence || null
      }
    });
  } catch (error) {
    console.error('Error logging prediction:', error);
  }
}

// Detect purchase-ready clients
export async function detectPurchaseReadyClient(content, clientProfile, sentimentAnalysis, purchasePrediction) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Analyze if the client is READY TO PURCHASE based on their email content, profile, and AI analysis. Return JSON:
{
  "isPurchaseReady": true|false,
  "readinessScore": 0.95,
  "confidence": 0.90,
  "readySignals": [
    "mentioned specific dates",
    "asked about booking process", 
    "requested final quote",
    "mentioned decision deadline",
    "compared final options",
    "asked about payment methods",
    "mentioned group size confirmed",
    "urgency in language"
  ],
  "immediateActions": [
    "Send detailed quote within 2 hours",
    "Call client directly",
    "Prepare booking confirmation",
    "Check availability for mentioned dates"
  ],
  "recommendedResponse": "urgent|priority|standard",
  "estimatedCloseTime": "24 hours|2-3 days|1 week",
  "potentialValue": 15000,
  "riskFactors": ["price sensitivity", "competition"],
  "nextSteps": ["specific action 1", "specific action 2"],
  "reasoning": "Detailed explanation of why client is purchase-ready"
}`
        },
        { 
          role: "user", 
          content: `
EMAIL CONTENT: ${content}

CLIENT PROFILE:
- Email: ${clientProfile.email}
- Previous bookings: ${clientProfile.bookings?.length || 0}
- Loyalty score: ${clientProfile.loyaltyScore || 0}
- Value score: ${clientProfile.valueScore || 0}
- Budget range: ${clientProfile.budgetRange || 'unknown'}
- Travel style: ${clientProfile.travelStyle || 'unknown'}

SENTIMENT ANALYSIS:
- Sentiment: ${sentimentAnalysis.sentiment}
- Emotion: ${sentimentAnalysis.emotion}
- Urgency: ${sentimentAnalysis.urgency}

PURCHASE PREDICTION:
- Purchase probability: ${purchasePrediction.purchaseProbability}
- Time to decision: ${purchasePrediction.timeToDecision}
- Buying signals: ${JSON.stringify(purchasePrediction.buyingSignals)}
- Price range: ${purchasePrediction.priceRange}
          ` 
        }
      ],
      temperature: 0.1,
      max_tokens: 600
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Log the purchase readiness detection
    await logPurchaseReadiness(clientProfile.email, result);
    
    return result;
  } catch (error) {
    console.error('Error detecting purchase-ready client:', error);
    return {
      isPurchaseReady: false,
      readinessScore: 0.0,
      confidence: 0.0,
      readySignals: [],
      immediateActions: [],
      recommendedResponse: "standard",
      estimatedCloseTime: "1 week",
      potentialValue: 0,
      riskFactors: [],
      nextSteps: [],
      reasoning: "Analysis failed"
    };
  }
}

// Send immediate notifications for purchase-ready clients
export async function notifyPurchaseReadyClient(conversation, purchaseReadiness, clientProfile) {
  try {
    if (!purchaseReadiness.isPurchaseReady || purchaseReadiness.readinessScore < 0.8) {
      return false;
    }

    // Create high-priority alert in database
    const alert = await prisma.purchaseAlert.create({
      data: {
        conversationId: conversation.id,
        clientEmail: conversation.clientEmail,
        alertType: 'PURCHASE_READY',
        priority: 'URGENT',
        readinessScore: purchaseReadiness.readinessScore,
        estimatedValue: purchaseReadiness.potentialValue,
        estimatedCloseTime: purchaseReadiness.estimatedCloseTime,
        readySignals: JSON.stringify(purchaseReadiness.readySignals),
        immediateActions: JSON.stringify(purchaseReadiness.immediateActions),
        nextSteps: JSON.stringify(purchaseReadiness.nextSteps),
        isActive: true
      }
    });

    // Send email notification to sales team
    const { sendEmail } = await import('./email');
    await sendEmail({
      to: process.env.SALES_TEAM_EMAIL || 'sales@dubaitravel.com',
      subject: `🚨 KLIENT GOTOWY DO ZAKUPU - ${conversation.clientEmail} (${purchaseReadiness.readinessScore * 100}%)`,
      textContent: generatePurchaseReadyEmailText(conversation, purchaseReadiness, clientProfile),
      htmlContent: generatePurchaseReadyEmailHTML(conversation, purchaseReadiness, clientProfile)
    });

    // Send SMS notification if configured
    if (process.env.SMS_ENABLED === 'true') {
      await sendSMSNotification(conversation, purchaseReadiness);
    }

    // Send Slack notification if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackNotification(conversation, purchaseReadiness, clientProfile);
    }

    console.log(`🎯 PURCHASE READY CLIENT DETECTED: ${conversation.clientEmail} (${Math.round(purchaseReadiness.readinessScore * 100)}%)`);
    
    return alert;
  } catch (error) {
    console.error('Error notifying purchase-ready client:', error);
    return false;
  }
}

// Generate email notification content
function generatePurchaseReadyEmailText(conversation, purchaseReadiness, clientProfile) {
  return `
🚨 ALERT: KLIENT GOTOWY DO ZAKUPU

DANE KLIENTA:
• Email: ${conversation.clientEmail}
• Gotowość zakupu: ${Math.round(purchaseReadiness.readinessScore * 100)}%
• Szacowana wartość: ${purchaseReadiness.potentialValue} AED
• Czas do zamknięcia: ${purchaseReadiness.estimatedCloseTime}
• Status klienta: ${clientProfile.bookings?.length > 0 ? 'Powracający' : 'Nowy'}

SYGNAŁY GOTOWOŚCI:
${purchaseReadiness.readySignals.map(signal => `• ${signal}`).join('\n')}

NATYCHMIASTOWE AKCJE:
${purchaseReadiness.immediateActions.map(action => `• ${action}`).join('\n')}

NASTĘPNE KROKI:
${purchaseReadiness.nextSteps.map(step => `• ${step}`).join('\n')}

RYZYKO:
${purchaseReadiness.riskFactors.map(risk => `• ${risk}`).join('\n')}

UZASADNIENIE AI:
${purchaseReadiness.reasoning}

🔗 Link do konwersacji: ${process.env.NEXTAUTH_URL}/dashboard/conversations/${conversation.id}

⚠️ DZIAŁAJ NATYCHMIAST - KLIENT JEST GOTOWY DO ZAKUPU!
  `;
}

function generatePurchaseReadyEmailHTML(conversation, purchaseReadiness, clientProfile) {
  const readinessPercentage = Math.round(purchaseReadiness.readinessScore * 100);
  const statusColor = readinessPercentage >= 90 ? '#dc2626' : readinessPercentage >= 80 ? '#ea580c' : '#059669';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🚨 KLIENT GOTOWY DO ZAKUPU</h1>
        <div style="font-size: 36px; font-weight: bold; margin: 10px 0;">${readinessPercentage}%</div>
        <div style="font-size: 14px;">Poziom gotowości zakupu</div>
      </div>
      
      <div style="padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">📊 Dane Klienta</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${conversation.clientEmail}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Wartość szacowana:</td><td style="color: ${statusColor}; font-weight: bold;">${purchaseReadiness.potentialValue} AED</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Czas zamknięcia:</td><td>${purchaseReadiness.estimatedCloseTime}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Status:</td><td>${clientProfile.bookings?.length > 0 ? '🔄 Powracający klient' : '✨ Nowy klient'}</td></tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">🎯 Sygnały Gotowości</h2>
          <ul style="margin: 0; padding-left: 20px;">
            ${purchaseReadiness.readySignals.map(signal => `<li style="margin: 5px 0;">${signal}</li>`).join('')}
          </ul>
        </div>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #92400e; margin-top: 0;">⚡ NATYCHMIASTOWE AKCJE</h2>
          <ul style="margin: 0; padding-left: 20px; color: #92400e;">
            ${purchaseReadiness.immediateActions.map(action => `<li style="margin: 8px 0; font-weight: bold;">${action}</li>`).join('')}
          </ul>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">📋 Następne Kroki</h2>
          <ol style="margin: 0; padding-left: 20px;">
            ${purchaseReadiness.nextSteps.map(step => `<li style="margin: 5px 0;">${step}</li>`).join('')}
          </ol>
        </div>
        
        ${purchaseReadiness.riskFactors.length > 0 ? `
        <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-top: 0;">⚠️ Czynniki Ryzyka</h2>
          <ul style="margin: 0; padding-left: 20px; color: #dc2626;">
            ${purchaseReadiness.riskFactors.map(risk => `<li style="margin: 5px 0;">${risk}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">🤖 Analiza AI</h2>
          <p style="margin: 0; line-height: 1.5; color: #4b5563;">${purchaseReadiness.reasoning}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard/conversations/${conversation.id}" 
             style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🔗 OTWÓRZ KONWERSACJĘ
          </a>
        </div>
        
        <div style="background: #dc2626; color: white; padding: 15px; text-align: center; border-radius: 8px; font-weight: bold; font-size: 18px;">
          ⚠️ DZIAŁAJ NATYCHMIAST - KLIENT JEST GOTOWY!
        </div>
      </div>
    </div>
  `;
}

// Send Slack notification
async function sendSlackNotification(conversation, purchaseReadiness, clientProfile) {
  try {
    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 KLIENT GOTOWY DO ZAKUPU: ${conversation.clientEmail}`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `🚨 KLIENT GOTOWY DO ZAKUPU (${Math.round(purchaseReadiness.readinessScore * 100)}%)`
            }
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Email:*\n${conversation.clientEmail}` },
              { type: "mrkdwn", text: `*Wartość:*\n${purchaseReadiness.potentialValue} AED` },
              { type: "mrkdwn", text: `*Czas zamknięcia:*\n${purchaseReadiness.estimatedCloseTime}` },
              { type: "mrkdwn", text: `*Status:*\n${clientProfile.bookings?.length > 0 ? 'Powracający' : 'Nowy'}` }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Sygnały gotowości:*\n${purchaseReadiness.readySignals.map(s => `• ${s}`).join('\n')}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Natychmiastowe akcje:*\n${purchaseReadiness.immediateActions.map(a => `• ${a}`).join('\n')}`
            }
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "Otwórz konwersację" },
                url: `${process.env.NEXTAUTH_URL}/dashboard/conversations/${conversation.id}`,
                style: "danger"
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }
    
    console.log('Slack notification sent successfully');
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}

// Log purchase readiness for analytics
async function logPurchaseReadiness(clientEmail, purchaseReadiness) {
  try {
    await prisma.purchaseReadinessLog.create({
      data: {
        clientEmail,
        readinessScore: purchaseReadiness.readinessScore,
        confidence: purchaseReadiness.confidence,
        estimatedValue: purchaseReadiness.potentialValue,
        estimatedCloseTime: purchaseReadiness.estimatedCloseTime,
        readySignals: JSON.stringify(purchaseReadiness.readySignals),
        immediateActions: JSON.stringify(purchaseReadiness.immediateActions),
        reasoning: purchaseReadiness.reasoning
      }
    });
  } catch (error) {
    console.error('Error logging purchase readiness:', error);
  }
} 