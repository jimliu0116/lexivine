import { NextResponse } from 'next/server'
export async function GET(){
  return NextResponse.json({
    PRO: process.env.STRIPE_PRICE_PRO || null,
    PLUS: process.env.STRIPE_PRICE_PLUS || null,
    TEAM: process.env.STRIPE_PRICE_TEAM || null,
  })
}
