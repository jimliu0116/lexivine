import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leaderboard = await prisma.$queryRawUnsafe(`
      SELECT u.name, SUM(p.score) as totalScore
      FROM "User" u
      JOIN "Progress" p ON u.id = p."userId"
      GROUP BY u.name
      ORDER BY totalScore DESC
      LIMIT 10
    `);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
