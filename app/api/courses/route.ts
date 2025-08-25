import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(){ const data = await prisma.course.findMany({ include: { lessons: true } }); return NextResponse.json(data) }
export async function POST(req: Request){ const b = await req.json(); if(!b.title||!b.level) return new NextResponse('Bad Request',{status:400}); const c = await prisma.course.create({ data: { title:b.title, level:b.level, difficulty:b.difficulty||'Beginner', isPremium: !!b.isPremium } }); return NextResponse.json(c) }
