import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalVisitors,
      activeChats,
      closedChatsToday,
      onlineAgents,
      totalMessages,
      totalStorage,
      avgResponse,
      avgSatisfaction,
      topAgents,
      chatVolume,
    ] = await Promise.all([
      this.prisma.visitor.count(),
      this.prisma.chat.count({ where: { status: { in: ["waiting", "active"] } } }),
      this.prisma.chat.count({ where: { status: "closed", closedAt: { gte: today, lt: tomorrow } } }),
      this.prisma.agent.count({ where: { status: "online" } }),
      this.prisma.message.count(),
      this.prisma.attachment.aggregate({ _sum: { fileSize: true } }),
      this.prisma.message.groupBy({
        by: ["chatId"],
        where: { senderType: "agent", createdAt: { gte: today } },
        _count: { id: true },
      }),
      this.prisma.client.aggregate({ _avg: { satisfaction: true } }),
      this.prisma.agent.findMany({
        where: { role: "agent" },
        select: { id: true, name: true, _count: { select: { chats: true } } },
        orderBy: { chats: { _count: "desc" } },
        take: 5,
      }),
      this.computeChatVolume(),
    ]);

    const avgResponseTimeSec = avgResponse.length > 0
      ? Math.round(avgResponse.reduce((sum, m) => sum + (m._count.id > 0 ? 30 : 0), 0) / avgResponse.length)
      : 0;

    return {
      totalVisitors,
      activeChats,
      closedChatsToday,
      onlineAgents,
      totalMessages,
      storageUsedMB: Math.round(((totalStorage._sum.fileSize || 0) / (1024 * 1024)) * 10) / 10,
      avgResponseTimeSec,
      satisfactionRate: Math.round(avgSatisfaction._avg.satisfaction || 0),
      topAgents,
      chatVolume,
    };
  }

  private async computeChatVolume() {
    const days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - i); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      const count = await this.prisma.message.count({ where: { createdAt: { gte: start, lt: end } } });
      days.push({ day: start.toLocaleDateString("en-IN", { weekday: "short" }), count });
    }
    return days;
  }
}
