import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the agent
  const agent = await prisma.agent.findUnique({ where: { email: "client@amplizo.com" } });
  console.log("Agent:", agent?.id, agent?.email);
  
  // Find customers assigned to this agent
  const customers = await prisma.client.findMany({
    where: { assignedEmployeeId: agent?.id },
    include: {
      purchases: { orderBy: { purchaseDate: "desc" } },
      assignedEmployee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  
  console.log("Customers count:", customers.length);
  customers.forEach(c => console.log(`  - ${c.name} (${c.phone}) - ${c.city} - ${c.status} - Purchases: ${c.purchases.length}`));
  
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });