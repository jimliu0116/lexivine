import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(){ const rows = await prisma.$queryRawUnsafe(`SELECT u.name as name, u.email as email, SUM(p.xp) as xp FROM Progress p JOIN User u ON u.id=p.userId GROUP BY 1,2 ORDER BY xp DESC LIMIT 10`); return NextResponse.json(rows) }
