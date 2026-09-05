import { Controller, Post, Get, Body, Query, Headers, BadRequestException, Logger } from "@nestjs/common";
import { AiService } from "./ai.service";
import { PrismaService } from "../prisma/prisma.service";
import { ActivityLogService } from "./activity-log.service";

@Controller("webhooks")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private activityLog: ActivityLogService,
  ) {}

  // Meta verification handshake
  @Get("meta")
  verifyMeta(@Query() query: any) {
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "amplizo_verify_token";
    if (mode === "subscribe" && token === verifyToken) {
      this.logger.log("Meta webhook verified");
      return challenge;
    }
    throw new BadRequestException("Verification failed");
  }

  // Receive incoming messages
  @Post("meta")
  async receiveMeta(@Body() body: any) {
    this.logger.log(`Meta webhook received: ${JSON.stringify(body).slice(0, 200)}`);
    try {
      const entries = body?.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          if (change.field === "messages") {
            const value = change.value || {};
            const messages = value.messages || [];
            const contacts = value.contacts || [];
            for (const msg of messages) {
              await this.handleIncomingMessage(msg, contacts, value.metadata);
            }
          }
        }
      }
      return { success: true };
    } catch (err: any) {
      this.logger.error(`Webhook error: ${err?.message}`);
      return { success: false, error: err?.message };
    }
  }

  private async handleIncomingMessage(msg: any, contacts: any[], metadata: any) {
    const fromPhone = msg.from; // E.164 like +919999999999
    const text = msg.text?.body || msg.body || "";
    const waId = contacts?.[0]?.wa_id || fromPhone;
    const profileName = contacts?.[0]?.profile?.name;

    // Find or create customer by phone
    let customer = await this.prisma.client.findFirst({ where: { phone: { contains: fromPhone.replace(/[^0-9]/g, "") } } });
    if (!customer) {
      customer = await this.prisma.client.create({
        data: {
          name: profileName || `WhatsApp ${fromPhone}`,
          phone: fromPhone.replace(/[^0-9]/g, ""),
          externalPlatformId: waId,
        },
      });
      await this.activityLog.log({
        clientId: customer.id,
        activityType: "CUSTOMER_CREATED",
        description: `Customer created from Meta/WhatsApp message`,
      });
    }

    // Find or create conversation
    let chat = await this.prisma.chat.findFirst({
      where: { clientId: customer.id, status: { not: "closed" } },
      orderBy: { updatedAt: "desc" },
    });
    if (!chat) {
      // Create a visitor first (existing Chat schema requires visitorId)
      const visitor = await this.prisma.visitor.create({
        data: {
          name: customer.name,
          metadata: JSON.stringify({ source: "whatsapp", phone: fromPhone }),
        },
      });
      chat = await this.prisma.chat.create({
        data: {
          visitorId: visitor.id,
          clientId: customer.id,
          subject: `WhatsApp conversation`,
          conversationState: "AI_ACTIVE",
        },
      });
    }

    // Store message
    await this.prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: customer.id,
        senderType: "visitor",
        senderName: customer.name,
        content: text,
      },
    });
    await this.prisma.chat.update({
      where: { id: chat.id },
      data: { unreadCount: { increment: 1 }, updatedAt: new Date() },
    });

    // Detect buying intent and respond with AI
    const intent = this.aiService.detectBuyingIntent(text);
    if (intent.isInterested) {
      await this.prisma.client.update({
        where: { id: customer.id },
        data: { currentLeadStatus: "HOT_LEAD" },
      });
      await this.activityLog.log({
        clientId: customer.id,
        activityType: "LEAD_STATUS_CHANGED",
        description: `Auto-marked as HOT LEAD based on message intent (keywords: ${intent.matchedKeywords.join(", ")})`,
      });
      // Pause AI auto-reply
      await this.prisma.chat.update({
        where: { id: chat.id },
        data: { conversationState: "WAITING_FOR_HUMAN" },
      });
    } else {
      // Generate AI reply
      const aiReply = await this.aiService.generateResponse(text);
      await this.prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: "ai_assistant",
          senderType: "ai",
          senderName: "AI Assistant",
          content: aiReply,
        },
      });
    }
    return chat;
  }
}
