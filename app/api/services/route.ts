import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch all services
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        feeStructure: true,
        _count: {
          select: {
            subscriptions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - Create a new service
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, feeStructure } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name,
        description: description || null
      }
    });

    // Create fee structure if provided
    if (feeStructure && feeStructure.amount) {
      await prisma.feeStructure.create({
        data: {
          amount: parseFloat(feeStructure.amount),
          billingCycle: feeStructure.billingCycle || 'MONTHLY',
          serviceId: service.id
        }
      });
    }

    // Fetch the complete service with fee structure
    const completeService = await prisma.service.findUnique({
      where: { id: service.id },
      include: {
        feeStructure: true,
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    return NextResponse.json(completeService, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
