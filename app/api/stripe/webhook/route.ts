import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { billingEmailTemplate } from '@/lib/emailTemplates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripeSecret = process.env.STRIPE_SECRET_KEY as string;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

const stripe = new Stripe(stripeSecret || '', { apiVersion: '2024-06-20' });
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function notify(to: string | null | undefined, subject: string, title: string, body: string) {
  if (!to || !resend) return;
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'no-reply@your-domain.com',
      to,
      subject,
      react: billingEmailTemplate({ title, body })
    });
  } catch (e) {
    console.error('Resend send error:', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get('stripe-signature') as string;
    const text = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(text, sig, webhookSecret);
    } catch (e: any) {
      return new NextResponse(`Webhook Error: ${e.message}`, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string | null;
        const email = session.customer_details?.email as string | undefined;

        let user = email ? await prisma.user.findUnique({ where: { email } }) : null;
        if (!user && email) {
          user = await prisma.user.create({
            data: { email, name: email.split('@')[0] }
          });
        }

        if (user && customerId) {
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId }
          });
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubId = sub.id;
        const status = sub.status;
        const currentPeriodEnd = new Date(sub.current_period_end * 1000);

        await prisma.subscription.updateMany({
          where: { stripeSubId },
          data: { status, currentPeriodEnd }
        });
        break;
      }
    }

    return new NextResponse('Webhook received', { status: 200 });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
