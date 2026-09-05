import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActivityLogService } from "./activity-log.service";

@Injectable()
export class ScheduledCallService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
  ) {}

  async create(data: {
    clientId: string;
    phone: string;
    scheduledDate: string;
    notes?: string;
  }, actorId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: data.clientId },
      select: { id: true, name: true, assignedEmployeeId: true },
    });
    if (!client) throw new NotFoundException("Customer not found");
    if (client.assignedEmployeeId && client.assignedEmployeeId !== actorId) {
      throw new BadRequestException("You can only schedule calls for your assigned customers");
    }

    const scheduled = await this.prisma.scheduledCall.create({
      data: {
        clientId: data.clientId,
        assignedEmployeeId: actorId,
        phone: data.phone.replace(/[^0-9]/g, ""),
        scheduledDate: new Date(data.scheduledDate),
        notes: data.notes?.trim() || null,
      },
    });

    await this.activityLog.log({
      clientId: data.clientId,
      userId: actorId,
      activityType: "CALL_SCHEDULED",
      description: `Call scheduled with ${client.name} for ${new Date(data.scheduledDate).toLocaleString("en-IN")}`,
      metadata: JSON.stringify({ scheduledCallId: scheduled.id, phone: scheduled.phone, notes: scheduled.notes }),
    });

    return scheduled;
  }

  async findAll(actorId: string, isAdmin: boolean) {
    const where: any = {};
    if (!isAdmin) {
      where.assignedEmployeeId = actorId;
    }

    return this.prisma.scheduledCall.findMany({
      where,
      orderBy: { scheduledDate: "asc" },
      include: {
        client: { select: { id: true, name: true, phone: true, city: true, currentLeadStatus: true, status: true } },
        assignedEmployee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getStats(actorId: string, isAdmin: boolean) {
    const baseWhere: any = isAdmin ? {} : { assignedEmployeeId: actorId };
    const now = new Date();
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [pending, todayDue] = await Promise.all([
      this.prisma.scheduledCall.count({ where: { ...baseWhere, status: "PENDING" } }),
      this.prisma.scheduledCall.count({
        where: { ...baseWhere, status: "PENDING", scheduledDate: { lte: todayEnd } },
      }),
    ]);

    return { pending, todayDue };
  }
}
