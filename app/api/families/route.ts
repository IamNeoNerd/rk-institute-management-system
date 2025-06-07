import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all families
export async function GET() {
  try {
    const families = await prisma.family.findMany({
      include: {
        students: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            students: true,
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(families);
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json(
      { error: 'Failed to fetch families' },
      { status: 500 }
    );
  }
}

// POST - Create a new family
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, phone, email, discountAmount } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Family name is required' },
        { status: 400 }
      );
    }

    // Create family
    const family = await prisma.family.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            students: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    );
  }
}
