import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
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
      total: await prisma.email.count({ where }),
      pending: await prisma.email.count({ where: { ...where, status: 'pending' } }),
      processed: await prisma.email.count({ where: { ...where, status: 'processed' } }),
      responded: await prisma.email.count({ where: { ...where, status: 'responded' } }),
      failed: await prisma.email.count({ where: { ...where, status: 'failed' } })
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
      { success: false, error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
} 