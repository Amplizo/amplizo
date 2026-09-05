import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await argon2.hash("admin123");
  const agentPassword = await argon2.hash("agent123");

  await prisma.agent.upsert({ where: { email: "admin@amplizo.com" }, update: {}, create: { name: "Admin User", email: "admin@amplizo.com", password: adminPassword, role: "admin", status: "offline" } });
  await prisma.agent.upsert({ where: { email: "client@amplizo.com" }, update: {}, create: { name: "Test Client", email: "client@amplizo.com", password: agentPassword, role: "agent", status: "offline" } });
  await prisma.agent.upsert({ where: { email: "sarah@amplizo.com" }, update: {}, create: { name: "Sarah Johnson", email: "sarah@amplizo.com", password: agentPassword, role: "agent", status: "offline" } });
  await prisma.agent.upsert({ where: { email: "mike@amplizo.com" }, update: {}, create: { name: "Mike Chen", email: "mike@amplizo.com", password: agentPassword, role: "agent", status: "offline" } });

  const sampleClients = [
    { name: "Rahul Verma", email: "rahul@company.com", phone: "+91 98765 43210", city: "Mumbai", plan: "Pro", status: "Active", chats: 45, satisfaction: 98 },
    { name: "Priya Sharma", email: "priya@business.in", phone: "+91 87654 32109", city: "Delhi", plan: "Business", status: "Active", chats: 89, satisfaction: 96 },
    { name: "Amit Kumar", email: "amit@startup.io", phone: "+91 76543 21098", city: "Bangalore", plan: "Pro", status: "Active", chats: 23, satisfaction: 94 },
    { name: "Neha Patel", email: "neha@enterprise.com", phone: "+91 65432 10987", city: "Ahmedabad", plan: "Starter", status: "Trial", chats: 8, satisfaction: 92 },
    { name: "Vikram Singh", email: "vikram@corp.in", phone: "+91 54321 09876", city: "Jaipur", plan: "Business", status: "Active", chats: 156, satisfaction: 97 },
    { name: "Anita Desai", email: "anita@tech.co", phone: "+91 43210 98765", city: "Pune", plan: "Pro", status: "Active", chats: 67, satisfaction: 95 },
    { name: "Suresh Reddy", email: "suresh@digital.in", phone: "+91 32109 87654", city: "Hyderabad", plan: "Business", status: "Active", chats: 234, satisfaction: 99 },
    { name: "Meera Joshi", email: "meera@innovate.com", phone: "+91 21098 76543", city: "Chennai", plan: "Starter", status: "Trial", chats: 12, satisfaction: 88 },
  ];

  for (const client of sampleClients) {
    await prisma.client.upsert({ where: { email: client.email }, update: {}, create: client });
  }

  const sampleNotifications = [
    { type: "message", title: "New message from Rahul", message: "Rahul Verma sent you a message regarding pricing plans", read: false },
    { type: "order", title: "New order received - ₹25,000", message: "Order #ORD-5678 has been placed by Priya Sharma", read: false },
    { type: "user", title: "New client registered", message: "Amit Kumar has registered as a new client on the Pro plan", read: true },
    { type: "alert", title: "Follow-up overdue for Amit", message: "You have a scheduled follow-up with Amit Kumar that is now overdue", read: false },
    { type: "info", title: "System update completed", message: "The system has been updated to version 1.2.0 with new features", read: true },
    { type: "chat", title: "New chat assigned", message: "A new chat has been assigned to you from Neha Patel", read: false },
    { type: "client", title: "Client plan upgraded", message: "Vikram Singh has upgraded to Business plan", read: true },
  ];

  await prisma.notification.deleteMany({});
  for (const notif of sampleNotifications) {
    await prisma.notification.create({ data: notif });
  }

  // Seed WhatsApp phone-number -> tenant (agent) mapping.
  // The "123456789" phone_number_id is the default test/business number used by the
  // /api/whatsapp/webhook mock payloads and config. Routing unassigned leads to the
  // test client agent keeps the existing "matched customer" test path working.
  const clientAgent = await prisma.agent.findUnique({ where: { email: "client@amplizo.com" } });
  if (clientAgent) {
    await prisma.whatsAppPhoneAssignment.upsert({
      where: { phoneNumberId: "123456789" },
      update: { ownerAgentId: clientAgent.id, label: "Default Test Business Number" },
      create: { phoneNumberId: "123456789", ownerAgentId: clientAgent.id, label: "Default Test Business Number" },
    });
  }

  console.log("Seed complete:");
  console.log("  Admin Login: admin@amplizo.com / admin123");
  console.log("  Client Login: client@amplizo.com / agent123");
  console.log("  Agent Login: sarah@amplizo.com / agent123");
  console.log("  Agent Login: mike@amplizo.com / agent123");
  console.log(`  ${sampleClients.length} sample clients added`);
  console.log(`  ${sampleNotifications.length} sample notifications added`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
