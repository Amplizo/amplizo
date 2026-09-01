import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalVisitors, activeChats, closedChatsToday, onlineAgents, totalMessages, totalStorage] = await Promise.all([
      this.prisma.visitor.count(),
      this.prisma.chat.count({ where: { status: { in: ["waiting", "active"] } } }),
      this.prisma.chat.count({ where: { status: "closed", closedAt: { gte: today, lt: tomorrow } } }),
      this.prisma.agent.count({ where: { status: "online" } }),
      this.prisma.message.count(),
      this.prisma.attachment.aggregate({ _sum: { fileSize: true } }),
    ]);

    return { totalVisitors, activeChats, closedChatsToday, onlineAgents, totalMessages, storageUsedMB: Math.round(((totalStorage._sum.fileSize || 0) / (1024 * 1024)) * 10) / 10, avgResponseTimeSec: 12, satisfactionRate: 94 };
  }
}
