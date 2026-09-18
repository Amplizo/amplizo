import { PrismaService } from "C:/Users/raman/retainx/backend/src/prisma/prisma.service";
import { ImportExportService } from "C:/Users/raman/retainx/backend/src/crm/import-export.service";

async function main() {
  const prisma = new PrismaService();
  const service = new ImportExportService(prisma);
  
  const actorId = "3266ce04-4451-4585-acab-1e4feafe8bf4";
  const isAdmin = false;
  
  try {
    const result = await service.exportCustomers(actorId, isAdmin, "csv", 0, 1000);
    console.log("CSV Export success!");
    console.log("Filename:", result.filename);
    console.log("MimeType:", result.mimeType);
    console.log("Buffer length:", result.buffer.length);
    console.log("First 500 chars:", result.buffer.toString().substring(0, 500));
  } catch (err: any) {
    console.error("Error:", err?.message);
    console.error("Stack:", err?.stack);
  }
  
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });