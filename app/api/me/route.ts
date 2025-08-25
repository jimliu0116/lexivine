import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(){
  const session = await auth()
  const email = (session as any)?.user?.email as string | undefined
  const user = email ? await prisma.user.findUnique({ where: { email }, include: { subscription: true, progress: true } }) : null
  const plan = user?.subscription?.plan || user?.plan || 'FREE'
  return NextResponse.json({ user: user ? { id: user.id, email: user.email, name: user.name } : null, plan, progress: user?.progress || [] })
}
