import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const password = "ChangeMeAgent2024!";
  const adminPassword = "ChangeMeAdmin2024!";
  
  const hashedAgentPassword = await argon2.hash(password);
  const hashedAdminPassword = await argon2.hash(adminPassword);
  
  // Update agent passwords
  await prisma.agent.updateMany({
    where: { email: { in: ["client@amplizo.com", "sarah@amplizo.com", "mike@amplizo.com"] } },
    data: { password: hashedAgentPassword }
  });
  
  // Update admin password
  await prisma.agent.update({
    where: { email: "admin@amplizo.com" },
    data: { password: hashedAdminPassword }
  });
  
  console.log("Passwords updated");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });