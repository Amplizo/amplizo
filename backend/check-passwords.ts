import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const agents = await prisma.agent.findMany({ 
    select: { 
      email: true, 
      role: true, 
      status: true,
      password: true
    } 
  });
  agents.forEach(a => {
    console.log(`Email: ${a.email}, Role: ${a.role}, Status: ${a.status}, Password: ${a.password.substring(0, 50)}...`);
  });
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });