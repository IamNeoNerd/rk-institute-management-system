import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch a specific family
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const family = await prisma.family.findUnique({
      where: { id: params.id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            students: true,
            users: true
          }
        }
      }
    });

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    return NextResponse.json(family);
  } catch (error) {
    console.error('Error fetching family:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family' },
      { status: 500 }
    );
  }
}

// PUT - Update a family
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Update family
    const family = await prisma.family.update({
      where: { id: params.id },
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : 0
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            students: true,
            users: true
          }
        }
      }
    });

    return NextResponse.json(family);
  } catch (error) {
    console.error('Error updating family:', error);
    return NextResponse.json(
      { error: 'Failed to update family' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a family
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if family has students
    const studentCount = await prisma.student.count({
      where: { familyId: params.id }
    });

    if (studentCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete family with existing students. Please delete students first.'
        },
        { status: 400 }
      );
    }

    // Delete the family
    await prisma.family.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Family deleted successfully' });
  } catch (error) {
    console.error('Error deleting family:', error);
    return NextResponse.json(
      { error: 'Failed to delete family' },
      { status: 500 }
    );
  }
}
