import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.agent.findUnique({ where: { email: "admin@amplizo.com" } });
  const client = await prisma.agent.findUnique({ where: { email: "client@amplizo.com" } });
  console.log("Admin:", admin ? { email: admin.email, role: admin.role, hasPassword: !!admin.password } : "NOT FOUND");
  console.log("Client:", client ? { email: client.email, role: client.role, hasPassword: !!client.password } : "NOT FOUND");
  
  if (admin) {
    const valid = await argon2.verify(admin.password, "ChangeMeAdmin2024!");
    console.log("Admin password valid:", valid);
  }
  if (client) {
    const valid = await argon2.verify(client.password, "ChangeMeAgent2024!");
    console.log("Client password valid:", valid);
  }
  await prisma.$disconnect();
}

main().catch(console.error);