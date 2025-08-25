import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
export async function POST(req: Request){ const { customerId } = await req.json(); if(!customerId) return new NextResponse('Missing customerId',{status:400}); const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${process.env.NEXTAUTH_URL}/` }); return NextResponse.json({ url: portal.url }) }
