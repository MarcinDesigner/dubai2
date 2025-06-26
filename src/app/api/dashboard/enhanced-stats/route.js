import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic stats
    const totalEmails = await prisma.email.count();
    const pendingEmails = await prisma.email.count({
      where: { status: 'PENDING' }
    });
    const respondedEmails = await prisma.email.count({
      where: { status: 'RESPONDED' }
    });
    const escalatedEmails = await prisma.email.count({
      where: { status: 'ESCALATED' }
    });
    const processingEmails = await prisma.email.count({
      where: { status: 'PROCESSING' }
    });

    // AI-enhanced stats
    const conversations = await prisma.conversation.findMany({
      where: {
        createdAt: { gte: weekAgo }
      },
      include: {
        email: true
      }
    });

    // High-value leads (purchase probability > 70%)
    const highValueLeads = await prisma.conversation.count({
      where: {
        purchaseProbability: { gte: 0.7 },
        createdAt: { gte: weekAgo }
      }
    });

    // Medium-value leads (purchase probability 40-70%)
    const mediumValueLeads = await prisma.conversation.count({
      where: {
        purchaseProbability: { gte: 0.4, lt: 0.7 },
        createdAt: { gte: weekAgo }
      }
    });

    // Average purchase probability
    const avgPurchaseResult = await prisma.conversation.aggregate({
      where: {
        purchaseProbability: { not: null },
        createdAt: { gte: weekAgo }
      },
      _avg: {
        purchaseProbability: true
      }
    });

    // Sentiment breakdown
    const sentimentCounts = await prisma.conversation.groupBy({
      by: ['sentiment'],
      where: {
        createdAt: { gte: weekAgo },
        sentiment: { not: null }
      },
      _count: {
        sentiment: true
      }
    });

    const sentimentBreakdown = sentimentCounts.reduce((acc, item) => {
      acc[item.sentiment] = item._count.sentiment;
      return acc;
    }, {});

    // Language breakdown
    const languageCounts = await prisma.conversation.groupBy({
      by: ['language'],
      where: {
        createdAt: { gte: weekAgo },
        language: { not: null }
      },
      _count: {
        language: true
      }
    });

    const languageBreakdown = languageCounts.reduce((acc, item) => {
      acc[item.language] = item._count.language;
      return acc;
    }, {});

    // Priority breakdown
    const priorityCounts = await prisma.conversation.groupBy({
      by: ['priority'],
      where: {
        createdAt: { gte: weekAgo }
      },
      _count: {
        priority: true
      }
    });

    const priorityBreakdown = priorityCounts.reduce((acc, item) => {
      acc[item.priority] = item._count.priority;
      return acc;
    }, {});

    // Response time calculation (simplified for demo)
    const emailsWithResponse = await prisma.email.findMany({
      where: {
        responded: true,
        createdAt: { gte: weekAgo }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    const avgResponseTime = emailsWithResponse.length > 0 
      ? emailsWithResponse.reduce((sum, email) => {
          const responseTime = (email.updatedAt.getTime() - email.createdAt.getTime()) / (1000 * 60 * 60);
          return sum + responseTime;
        }, 0) / emailsWithResponse.length 
      : 0;

    // Recent emails with AI insights
    const recentEmails = await prisma.email.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: {
          select: {
            language: true,
            sentiment: true,
            priority: true,
            purchaseProbability: true,
            escalated: true
          }
        }
      }
    });

    // Client profiles stats
    const totalClients = await prisma.clientProfile.count();
    const vipClients = await prisma.clientProfile.count({
      where: { loyaltyScore: { gte: 0.7 } }
    });
    const newClients = await prisma.clientProfile.count({
      where: { bookingFrequency: 'first-time' }
    });

    // Generate AI insights
    const aiInsights = await generateAIInsights(conversations, sentimentBreakdown, highValueLeads, languageBreakdown, totalClients);

    const stats = {
      totalEmails,
      pendingEmails,
      respondedEmails,
      escalatedEmails,
      processingEmails,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      avgPurchaseProbability: Math.round((avgPurchaseResult._avg.purchaseProbability || 0) * 100) / 100,
      highValueLeads,
      mediumValueLeads,
      sentimentBreakdown,
      languageBreakdown,
      priorityBreakdown,
      totalClients,
      vipClients,
      newClients
    };

    return NextResponse.json({
      stats,
      recentEmails,
      aiInsights
    });

  } catch (error) {
    console.error('Error fetching enhanced dashboard stats:', error);
    
    // Return fallback data instead of error
    return NextResponse.json({
      stats: {
        totalEmails: 0,
        pendingEmails: 0,
        respondedEmails: 0,
        escalatedEmails: 0,
        processingEmails: 0,
        avgResponseTime: 0,
        avgPurchaseProbability: 0,
        highValueLeads: 0,
        mediumValueLeads: 0,
        sentimentBreakdown: {},
        languageBreakdown: {},
        priorityBreakdown: {},
        totalClients: 0,
        vipClients: 0,
        newClients: 0
      },
      recentEmails: [],
      aiInsights: [{
        title: "Skonfiguruj DATABASE_URL w pliku .env.local aby zobaczyć rzeczywiste dane",
        description: "💡 Skopiuj env-template.txt do .env.local i wypełnij dane",
        action: "Sprawdź dokumentację konfiguracji bazy danych",
        type: "info"
      }]
    });
  }
}

async function generateAIInsights(conversations, sentimentBreakdown, highValueLeads, languageBreakdown, totalClients) {
  const insights = [];

  // Sentiment insights
  const negativeCount = (sentimentBreakdown.negative || 0) + (sentimentBreakdown.frustrated || 0) + (sentimentBreakdown.angry || 0);
  const positiveCount = (sentimentBreakdown.positive || 0) + (sentimentBreakdown.excited || 0);
  const totalSentiment = Object.values(sentimentBreakdown).reduce((sum, count) => sum + count, 0);
  
  if (negativeCount > totalSentiment * 0.3) {
    insights.push({
      title: "Wysoki poziom negatywnych emocji",
      description: `${Math.round(negativeCount / totalSentiment * 100)}% klientów wykazuje negatywne emocje`,
      action: "Rozważ przeszkolenie zespołu w zakresie obsługi trudnych klientów",
      type: "warning"
    });
  } else if (positiveCount > totalSentiment * 0.6) {
    insights.push({
      title: "Doskonałe nastroje klientów!",
      description: `${Math.round(positiveCount / totalSentiment * 100)}% klientów jest pozytywnie nastawionych`,
      action: "Wykorzystaj ten moment do upsellingu premium opcji",
      type: "success"
    });
  }

  // High-value leads insight
  if (highValueLeads > 5) {
    insights.push({
      title: "Duża liczba perspektywicznych klientów",
      description: `${highValueLeads} klientów ma wysokie prawdopodobieństwo zakupu (>70%)`,
      action: "Priorytetowo skontaktuj się z tymi klientami w ciągu 24h",
      type: "opportunity"
    });
  } else if (highValueLeads > 2) {
    insights.push({
      title: "Perspektywiczni klienci w bazie",
      description: `${highValueLeads} klientów z wysokim prawdopodobieństwem zakupu`,
      action: "Skontaktuj się z nimi osobiscie",
      type: "info"
    });
  }

  // Language diversity insight
  const languages = Object.keys(languageBreakdown);
  if (languages.length > 3) {
    const topLanguages = Object.entries(languageBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([lang]) => lang.toUpperCase());
    
    insights.push({
      title: "Międzynarodowa klientela",
      description: `Zapytania w ${languages.length} językach. Top 3: ${topLanguages.join(', ')}`,
      action: "Rozważ rozszerzenie zespołu o native speakerów",
      type: "info"
    });
  }

  // Peak time analysis
  const hourCounts = conversations.reduce((acc, conv) => {
    const hour = new Date(conv.createdAt).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const peakHour = Object.entries(hourCounts).reduce((max, [hour, count]) => 
    count > (hourCounts[max] || 0) ? hour : max, '0');

  if (hourCounts[peakHour] > conversations.length * 0.2) {
    insights.push({
      title: "Godzina szczytu zapytań",
      description: `Najwięcej emaili otrzymujesz o ${peakHour}:00`,
      action: "Zaplanuj dostępność zespołu na te godziny",
      type: "info"
    });
  }

  // Purchase probability trends
  const avgPurchaseProb = conversations
    .filter(c => c.purchaseProbability)
    .reduce((sum, c) => sum + c.purchaseProbability, 0) / conversations.filter(c => c.purchaseProbability).length;

  if (avgPurchaseProb > 0.6) {
    insights.push({
      title: "Wysokiej jakości leady",
      description: `Średnie prawdopodobieństwo zakupu: ${Math.round(avgPurchaseProb * 100)}%`,
      action: "Twoje strategie marketingowe działają doskonale!",
      type: "success"
    });
  } else if (avgPurchaseProb < 0.3) {
    insights.push({
      title: "Niskie prawdopodobieństwo konwersji",
      description: `Średnie prawdopodobieństwo zakupu: ${Math.round(avgPurchaseProb * 100)}%`,
      action: "Przeanalizuj źródła leadów i optymalizuj marketing",
      type: "warning"
    });
  }

  // Client base insights
  if (totalClients > 0) {
    insights.push({
      title: "Rozwijająca się baza klientów",
      description: `${totalClients} profili klientów w systemie z analizą behawioralną`,
      action: "Wykorzystuj AI insights do personalizacji ofert",
      type: "info"
    });
  }

  return insights.slice(0, 6); // Limit to 6 insights
} 