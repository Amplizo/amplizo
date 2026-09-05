import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActivityLogService } from "./activity-log.service";
import { PurchaseService } from "./purchase.service";

export const LEAD_STATUSES = ["NEW", "HOT_LEAD", "COLD_LEAD", "NOT_INTERESTED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
    private purchaseService: PurchaseService,
  ) {}

  async findAll(params: {
    search?: string;
    leadStatus?: string;
    status?: string;
    plan?: string;
    isNew?: boolean;
    assignedEmployeeId?: string;
    city?: string;
    skip?: number;
    take?: number;
    actorId: string;
    isAdmin: boolean;
  }) {
    const { search, leadStatus, status, plan, isNew, assignedEmployeeId, city, skip = 0, take = 50, actorId, isAdmin } = params;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
      ];
    }
    if (leadStatus) where.currentLeadStatus = leadStatus;
    if (status) where.status = status;
    if (plan) where.plan = plan;
    if (isNew) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      where.createdAt = { gte: todayStart, lte: todayEnd };
    }
    if (city) where.city = city;
    if (!isAdmin) {
      where.assignedEmployeeId = actorId;
    } else if (assignedEmployeeId) {
      where.assignedEmployeeId = assignedEmployeeId;
    }

    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: {
          assignedEmployee: { select: { id: true, name: true, email: true } },
          purchases: {
            orderBy: { purchaseDate: "desc" },
            take: 1,
            select: { id: true, purchaseAmount: true, productDetails: true, purchaseDate: true },
          },
          followUps: {
            where: { status: "PENDING" },
            orderBy: { scheduledDate: "asc" },
            take: 1,
            include: { cycle: true },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    const ids = items.map((c) => c.id);
    const totalsMap = new Map<string, number>();
    const countsMap = new Map<string, number>();
    if (ids.length > 0) {
      const aggregates = await this.prisma.purchase.groupBy({
        by: ["clientId"],
        where: { clientId: { in: ids } },
        _sum: { purchaseAmount: true },
        _count: { _all: true },
      });
      for (const a of aggregates) {
        totalsMap.set(a.clientId, Number(a._sum.purchaseAmount || 0));
        countsMap.set(a.clientId, a._count._all);
      }
    }
    const enriched = items.map((c) => ({
      ...c,
      totalSpent: totalsMap.get(c.id) || 0,
      purchaseCount: countsMap.get(c.id) || 0,
    }));

    return { items: enriched, total, skip, take };
  }

  async findOne(id: string, actorId: string, isAdmin: boolean) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        assignedEmployee: { select: { id: true, name: true, email: true } },
        purchases: { orderBy: { purchaseDate: "desc" }, include: { createdBy: { select: { id: true, name: true } } } },
        followUpCycles: {
          orderBy: { createdAt: "desc" },
          include: {
            followUps: { orderBy: { followUpNumber: "asc" }, include: { assignedEmployee: { select: { id: true, name: true } } } },
          },
        },
        activityLogs: { orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { id: true, name: true } } } },
        assignments: {
          orderBy: { assignedAt: "desc" },
          include: { employee: { select: { id: true, name: true, email: true } }, assignedBy: { select: { id: true, name: true } } },
        },
        chatThreads: { orderBy: { updatedAt: "desc" }, take: 5 },
      },
    });
    if (!client) throw new NotFoundException("Customer not found");
    if (!isAdmin && client.assignedEmployeeId !== actorId) {
      throw new NotFoundException("Customer not found");
    }
    return client;
  }

  async create(data: {
    name: string;
    phone?: string;
    email?: string;
    city?: string;
    source?: string;
    notes?: string;
    purchaseAmount?: number;
    productDetails?: string;
    assignedEmployeeId?: string | null;
  }, actorId: string) {
    if (!data.name || !data.phone) {
      throw new BadRequestException("Name and mobile number are required");
    }

    const cleanedPhone = data.phone.replace(/[^0-9]/g, "");
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      throw new BadRequestException("Invalid mobile number");
    }
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) throw new BadRequestException("Invalid email format");
    }

    let client = await this.prisma.client.findUnique({ where: { phone: cleanedPhone } });
    let isReturning = false;
    if (client) {
      isReturning = true;
      const updateData: any = {};
      if (data.name && data.name !== client.name) updateData.name = data.name;
      if (data.email && data.email !== client.email) updateData.email = data.email;
      if (data.city && !client.city) updateData.city = data.city;
      if (data.source && !client.source) updateData.source = data.source;
      if (data.notes && !client.notes) updateData.notes = data.notes;
      if (!client.assignedEmployeeId && data.assignedEmployeeId !== undefined) {
        updateData.assignedEmployeeId = data.assignedEmployeeId;
      }
      if (Object.keys(updateData).length > 0) {
        client = await this.prisma.client.update({
          where: { id: client.id },
          data: updateData,
        });
      }
    } else {
      const assignedEmployeeId = data.assignedEmployeeId ?? actorId;
      client = await this.prisma.client.create({
        data: {
          name: data.name,
          phone: cleanedPhone,
          email: data.email,
          city: data.city,
          source: data.source || "Direct",
          notes: data.notes,
          assignedEmployeeId,
        },
      });
      await this.activityLog.log({
        clientId: client.id,
        userId: actorId,
        activityType: "CUSTOMER_CREATED",
        description: `Customer ${data.name} was created`,
      });
    }

    return { client, isReturning, cleanedPhone };
  }

  async update(id: string, data: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    source?: string;
    notes?: string;
    status?: string;
    currentLeadStatus?: string;
    assignedEmployeeId?: string | null;
  }, actorId: string, isAdmin: boolean) {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Customer not found");
    if (!isAdmin && existing.assignedEmployeeId !== actorId) {
      throw new BadRequestException("You can only update your assigned customers");
    }
    if (data.currentLeadStatus && !LEAD_STATUSES.includes(data.currentLeadStatus as LeadStatus)) {
      throw new BadRequestException(`Invalid lead status. Must be one of: ${LEAD_STATUSES.join(", ")}`);
    }
    if (data.phone) {
      const cleaned = data.phone.replace(/[^0-9]/g, "");
      if (cleaned.length < 10 || cleaned.length > 15) {
        throw new BadRequestException("Invalid phone number");
      }
      data.phone = cleaned;
    }
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) throw new BadRequestException("Invalid email format");
    }
    const safeData: any = { ...data };
    if (!isAdmin && "assignedEmployeeId" in safeData) {
      delete safeData.assignedEmployeeId;
    }
    const updated = await this.prisma.client.update({ where: { id }, data: safeData });
    if (data.currentLeadStatus && data.currentLeadStatus !== existing.currentLeadStatus) {
      await this.activityLog.log({
        clientId: id,
        userId: actorId,
        activityType: "LEAD_STATUS_CHANGED",
        description: `Lead status changed from ${existing.currentLeadStatus} to ${data.currentLeadStatus}`,
      });
    }
    if (safeData.assignedEmployeeId !== undefined && safeData.assignedEmployeeId !== existing.assignedEmployeeId) {
      await this.activityLog.log({
        clientId: id,
        userId: actorId,
        activityType: "CUSTOMER_ASSIGNED",
        description: safeData.assignedEmployeeId
          ? `Customer assigned to employee ${safeData.assignedEmployeeId}`
          : `Customer unassigned`,
      });
    }
    return updated;
  }

  async delete(id: string) {
    await this.prisma.client.delete({ where: { id } });
    return { success: true };
  }

  async findOneRaw(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  async findByPhone(phone: string) {
    const cleaned = phone.replace(/[^0-9]/g, "");
    return this.prisma.client.findFirst({ where: { phone: { contains: cleaned } } });
  }

  async getStats(actorId: string, isAdmin: boolean) {
    const baseWhere: any = isAdmin ? {} : { assignedEmployeeId: actorId };
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [total, todayNew, hot, cold, notInterested, active, vip, pendingFollowUps] = await Promise.all([
      this.prisma.client.count({ where: baseWhere }),
      this.prisma.client.count({ where: { ...baseWhere, createdAt: { gte: todayStart, lte: todayEnd } } }),
      this.prisma.client.count({ where: { ...baseWhere, currentLeadStatus: "HOT_LEAD" } }),
      this.prisma.client.count({ where: { ...baseWhere, currentLeadStatus: "COLD_LEAD" } }),
      this.prisma.client.count({ where: { ...baseWhere, currentLeadStatus: "NOT_INTERESTED" } }),
      this.prisma.client.count({ where: { ...baseWhere, status: "Active" } }),
      this.prisma.client.count({ where: { ...baseWhere, plan: "VIP" } }),
      this.prisma.followUp.count({ where: { status: "PENDING", scheduledDate: { lte: todayEnd } } }),
    ]);

    return { total, todayNew, hot, cold, notInterested, active, vip, pendingFollowUps };
  }
}
