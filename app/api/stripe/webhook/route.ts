import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { billingEmailTemplate } from '@/lib/emailTemplates'
export const config = { api: { bodyParser: false } } as any
export async function POST(req: NextRequest){
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null const sig = req.headers.get('stripe-signature') as string; const text = await req.text(); let evt; try{ evt = stripe.webhooks.constructEvent(text, sig, process.env.STRIPE_WEBHOOK_SECRET as string) }catch(e: any){ return new NextResponse(`Webhook Error: ${e.message}`,{status:400}) } if(evt.type==='checkout.session.completed'){ const s = evt.data.object as any; const customerId = s.customer as string; const subId = s.subscription as string; const email = s.customer_details?.email as string; let user = email? await prisma.user.findUnique({ where: { email } }) : null; if(!user){ user = await prisma.user.create({ data: { email, name: email?.split('@')[0] } }) } await prisma.user.update({ where:{ id: user.id }, data: { stripeCustomerId: customerId } }); await prisma.subscription.upsert({ where: { userId: user.id }, update:{ stripeSubId: subId, plan: 'PRO', status: 'active' }, create:{ userId: user.id, stripeSubId: subId, plan: 'PRO', status: 'active' } });
  await notify(email, '訂閱啟用成功', '感謝您的訂閱', '您的 Pro 訂閱已啟用。'); }
 if(evt.type==='customer.subscription.updated' || evt.type==='customer.subscription.deleted'){ const sub = evt.data.object as any; const stripeSubId = sub.id as string; const status = sub.status as string; const currentPeriodEnd = new Date(sub.current_period_end*1000); await prisma.subscription.updateMany({ where:{ stripeSubId }, data:{ status, currentPeriodEnd } });
  const sub = evt.data.object as any; const c = await stripe.customers.retrieve(sub.customer as string) as any; const email = c?.email; await notify(email, '訂閱狀態更新', '訂閱已更新', `目前狀態：${status}`); }
 return NextResponse.json({ received: true }) }


// send billing email notifications
async function notify(email: string, subject: string, title: string, text: string){
  if(!resend || !email) return
  await resend.emails.send({ from: process.env.EMAIL_FROM as string, to: email, subject, html: billingEmailTemplate(subject, title, text) })
}
