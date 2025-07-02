import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch a specific service
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        feeStructure: true,
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT - Update a service
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Update service
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null
      }
    });

    // Handle fee structure update
    if (feeStructure) {
      const existingFeeStructure = await prisma.feeStructure.findUnique({
        where: { serviceId: params.id }
      });

      if (existingFeeStructure) {
        // Update existing fee structure
        await prisma.feeStructure.update({
          where: { serviceId: params.id },
          data: {
            amount: parseFloat(feeStructure.amount),
            billingCycle: feeStructure.billingCycle || 'MONTHLY'
          }
        });
      } else if (feeStructure.amount) {
        // Create new fee structure
        await prisma.feeStructure.create({
          data: {
            amount: parseFloat(feeStructure.amount),
            billingCycle: feeStructure.billingCycle || 'MONTHLY',
            serviceId: params.id
          }
        });
      }
    }

    // Fetch updated service with all relations
    const updatedService = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        feeStructure: true,
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if service has active subscriptions
    const subscriptionCount = await prisma.studentSubscription.count({
      where: {
        serviceId: params.id,
        endDate: null // Active subscriptions
      }
    });

    if (subscriptionCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete service with active student subscriptions' },
        { status: 400 }
      );
    }

    // Delete fee structure first (if exists)
    await prisma.feeStructure.deleteMany({
      where: { serviceId: params.id }
    });

    // Delete the service
    await prisma.service.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
