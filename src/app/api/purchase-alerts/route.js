import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Pobierz alerty zakupowe
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let where = {};
    
    // Filter by status
    if (status === 'active') {
      where.isActive = true;
      where.isResolved = false;
    } else if (status === 'resolved') {
      where.isResolved = true;
    } else if (status === 'urgent') {
      where.isActive = true;
      where.isResolved = false;
      where.priority = 'URGENT';
    }
    
    // Filter by priority
    if (priority) {
      where.priority = priority;
    }

    // Get alerts with conversation details
    const alerts = await prisma.purchaseAlert.findMany({
      where,
      include: {
        conversation: {
          include: {
            email: {
              select: {
                subject: true,
                from: true,
                createdAt: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { readinessScore: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // Get statistics
    const stats = {
      urgent: await prisma.purchaseAlert.count({
        where: { isActive: true, isResolved: false, priority: 'URGENT' }
      }),
      high: await prisma.purchaseAlert.count({
        where: { isActive: true, isResolved: false, priority: 'HIGH' }
      }),
      medium: await prisma.purchaseAlert.count({
        where: { isActive: true, isResolved: false, priority: 'MEDIUM' }
      }),
      resolved: await prisma.purchaseAlert.count({
        where: { isResolved: true }
      }),
      totalValue: await prisma.purchaseAlert.aggregate({
        where: { isActive: true, isResolved: false },
        _sum: { estimatedValue: true }
      })
    };

    // Calculate average readiness score
    const avgScore = await prisma.purchaseAlert.aggregate({
      where: { isActive: true, isResolved: false },
      _avg: { readinessScore: true }
    });

    return NextResponse.json({
      alerts: alerts.map(alert => ({
        id: alert.id,
        conversationId: alert.conversationId,
        clientEmail: alert.clientEmail,
        alertType: alert.alertType,
        priority: alert.priority,
        readinessScore: alert.readinessScore,
        estimatedValue: alert.estimatedValue,
        estimatedCloseTime: alert.estimatedCloseTime,
        readySignals: JSON.parse(alert.readySignals || '[]'),
        immediateActions: JSON.parse(alert.immediateActions || '[]'),
        nextSteps: alert.nextSteps ? JSON.parse(alert.nextSteps) : null,
        isActive: alert.isActive,
        isResolved: alert.isResolved,
        notes: alert.notes,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt,
        // Email details
        email: alert.conversation?.email ? {
          subject: alert.conversation.email.subject,
          from: alert.conversation.email.from,
          createdAt: alert.conversation.email.createdAt
        } : null,
        // Conversation details
        conversation: {
          language: alert.conversation?.language,
          sentiment: alert.conversation?.sentiment,
          purchaseProbability: alert.conversation?.purchaseProbability
        }
      })),
      stats: {
        ...stats,
        totalValue: stats.totalValue._sum.estimatedValue || 0,
        averageScore: avgScore._avg.readinessScore || 0
      }
    });

  } catch (error) {
    console.error('Error fetching purchase alerts:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania alertów zakupowych' },
      { status: 500 }
    );
  }
}

// POST - Oznacz alert jako rozwiązany
export async function POST(request) {
  try {
    const { action, alertId, notes } = await request.json();

    if (action === 'resolve') {
      const alert = await prisma.purchaseAlert.update({
        where: { id: alertId },
        data: {
          isResolved: true,
          isActive: false,
          resolvedAt: new Date(),
          resolvedBy: 'manual', // In real app, this would be the user ID
          notes: notes || null
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Alert rozwiązany',
        alert 
      });
    }

    if (action === 'snooze') {
      const alert = await prisma.purchaseAlert.update({
        where: { id: alertId },
        data: {
          isActive: false,
          notes: notes || 'Snoozed by user',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Alert wstrzymany',
        alert 
      });
    }

    if (action === 'reactivate') {
      const alert = await prisma.purchaseAlert.update({
        where: { id: alertId },
        data: {
          isActive: true,
          isResolved: false,
          notes: notes || 'Reactivated by user',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Alert reaktywowany',
        alert 
      });
    }

    return NextResponse.json(
      { error: 'Nieznana akcja' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing purchase alert:', error);
    return NextResponse.json(
      { error: 'Błąd zarządzania alertem' },
      { status: 500 }
    );
  }
} 