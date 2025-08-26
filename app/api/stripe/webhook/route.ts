import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

export const config = { api: { bodyParser: false } };
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
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
          <h2 style="margin:0 0 12px">${title}</h2>
          <p>${body}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
          <p style="font-size:12px;color:#888">This email was sent automatically by LexiVine Billing.</p>
        </div>
      `,
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
            data: { email, name: email.split('@')[0] },
          });
        }

        if (user && customerId) {
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId },
          });
        }

        if (user) {
          await prisma.subscription.upsert({
            where: { userId: user.id },
            update: { plan: 'PRO', status: 'active' },
            create: { userId: user.id, plan: 'PRO', status: 'active' },
          });
        }

        await notify(email, '訂閱啟用成功', '感謝您的訂閱', '您的 Pro 訂閱已啟用。');
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const stripeSubId = sub.id as string;
        const status = sub.status as string;
        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : undefined;

        await prisma.subscription.updateMany({
          where: { stripeSubId },
          data: { status, ...(currentPeriodEnd ? { currentPeriodEnd } : {}) },
        });

        try {
          const c = (await stripe.customers.retrieve(sub.customer as string)) as any;
          const email = c?.email as string | undefined;
          await notify(email, '訂閱狀態更新', '訂閱已更新', `目前狀態：${status}`);
        } catch (e) {
          console.error('Fetch customer for notify failed:', e);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error('Webhook handler error:', e);
    return new NextResponse('Server Error', { status: 500 });
  }
}
