import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Buduj warunki wyszukiwania
    const where = {};
    
    if (search) {
      where.OR = [
        { from: { contains: search } },
        { subject: { contains: search } },
        { content: { contains: search } }
      ];
    }
    
    if (status !== 'all') {
      where.status = status;
    }

    // Pobierz emaile
    const emails = await prisma.email.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        conversation: {
          select: {
            id: true,
            language: true,
            sentiment: true,
            priority: true,
            purchaseProbability: true,
            escalated: true,
            topic: true,
            summary: true
          }
        }
      }
    });

    // Pobierz statystyki
    const stats = {
      total: await prisma.email.count(),
      new: await prisma.email.count({ where: { status: 'PENDING' } }),
      responded: await prisma.email.count({ where: { status: 'RESPONDED' } }),
      escalated: await prisma.email.count({ where: { status: 'ESCALATED' } }),
      processing: await prisma.email.count({ where: { status: 'PROCESSING' } })
    };

    return NextResponse.json({
      success: true,
      emails,
      stats,
      pagination: {
        page,
        limit,
        total: stats.total,
        pages: Math.ceil(stats.total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania emaili', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - usuwanie wszystkich emaili
export async function DELETE(request) {
  try {
    console.log('🗑️ Rozpoczynam usuwanie wszystkich emaili...');

    // Najpierw usuń wszystkie konwersacje (foreign key constraint)
    const deletedConversations = await prisma.conversation.deleteMany({});
    console.log(`🗑️ Usunięto ${deletedConversations.count} konwersacji`);

    // Następnie usuń wszystkie emaile
    const deletedEmails = await prisma.email.deleteMany({});
    console.log(`🗑️ Usunięto ${deletedEmails.count} emaili`);

    return NextResponse.json({
      success: true,
      message: `Pomyślnie usunięto ${deletedEmails.count} emaili i ${deletedConversations.count} konwersacji`,
      deletedEmails: deletedEmails.count,
      deletedConversations: deletedConversations.count
    });

  } catch (error) {
    console.error('❌ Błąd usuwania emaili:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Błąd usuwania emaili', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 