import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SmsService } from "../common/services/sms.service";
import { EmailService } from "../common/services/email.service";
import { WhatsAppBusinessService } from "../whatsapp/whatsapp-business.service";
import { ActivityLogService } from "./activity-log.service";

interface AIFollowUpConfig {
  clientId: string;
  clientName: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
  product?: string;
  lastInteraction?: Date;
  followUpCount: number;
  purchaseHistory?: { date: Date; amount: number }[];
}

@Injectable()
export class AIFollowUpService {
  private readonly logger = new Logger("AIFollowUpService");

  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private emailService: EmailService,
    private wa: WhatsAppBusinessService,
    private activityLog: ActivityLogService,
  ) {}

  async generateFollowUpMessage(config: AIFollowUpConfig): Promise<string> {
    const { clientName, followUpCount, product } = config;

    const baseTemplates = {
      first: [
        `Hi ${clientName}! Just checking in after your recent interaction. We'd love to hear your thoughts! Any questions we can help with? — Amplizo`,
        `Hello ${clientName}! Hope you're doing well. Wanted to follow up on our recent conversation. How can we assist you today? — Amplizo`,
        `Hi ${clientName}! Just a quick follow-up to see if everything is going smoothly. We're here if you need anything! — Amplizo`,
      ],
      second: [
        `Hi ${clientName}! Just wanted to check in again. Have you had a chance to explore our services? Let us know if you have any questions! — Amplizo`,
        `Hello ${clientName}! Following up on our previous conversation. We're always here to help if you need support! — Amplizo`,
      ],
      third: [
        `Hi ${clientName}! We haven't heard from you in a while. Is there anything we can help you with? We'd love to hear from you! — Amplizo`,
        `Hello ${clientName}! Just a gentle reminder that we're here for you. Let us know if you need any assistance! — Amplizo`,
      ],
    };

    const templates = followUpCount <= 1 ? baseTemplates.first : followUpCount === 2 ? baseTemplates.second : baseTemplates.third;
    let message = templates[Math.floor(Math.random() * templates.length)];

    if (product) {
      message = message.replace("our services", `our ${product} services`).replace("explore", `try ${product}`);
    }

    return message;
  }

  async classifyLead(clientId: string, recentActivity: string[]): Promise<"HOT" | "COLD" | "NOT_INTERESTED" | null> {
    const positiveKeywords = ["interested", "yes", "sure", "okay", "great", "thank", "perfect", "love", "want", "buy", "call me", "sounds good", "interested", "definitely", "absolutely"];
    const negativeKeywords = ["no", "not", "don't", "stop", "unsubscribe", "remove", "blocked", "wrong number", "never", "later", "busy"];

    const activityText = recentActivity.join(" ").toLowerCase();

    let positiveScore = 0;
    let negativeScore = 0;

    for (const keyword of positiveKeywords) {
      if (activityText.includes(keyword)) positiveScore++;
    }
    for (const keyword of negativeKeywords) {
      if (activityText.includes(keyword)) negativeScore++;
    }

    if (negativeScore >= 2) return "NOT_INTERESTED";
    if (positiveScore >= 2) return "HOT";
    if (negativeScore >= 1 && positiveScore === 0) return "COLD";

    return null;
  }

  async updateLeadStatus(clientId: string): Promise<{ updated: boolean; newStatus?: string }> {
    const activities = await this.prisma.activityLog.findMany({
      where: { clientId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const messages = await this.prisma.chat.findMany({
      where: { clientId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 10 } },
    });

    const recentText = [
      ...activities.map(a => a.description),
      ...messages.flatMap(m => m.messages.map(msg => msg.content)),
    ].join(" ");

    const classification = await this.classifyLead(clientId, [recentText]);

    if (!classification) return { updated: false };

    const statusMap: Record<string, string> = { HOT: "HOT", COLD: "COLD", NOT_INTERESTED: "NOT_INTERESTED" };

    await this.prisma.client.update({
      where: { id: clientId },
      data: { currentLeadStatus: statusMap[classification] },
    });

    await this.activityLog.log({
      clientId,
      activityType: "AI_CLASSIFICATION",
      description: `AI classified lead as ${classification} based on recent activity`,
      metadata: { classification, source: "ai_followup" },
    });

    return { updated: true, newStatus: classification };
  }

  async sendAIFollowUp(followUpId: string, actorId: string, isAdmin: boolean, channel: "whatsapp" | "sms" | "email" = "whatsapp") {
    const followUp = await this.prisma.followUp.findUnique({
      where: { id: followUpId },
      include: { client: true, assignedEmployee: true },
    });

    if (!followUp) return { success: false, error: "Follow-up not found" };

    const message = await this.generateFollowUpMessage({
      clientId: followUp.clientId,
      clientName: followUp.client.name,
      clientPhone: followUp.client.phone,
      clientEmail: followUp.client.email,
      followUpCount: followUp.followUpNumber || 1,
      lastInteraction: followUp.scheduledDate,
    });

    let result: { success: boolean; error?: string; mock?: boolean };

    const waActorId = followUp.assignedEmployeeId || actorId;

    switch (channel) {
      case "whatsapp":
        result = await this.sendWhatsAppMessage(followUp.clientId, followUp.client.phone, message, waActorId);
        break;
      case "sms":
        result = await this.sendSMSMessage(followUp.client.phone, message);
        break;
      case "email":
        result = await this.sendEmailMessage(followUp.client.email, `Follow-up from Amplizo`, message);
        break;
    }

    if (result.success) {
      await this.prisma.followUp.update({
        where: { id: followUpId },
        data: { status: "COMPLETED" },
      });

      await this.updateLeadStatus(followUp.clientId);

      await this.activityLog.log({
        clientId: followUp.clientId,
        userId: actorId,
        activityType: "AI_FOLLOWUP_SENT",
        description: `AI follow-up ${followUp.followUpNumber} sent to ${followUp.client.name} via ${channel}`,
        metadata: { followUpId, channel, message },
      });
    }

    return result;
  }

  private async sendWhatsAppMessage(clientId: string, phone: string | null, message: string, actorId: string) {
    if (!phone) return { success: false, error: "No phone number" };

    try {
      const conv = await this.wa.getOrCreateConversation(actorId, phone, { clientId });
      const sent = await this.wa.sendAgentMessage(actorId, conv.id, message, true);
      return { success: sent.status === "SENT", error: sent.errorMessage || undefined, mock: !!sent.mock };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  private async sendSMSMessage(phone: string | null, message: string) {
    if (!phone) return { success: false, error: "No phone number" };

    try {
      const result = await this.smsService.sendSms(phone, message);
      return { success: true, mock: result.mock || false };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  private async sendEmailMessage(email: string | null, subject: string, body: string) {
    if (!email) return { success: false, error: "No email" };

    try {
      const result = await this.emailService.sendEmail(email, subject, body);
      return { success: result.success, mock: result.mock || false };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
