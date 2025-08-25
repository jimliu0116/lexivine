import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
export async function POST(req: Request){ const { priceId, customerId } = await req.json(); if(!priceId) return new NextResponse('Missing priceId',{status:400}); const session = await stripe.checkout.sessions.create({ mode:'subscription', customer: customerId, line_items:[{ price: priceId, quantity:1 }], success_url: `${process.env.NEXTAUTH_URL}/?success=1`, cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=1` }); return NextResponse.json({ url: session.url }) }
