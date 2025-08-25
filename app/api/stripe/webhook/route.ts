export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'import { NextRequest, NextResponse } from 'next/server';
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
            data: { stripeCustomerId: customerId, plan: 'PRO' }
          });

          await prisma.subscription.upsert({
            where: { userId: user.id },
            update: { status: 'active' },
            create: { userId: user.id, status: 'active', priceId: null }
          });

          await notify(email, '訂閱啟用成功', '感謝您的訂閱', '您的 Pro 訂閱已啟用。');
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status;
        const currentPeriodEnd = new Date((sub.current_period_end || 0) * 1000);
        const customerId = sub.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId }
        });

        if (user) {
          await prisma.subscription.updateMany({
            where: { userId: user.id },
            data: { status, currentPeriodEnd }
          });

          if (event.type === 'customer.subscription.deleted') {
            await prisma.user.update({
              where: { id: user.id },
              data: { plan: 'FREE' }
            });
          }

          const email = user.email;
          await notify(email, '訂閱狀態更新', '訂閱已更新', `目前狀態：${status}`);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: any) {
    console.error('Webhook handler error:', e);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
