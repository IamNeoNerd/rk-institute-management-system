import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return NextResponse.json({ 
        message: 'If your email is registered, you will receive a password reset link' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store token in database (you'll need to add these fields to the User model)
    // For now, we'll just simulate this step
    console.log(`Reset token for ${email}: ${resetToken}`);

    // Send email with reset link
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `Please use the following link to reset your password: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
    });

    return NextResponse.json({ 
      message: 'If your email is registered, you will receive a password reset link' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}