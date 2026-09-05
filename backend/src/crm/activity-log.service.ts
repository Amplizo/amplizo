import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(params: { clientId?: string; userId?: string; activityType: string; description: string; metadata?: any }) {
    return this.prisma.activityLog.create({
      data: {
        clientId: params.clientId,
        userId: params.userId,
        activityType: params.activityType,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  }

  async findByClient(clientId: string) {
    return this.prisma.activityLog.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
