import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { emailId } = params;

    // Get the conversation for this email
    const conversation = await prisma.conversation.findFirst({
      where: {
        emailId: emailId
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        },
        email: {
          select: {
            id: true,
            from: true,
            to: true,
            subject: true,
            content: true,
            response: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Konwersacja nie została znaleziona' },
        { status: 404 }
      );
    }

    // Add some analytics
    const analytics = {
      messageCount: conversation.messages.length,
      hasAIResponse: !!conversation.email.response,
      conversationDuration: conversation.messages.length > 1 
        ? new Date(conversation.messages[conversation.messages.length - 1].timestamp) - new Date(conversation.messages[0].timestamp)
        : 0,
      lastActivity: conversation.messages.length > 0 
        ? conversation.messages[conversation.messages.length - 1].timestamp
        : conversation.createdAt
    };

    return NextResponse.json({
      ...conversation,
      analytics
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania konwersacji' },
      { status: 500 }
    );
  }
} 