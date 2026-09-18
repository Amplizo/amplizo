const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const msgs = await prisma.whatsAppMessage.findMany({
    orderBy: { sentAt: 'desc' },
    take: 10,
    include: { conversation: true }
  });
  console.log('WhatsAppMessages:', JSON.stringify(msgs, null, 2));
  
  const convs = await prisma.whatsAppConversation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('WhatsAppConversations:', JSON.stringify(convs, null, 2));
  
  const events = await prisma.whatsAppWebhookEvent.findMany({
    orderBy: { receivedAt: 'desc' },
    take: 5
  });
  console.log('WhatsAppWebhookEvents:', JSON.stringify(events, null, 2));
  
  const customers = await prisma.client.findMany({
    where: { phone: { contains: '7033025286' } },
    take: 5
  });
  console.log('Customers with matching phone:', JSON.stringify(customers, null, 2));
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });