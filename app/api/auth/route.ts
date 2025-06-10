import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface AuthRequestBody {
  email?: unknown;
  password?: unknown;
}

export async function POST(request: Request) {
  try {
    let body: AuthRequestBody | undefined;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // const { email, password } = body; // Keep destructuring, but after validation

    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required and must be strings' },
        { status: 400 }
      );
    }

    const { email, password } = body; // Now body is known to be an object with string email/password

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('CRITICAL: JWT_SECRET is not defined in environment variables.');
      return NextResponse.json(
        { error: 'Authentication configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '8h' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}