import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint do zbierania pytań bez odpowiedzi (learning system)
export async function POST(request) {
  try {
    const { 
      customerEmail, 
      question, 
      category, 
      language,
      keywords,
      context 
    } = await request.json();

    // Zapisz pytanie bez odpowiedzi do tabeli learning
    const learningEntry = await prisma.learningQueue.create({
      data: {
        customerEmail,
        question,
        category: category || 'unknown',
        language: language || 'pl',
        keywords: JSON.stringify(keywords || []),
        context: JSON.stringify(context || {}),
        status: 'pending',
        priority: determinePriority(question, keywords),
        createdAt: new Date()
      }
    });

    console.log(`📚 Dodano do kolejki uczenia: ${question.substring(0, 50)}...`);

    return NextResponse.json({
      success: true,
      learningId: learningEntry.id,
      message: 'Pytanie dodane do kolejki uczenia'
    });

  } catch (error) {
    console.error('❌ Błąd zapisywania do learning queue:', error);
    return NextResponse.json(
      { error: 'Błąd zapisywania pytania do uczenia' },
      { status: 500 }
    );
  }
}

// Endpoint do pobierania pytań do nauki (dla administratora)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit')) || 10;

    const learningEntries = await prisma.learningQueue.findMany({
      where: { status },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // Statystyki
    const stats = await prisma.learningQueue.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    return NextResponse.json({
      success: true,
      entries: learningEntries,
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {}),
      total: learningEntries.length
    });

  } catch (error) {
    console.error('❌ Błąd pobierania learning queue:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania pytań do uczenia' },
      { status: 500 }
    );
  }
}

// Endpoint do oznaczania pytania jako rozwiązane
export async function PUT(request) {
  try {
    const { learningId, answer, addToKnowledgeBase = false } = await request.json();

    // Aktualizuj status pytania
    const updatedEntry = await prisma.learningQueue.update({
      where: { id: learningId },
      data: {
        status: 'resolved',
        answer,
        resolvedAt: new Date()
      }
    });

    // Opcjonalnie dodaj do bazy wiedzy
    if (addToKnowledgeBase && answer) {
      const knowledgeEntry = await prisma.knowledgeBase.create({
        data: {
          title: `FAQ: ${updatedEntry.question.substring(0, 50)}...`,
          content: answer,
          category: updatedEntry.category.toUpperCase(),
          tags: updatedEntry.keywords,
          isActive: true,
          createdAt: new Date()
        }
      });

      console.log(`📚 Dodano do bazy wiedzy: ${knowledgeEntry.title}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Pytanie oznaczone jako rozwiązane',
      addedToKnowledge: addToKnowledgeBase
    });

  } catch (error) {
    console.error('❌ Błąd aktualizacji learning entry:', error);
    return NextResponse.json(
      { error: 'Błąd aktualizacji pytania' },
      { status: 500 }
    );
  }
}

// Helper function to determine priority
function determinePriority(question, keywords = []) {
  const highPriorityKeywords = ['cena', 'koszt', 'ile', 'price', 'cost', 'hotel', 'rezerwacja', 'booking'];
  const mediumPriorityKeywords = ['informacja', 'info', 'details', 'szczegóły'];
  
  const questionLower = question.toLowerCase();
  const keywordsLower = keywords.map(k => k.toLowerCase());
  
  if (highPriorityKeywords.some(keyword => 
    questionLower.includes(keyword) || keywordsLower.includes(keyword)
  )) {
    return 'high';
  }
  
  if (mediumPriorityKeywords.some(keyword => 
    questionLower.includes(keyword) || keywordsLower.includes(keyword)
  )) {
    return 'medium';
  }
  
  return 'low';
} 