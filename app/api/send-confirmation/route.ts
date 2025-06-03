import { NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/app/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await sendConfirmationEmail(email);

    return NextResponse.json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
