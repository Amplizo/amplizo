import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await argon2.hash("admin123");
  const agentPassword = await argon2.hash("agent123");

  await prisma.agent.upsert({ where: { email: "admin@amplizo.com" }, update: {}, create: { name: "Admin User", email: "admin@amplizo.com", password: adminPassword, role: "admin", status: "offline" } });
  await prisma.agent.upsert({ where: { email: "sarah@amplizo.com" }, update: {}, create: { name: "Sarah Johnson", email: "sarah@amplizo.com", password: agentPassword, role: "agent", status: "offline" } });
  await prisma.agent.upsert({ where: { email: "mike@amplizo.com" }, update: {}, create: { name: "Mike Chen", email: "mike@amplizo.com", password: agentPassword, role: "agent", status: "offline" } });

  console.log("Seed complete:");
  console.log("  admin@amplizo.com / admin123");
  console.log("  sarah@amplizo.com / agent123");
  console.log("  mike@amplizo.com / agent123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
