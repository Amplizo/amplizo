import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActivityLogService } from "./activity-log.service";

const FOLLOW_UP_OFFSETS = [
  { number: 1, days: 3 },
  { number: 2, days: 7 },
  { number: 3, days: 15 },
];

@Injectable()
export class PurchaseService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
  ) {}

  async create(data: {
    clientId: string;
    purchaseAmount: number;
    productDetails?: string;
    purchaseDate?: Date;
  }, actorId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) throw new NotFoundException("Customer not found");
    if (!data.purchaseAmount || data.purchaseAmount <= 0) {
      throw new BadRequestException("Purchase amount must be greater than 0");
    }

    const purchaseDate = data.purchaseDate || new Date();

    const activeCycles = await this.prisma.followUpCycle.findMany({
      where: { clientId: data.clientId, status: "ACTIVE" },
      include: { followUps: true },
    });
    for (const cycle of activeCycles) {
      await this.prisma.followUp.updateMany({
        where: { cycleId: cycle.id, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
      await this.prisma.followUpCycle.update({
        where: { id: cycle.id },
        data: { status: "CANCELLED", cancelledReason: "New Purchase" },
      });
    }

    const purchase = await this.prisma.purchase.create({
      data: {
        clientId: data.clientId,
        purchaseAmount: data.purchaseAmount,
        productDetails: data.productDetails,
        purchaseDate,
        createdById: actorId,
      },
    });

    const cycle = await this.prisma.followUpCycle.create({
      data: {
        clientId: data.clientId,
        purchaseId: purchase.id,
        status: "ACTIVE",
      },
    });

    const followUps = await Promise.all(
      FOLLOW_UP_OFFSETS.map((offset) => {
        const scheduledDate = new Date(purchaseDate);
        scheduledDate.setDate(scheduledDate.getDate() + offset.days);
        scheduledDate.setHours(10, 0, 0, 0);
        return this.prisma.followUp.create({
          data: {
            cycleId: cycle.id,
            clientId: data.clientId,
            purchaseId: purchase.id,
            followUpNumber: offset.number,
            scheduledDate,
            status: "PENDING",
            assignedEmployeeId: client.assignedEmployeeId,
          },
        });
      }),
    );

    await this.activityLog.log({
      clientId: data.clientId,
      userId: actorId,
      activityType: "PURCHASE_CREATED",
      description: `Purchase created for ₹${data.purchaseAmount.toLocaleString("en-IN")}${data.productDetails ? ` (${data.productDetails})` : ""}`,
      metadata: { purchaseId: purchase.id, amount: data.purchaseAmount },
    });

    if (activeCycles.length > 0) {
      await this.activityLog.log({
        clientId: data.clientId,
        userId: actorId,
        activityType: "FOLLOWUP_CANCELLED",
        description: `${activeCycles.length} previous follow-up cycle(s) cancelled due to new purchase`,
        metadata: { cancelledCycleIds: activeCycles.map((c) => c.id) },
      });
    }

    await this.activityLog.log({
      clientId: data.clientId,
      userId: actorId,
      activityType: "FOLLOWUP_CREATED",
      description: `New follow-up cycle created with 3 follow-ups (3, 7, 15 days)`,
      metadata: { cycleId: cycle.id, followUpIds: followUps.map((f) => f.id) },
    });

    return { purchase, cycle, followUps };
  }

  async findByClient(clientId: string) {
    return this.prisma.purchase.findMany({
      where: { clientId },
      orderBy: { purchaseDate: "desc" },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.purchase.findUnique({
      where: { id },
      include: { client: true, createdBy: { select: { id: true, name: true } } },
    });
  }

  async getSalesStats(actorId: string, isAdmin: boolean) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const baseClientWhere: any = isAdmin ? {} : { assignedEmployeeId: actorId };
    const clientIds = await this.prisma.client.findMany({ where: baseClientWhere, select: { id: true } });
    const ids = clientIds.map((c) => c.id);

    const [totalSales, todaySales, todayPurchaseCount, totalPurchaseCount] = await Promise.all([
      this.prisma.purchase.aggregate({
        where: { clientId: { in: ids } },
        _sum: { purchaseAmount: true },
      }),
      this.prisma.purchase.aggregate({
        where: { clientId: { in: ids }, purchaseDate: { gte: todayStart, lte: todayEnd } },
        _sum: { purchaseAmount: true },
      }),
      this.prisma.purchase.count({
        where: { clientId: { in: ids }, purchaseDate: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.purchase.count({ where: { clientId: { in: ids } } }),
    ]);

    return {
      totalSales: totalSales._sum.purchaseAmount || 0,
      todaySales: todaySales._sum.purchaseAmount || 0,
      todayPurchaseCount,
      totalPurchaseCount,
    };
  }
}
