import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    agentId?: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    metadata?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        agentId: data.agentId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
      },
    });
  }

  async createForAgent(agentId: string, data: Omit<Parameters<typeof this.create>[0], "agentId">) {
    return this.create({ ...data, agentId });
  }

  async findMany(params: { agentId?: string; unreadOnly?: boolean; skip?: number; take?: number }) {
    const where: any = {};
    if (params.agentId) where.agentId = params.agentId;
    if (params.unreadOnly) where.read = false;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip || 0,
        take: params.take || 20,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { items, total, skip: params.skip || 0, take: params.take || 20 };
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllAsRead(agentId: string) {
    return this.prisma.notification.updateMany({ where: { agentId, read: false }, data: { read: true } });
  }

  async delete(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  async deleteRead(agentId: string) {
    return this.prisma.notification.deleteMany({ where: { agentId, read: true } });
  }

  async getUnreadCount(agentId: string) {
    return this.prisma.notification.count({ where: { agentId, read: false } });
  }
}
