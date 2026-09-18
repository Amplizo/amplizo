import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const client = await prisma.agent.findUnique({ where: { email: "client@amplizo.com" } });
  console.log("Client hash:", client?.password?.substring(0, 50));
  
  const passwords = ["ChangeMeAgent2024!", "agent", "client", "client123", "agent123", "test", "test123", "123456", "password123"];
  for (const p of passwords) {
    if (client) console.log("Client try:", p, await argon2.verify(client.password, p));
  }
  await prisma.$disconnect();
}

main().catch(console.error);