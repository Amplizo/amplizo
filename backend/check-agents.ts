import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const agents = await prisma.agent.findMany({ select: { email: true, role: true, status: true } });
  console.log(agents);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });