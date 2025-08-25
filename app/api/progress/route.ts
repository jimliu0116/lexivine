import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function POST(req: Request){ const b = await req.json(); if(!b.userId||!b.lessonId) return new NextResponse('Bad Request',{status:400}); const p = await prisma.progress.upsert({ where:{ userId_lessonId:{userId:b.userId,lessonId:b.lessonId} as any }, update:{ score:b.score??0, xp:{ increment:b.xp??0 } }, create:{ userId:b.userId, lessonId:b.lessonId, score:b.score??0, xp:b.xp??0 } }); return NextResponse.json(p) }
export async function GET(){ const rows = await prisma.progress.findMany({ take: 50, orderBy: { updatedAt: 'desc' } }); return NextResponse.json(rows) }
