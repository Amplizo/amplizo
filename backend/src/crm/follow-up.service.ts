import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActivityLogService } from "./activity-log.service";
import { SmsService } from "../common/services/sms.service";
import { WhatsAppBusinessService } from "../whatsapp/whatsapp-business.service";
import { EmailService } from "../common/services/email.service";

@Injectable()
export class FollowUpService {
  private readonly logger = new Logger("FollowUpService");
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
    private smsService: SmsService,
    private wa: WhatsAppBusinessService,
    private emailService: EmailService,
  ) {}

  async findAll(params: {
    status?: string;
    today?: boolean;
    overdue?: boolean;
    upcoming?: boolean;
    actorId: string;
    isAdmin: boolean;
    clientId?: string;
    employeeId?: string;
  }) {
    const { status, today, overdue, upcoming, actorId, isAdmin, clientId, employeeId } = params;

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (!isAdmin) {
      where.assignedEmployeeId = actorId;
    } else if (employeeId) {
      where.assignedEmployeeId = employeeId;
    }

    const now = new Date();
    if (today) {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      where.scheduledDate = { gte: start, lte: end };
    } else if (overdue) {
      where.scheduledDate = { lt: now };
      where.status = "PENDING";
    } else if (upcoming) {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setDate(end.getDate() + 15);
      end.setHours(23, 59, 59, 999);
      where.scheduledDate = { gte: start, lte: end };
      where.status = "PENDING";
    }

    return this.prisma.followUp.findMany({
      where,
      orderBy: { scheduledDate: "asc" },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true, city: true, currentLeadStatus: true } },
        assignedEmployee: { select: { id: true, name: true, email: true } },
        completedBy: { select: { id: true, name: true } },
        sentBy: { select: { id: true, name: true } },
        cycle: { select: { id: true, status: true, purchaseId: true } },
      },
    });
  }

  async findOne(id: string, actorId: string, isAdmin: boolean) {
    const followUp = await this.prisma.followUp.findUnique({
      where: { id },
      include: {
        client: true,
        assignedEmployee: { select: { id: true, name: true } },
        completedBy: { select: { id: true, name: true } },
        sentBy: { select: { id: true, name: true } },
        cycle: { include: { followUps: { orderBy: { followUpNumber: "asc" } } } },
      },
    });
    if (!followUp) throw new NotFoundException("Follow-up not found");
    if (!isAdmin && followUp.assignedEmployeeId !== actorId) {
      throw new NotFoundException("Follow-up not found");
    }
    return followUp;
  }

  async complete(id: string, notes: string | undefined, actorId: string, isAdmin: boolean) {
    const followUp = await this.findOne(id, actorId, isAdmin);
    if (followUp.status !== "PENDING") {
      throw new BadRequestException(`Follow-up is already ${followUp.status.toLowerCase()}`);
    }
    const updated = await this.prisma.followUp.update({
      where: { id },
      data: {
        status: "COMPLETED",
        notes,
        completedAt: new Date(),
        completedById: actorId || undefined,
      },
    });
    await this.activityLog.log({
      clientId: followUp.clientId,
      userId: actorId || undefined,
      activityType: "FOLLOWUP_COMPLETED",
      description: `Follow-up ${followUp.followUpNumber} completed${notes ? `: ${notes}` : ""}`,
      metadata: { followUpId: id, followUpNumber: followUp.followUpNumber },
    });
    const cycle = await this.prisma.followUpCycle.findUnique({
      where: { id: followUp.cycleId },
      include: { followUps: true },
    });
    if (cycle && cycle.followUps.every((f) => f.status === "COMPLETED" || f.status === "SKIPPED" || f.status === "CANCELLED")) {
      await this.prisma.followUpCycle.update({
        where: { id: cycle.id },
        data: { status: "COMPLETED" },
      });
    }
    return updated;
  }

  async skip(id: string, notes: string | undefined, actorId: string, isAdmin: boolean) {
    const followUp = await this.findOne(id, actorId, isAdmin);
    if (followUp.status !== "PENDING") {
      throw new BadRequestException(`Follow-up is already ${followUp.status.toLowerCase()}`);
    }
    const updated = await this.prisma.followUp.update({
      where: { id },
      data: { status: "SKIPPED", notes, completedAt: new Date(), completedById: actorId },
    });
    await this.activityLog.log({
      clientId: followUp.clientId,
      userId: actorId || undefined,
      activityType: "FOLLOWUP_SKIPPED",
      description: `Follow-up ${followUp.followUpNumber} skipped${notes ? `: ${notes}` : ""}`,
    });
    return updated;
  }

  async getStats(actorId: string, isAdmin: boolean) {
    const baseWhere: any = isAdmin ? {} : { assignedEmployeeId: actorId };
    const now = new Date();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [pending, sent, failed, completed, todayDue, overdue] = await Promise.all([
      this.prisma.followUp.count({ where: { ...baseWhere, status: "PENDING" } }),
      this.prisma.followUp.count({ where: { ...baseWhere, status: "SENT" } }),
      this.prisma.followUp.count({ where: { ...baseWhere, status: "FAILED" } }),
      this.prisma.followUp.count({ where: { ...baseWhere, status: "COMPLETED" } }),
      this.prisma.followUp.count({
        where: { ...baseWhere, status: "PENDING", scheduledDate: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.followUp.count({
        where: { ...baseWhere, status: "PENDING", scheduledDate: { lt: todayStart } },
      }),
    ]);
    return { pending, sent, failed, completed, todayDue, overdue };
  }

  async sendFollowUpSms(id: string, actorId: string, isAdmin: boolean, customMessage?: string) {
    const followUp = await this.findOne(id, actorId, isAdmin);
    const client = followUp.client;
    if (!client.phone) {
      throw new BadRequestException("Customer has no phone number on file");
    }
    const message = (customMessage && customMessage.trim()) ||
      `Hi ${client.name}, this is a friendly follow-up regarding your recent purchase. We're here if you need any help! — Amplizo`;
    const result = await this.smsService.sendSms(client.phone, message, {
      clientId: client.id,
      followUpId: followUp.id,
      type: "FOLLOWUP",
    });
    await this.activityLog.log({
      clientId: followUp.clientId,
      userId: actorId || undefined,
      activityType: "FOLLOWUP_SMS_SENT",
      description: result.success
        ? `Follow-up SMS sent to ${client.name} (${client.phone})${result.mock ? " [MOCK]" : ""}`
        : `Follow-up SMS FAILED for ${client.name}: ${result.error}`,
      metadata: { followUpId: id, sid: result.sid, mock: !!result.mock, error: result.error },
    });
    return { ...result, followUpId: id, customerName: client.name };
  }

  async sendFollowUpWhatsApp(id: string, actorId: string, isAdmin: boolean, customMessage?: string) {
    const followUp = await this.findOne(id, actorId, isAdmin);
    const client = followUp.client;
    if (!client.phone) {
      throw new BadRequestException("Customer has no phone number on file");
    }
    const message = (customMessage && customMessage.trim()) ||
      `Hi ${client.name}, this is a friendly follow-up regarding your recent purchase. We're here if you need any help! — Amplizo`;

    let conversationId: string | undefined;
    try {
      const conv = await this.wa.getOrCreateConversation(actorId, client.phone, {
        remoteName: client.name,
        clientId: client.id,
      });
      conversationId = conv.id;
      const sentMessage = await this.wa.sendAgentMessage(actorId, conv.id, message, isAdmin);
      const success = sentMessage.status === "SENT";
      await this.activityLog.log({
        clientId: followUp.clientId,
        userId: actorId || undefined,
        activityType: success ? "FOLLOWUP_WHATSAPP_SENT" : "FOLLOWUP_WHATSAPP_FAILED",
        description: success
          ? `Follow-up WhatsApp sent to ${client.name} (${client.phone})${sentMessage.mock ? " [MOCK]" : ""}`
          : `Follow-up WhatsApp FAILED for ${client.name}: ${sentMessage.errorMessage || sentMessage.errorCode || "Unknown error"}`,
        metadata: { followUpId: id, conversationId, mock: !!sentMessage.mock, error: sentMessage.errorMessage, wamid: sentMessage.whatsappMessageId },
      });
      return { success, mock: sentMessage.mock || false, channel: "whatsapp", error: sentMessage.errorMessage };
    } catch (e: any) {
      const errMsg = e?.response?.data?.message?.message || e?.message || "Failed to send WhatsApp";
      await this.activityLog.log({
        clientId: followUp.clientId,
        userId: actorId || undefined,
        activityType: "FOLLOWUP_WHATSAPP_FAILED",
        description: `Follow-up WhatsApp FAILED for ${client.name}: ${errMsg}`,
        metadata: { followUpId: id, error: errMsg },
      });
      return { success: false, channel: "whatsapp", error: errMsg };
    }
  }

  async sendFollowUpEmail(id: string, actorId: string, isAdmin: boolean, customMessage?: string) {
    const followUp = await this.findOne(id, actorId, isAdmin);
    const client = followUp.client;
    if (!client.email) {
      throw new BadRequestException("Customer has no email address on file");
    }
    if (!this.emailService.isReady()) {
      throw new BadRequestException("Email service is not configured on the backend");
    }
    const subject = `Follow-up: ${client.name} — Amplizo`;
    const body = (customMessage && customMessage.trim()) ||
      `<p>Hi ${client.name},</p><p>This is a friendly follow-up regarding your recent purchase. We're here if you need any help!</p><p>— Amplizo</p>`;
    const result = await this.emailService.sendEmail(client.email, subject, body);
    await this.activityLog.log({
      clientId: followUp.clientId,
      userId: actorId || undefined,
      activityType: result.success ? "FOLLOWUP_EMAIL_SENT" : "FOLLOWUP_EMAIL_FAILED",
      description: result.success
        ? `Follow-up email sent to ${client.name} (${client.email})${result.mock ? " [MOCK]" : ""}`
        : `Follow-up email FAILED for ${client.name}: ${result.error}`,
      metadata: { followUpId: id, to: client.email, mock: !!result.mock, error: result.error, messageId: result.messageId },
    });
    return { success: result.success, mock: result.mock || false, channel: "email", error: result.error };
  }

  async sendFollowUp(id: string, actorId: string, isAdmin: boolean, channel?: "whatsapp" | "sms" | "email") {
    const followUp = await this.prisma.followUp.findUnique({
      where: { id },
      include: { client: { select: { id: true, name: true, phone: true, email: true } } },
    });
    if (!followUp) throw new NotFoundException("Follow-up not found");
    if (!isAdmin && followUp.assignedEmployeeId !== actorId) {
      throw new NotFoundException("Follow-up not found");
    }
    if (followUp.status !== "PENDING") {
      throw new BadRequestException(`Follow-up is already ${followUp.status.toLowerCase()}`);
    }

    await this.prisma.followUp.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    let result: any = { success: false, channel: channel || "auto" };
    try {
      if (channel === "sms" || (!channel && followUp.client.phone)) {
        result = await this.sendFollowUpSms(id, actorId, isAdmin);
        if (result.success) {
          await this.prisma.followUp.update({ where: { id }, data: { status: "SENT", sentAt: new Date(), sentById: actorId || undefined } });
          return result;
        }
      }
      if (channel === "whatsapp" || (!channel && !result.success)) {
        result = await this.sendFollowUpWhatsApp(id, actorId, isAdmin);
        if (result.success) {
          await this.prisma.followUp.update({ where: { id }, data: { status: "SENT", sentAt: new Date(), sentById: actorId || undefined } });
          return result;
        }
      }
      if (channel === "email" || (!channel && !result.success)) {
        result = await this.sendFollowUpEmail(id, actorId, isAdmin);
        if (result.success) {
          await this.prisma.followUp.update({ where: { id }, data: { status: "SENT", sentAt: new Date(), sentById: actorId || undefined } });
          return result;
        }
      }
      await this.prisma.followUp.update({
        where: { id },
        data: { status: "FAILED", error: result.error || "All channels failed" },
      });
      return result;
    } catch (e: any) {
      await this.prisma.followUp.update({
        where: { id },
        data: { status: "FAILED", error: e?.message || "Unexpected error" },
      });
      return { success: false, channel: result.channel, error: e?.message || "Unexpected error" };
    }
  }

  async processDueFollowUps(actorId?: string) {
    const now = new Date();
    const where: any = { status: "PENDING", scheduledDate: { lte: now } };
    if (actorId) {
      where.assignedEmployeeId = actorId;
    } else {
      where.assignedEmployeeId = { not: null };
    }

    const due = await this.prisma.followUp.findMany({
      where,
      include: { client: { select: { id: true, name: true, phone: true, email: true } } },
    });

    const results: any[] = [];
    for (const fu of due) {
      const key = `scheduler-${fu.id}`;
      const existing = await this.prisma.activityLog.findFirst({ where: { metadata: { contains: key } } });
      if (existing) continue;

      const result = await this.sendFollowUp(fu.id, fu.assignedEmployeeId as string, true);
      results.push({ followUpId: fu.id, ...result });

      await this.activityLog.log({
        clientId: fu.clientId,
        userId: actorId || undefined,
        activityType: result.success ? "FOLLOWUP_AUTO_SENT" : "FOLLOWUP_AUTO_FAILED",
        description: result.success
          ? `Auto follow-up ${fu.followUpNumber} sent to ${fu.client.name} via ${result.channel}`
          : `Auto follow-up ${fu.followUpNumber} failed for ${fu.client.name}: ${result.error}`,
        metadata: JSON.stringify({ key, followUpId: fu.id, channel: result.channel, error: result.error }),
      });
    }
    return results;
  }
}
