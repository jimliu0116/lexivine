const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient();
async function main(){
  const a1 = await prisma.course.create({ data: { title: '新手入門', level: 'A1', difficulty: 'Beginner', isPremium: false }})
  const l1 = await prisma.lesson.create({ data: { title: '自我介紹', order: 1, courseId: a1.id } })
  await prisma.exercise.create({ data: { type: 'dialog', lessonId: l1.id, content: { prompt: 'Introduce yourself in 4 sentences.' } } })
  await prisma.exercise.create({ data: { type: 'quiz', lessonId: l1.id, content: { questions: [{ q:'Choose the correct be verb: I __ a student.', options:['am','is','are'], a:0 }] } } })

  const b1 = await prisma.course.create({ data: { title: '職場英文', level: 'B1', difficulty: 'Intermediate', isPremium: true }})
  const l2 = await prisma.lesson.create({ data: { title: '會議簡報', order: 1, courseId: b1.id, minScoreToUnlock: 60 } })
  await prisma.exercise.create({ data: { type: 'grammar', lessonId: l2.id, content: { rule: 'Present Simple vs Present Continuous' } } })

  // sample users + progress
  const u1 = await prisma.user.create({ data: { email:'amy@example.com', name:'Amy' } })
  const u2 = await prisma.user.create({ data: { email:'ben@example.com', name:'Ben' } })
  await prisma.progress.createMany({ data: [
    { userId: u1.id, lessonId: l1.id, score: 85, xp: 120 },
    { userId: u2.id, lessonId: l1.id, score: 78, xp: 90  },
  ]})
}
main().finally(()=>prisma.$disconnect())
