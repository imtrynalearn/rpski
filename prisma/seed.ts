import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const privateLesson = await prisma.lessonType.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Private Lesson",
      description: "One-on-one coaching tailored to your goals.",
      durationMin: 120,
      basePriceCents: 12000,
      groupMax: 2,
    },
  });

  const groupLesson = await prisma.lessonType.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Group Lesson",
      description: "Learn together in small groups.",
      durationMin: 120,
      basePriceCents: 8000,
      groupMax: 6,
    },
  });

  const now = new Date();
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const start1 = new Date(baseDate);
  start1.setHours(9, 0, 0, 0);
  const end1 = new Date(start1.getTime() + privateLesson.durationMin * 60000);

  await prisma.timeSlot.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      lessonTypeId: privateLesson.id,
      start: start1,
      end: end1,
      capacity: 2,
    },
  });

  const start2 = new Date(baseDate);
  start2.setHours(13, 0, 0, 0);
  const end2 = new Date(start2.getTime() + groupLesson.durationMin * 60000);

  await prisma.timeSlot.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      lessonTypeId: groupLesson.id,
      start: start2,
      end: end2,
      capacity: 6,
    },
  });

  console.log("Seeded lesson types and sample time slots.");
}

main().finally(async () => {
  await prisma.$disconnect();
});

