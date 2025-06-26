import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let where = { isActive: true };
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    const knowledge = await prisma.knowledgeBase.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    return NextResponse.json(
      { error: 'Błąd pobierania bazy wiedzy' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { title, content, category, tags } = await request.json();

    console.log('POST /api/knowledge - dane:', { title, content, category, tags });

    const knowledge = await prisma.knowledgeBase.create({
      data: {
        title,
        content,
        category,
        tags: JSON.stringify(tags || [])
      }
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error('Błąd w POST /api/knowledge:', error);
    return NextResponse.json(
      { error: 'Błąd dodawania do bazy wiedzy', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, title, content, category, tags, isActive } = await request.json();

    console.log('PUT /api/knowledge - dane:', { id, title, content, category, tags, isActive });

    const knowledge = await prisma.knowledgeBase.update({
      where: { id },
      data: {
        title,
        content,
        category,
        tags: JSON.stringify(tags || []),
        isActive: isActive ?? true
      }
    });

    console.log('PUT /api/knowledge - zaktualizowano:', knowledge);
    return NextResponse.json(knowledge);
  } catch (error) {
    console.error('Błąd w PUT /api/knowledge:', error);
    return NextResponse.json(
      { error: 'Błąd aktualizacji bazy wiedzy', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await prisma.knowledgeBase.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Błąd usuwania z bazy wiedzy' },
      { status: 500 }
    );
  }
} 