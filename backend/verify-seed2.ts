import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.agent.findUnique({ where: { email: "admin@amplizo.com" } });
  const client = await prisma.agent.findUnique({ where: { email: "client@amplizo.com" } });
  console.log("Admin hash:", admin?.password?.substring(0, 30));
  console.log("Client hash:", client?.password?.substring(0, 30));
  
  const passwords = ["ChangeMeAdmin2024!", "ChangeMeAgent2024!", "admin", "password", "admin123", "amplizo", "Amplizo123"];
  for (const p of passwords) {
    if (admin) console.log("Admin try:", p, await argon2.verify(admin.password, p));
    if (client) console.log("Client try:", p, await argon2.verify(client.password, p));
  }
  await prisma.$disconnect();
}

main().catch(console.error);