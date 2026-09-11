import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards, BadRequestException, Headers, HttpCode, HttpStatus, Res, Logger, Delete } from "@nestjs/common";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { WhatsAppService } from "./whatsapp.service";
import { WhatsAppBusinessService } from "./whatsapp-business.service";

interface RequestWithUser extends Request {
  user: { id: string; role: string };
}

@Controller()
export class WhatsAppController {
  private readonly logger = new Logger("WhatsAppController");
  constructor(
    private wa: WhatsAppService,
    private biz: WhatsAppBusinessService,
  ) {}

  // ========== WEBHOOK (no auth - public endpoint for Meta) ==========

  /**
   * GET /api/whatsapp/webhook - Meta verification handshake
   */
  @Get("whatsapp/webhook")
  verifyWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response,
  ) {
    const result = this.wa.verifyWebhook(mode, token, challenge);
    if (result.ok) {
      this.logger.log("WhatsApp webhook verified successfully");
      return res.status(200).send(result.challenge);
    }
    this.logger.warn(`WhatsApp webhook verification failed: mode=${mode} token=${token ? "***" : "missing"}`);
    return res.status(403).send("Verification failed");
  }

  /**
   * POST /api/whatsapp/webhook - Incoming messages and status updates from Meta
   */
  @Post("whatsapp/webhook")
  @HttpCode(HttpStatus.OK)
  async incomingWebhook(
    @Body() body: any,
    @Req() req: any,
    @Headers("x-hub-signature-256") signature: string | undefined,
    @Res() res: Response,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.warn("WhatsApp webhook: rawBody not available, cannot verify signature");
      return res.status(400).send("Raw body unavailable");
    }
    const rawBodyString = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : String(rawBody);
    if (!this.wa.verifySignature(rawBodyString, signature)) {
      this.logger.warn("WhatsApp webhook signature verification failed");
      return res.status(401).send("Invalid signature");
    }

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return res.status(200).send("ok");
    }

    // Handle messages
    if (value.messages && Array.isArray(value.messages)) {
      const phoneNumberId = value.metadata?.phone_number_id;
      const contacts = value.contacts || [];
      for (const msg of value.messages) {
        const fromPhone = msg.from;
        const text = msg.text?.body || "";
        const wamid = msg.id;
        const profileName = contacts.find((c: any) => c.wa_id === fromPhone)?.profile?.name;
        try {
          const result = await this.biz.processIncomingMessage({
            fromPhone,
            body: text,
            whatsappMessageId: wamid,
            profileName,
            phoneNumberId,
            dedupKey: wamid,
          });
          this.logger.log(`WhatsApp inbound processed: ${JSON.stringify(result)}`);
        } catch (e: any) {
          this.logger.error(`WhatsApp inbound error: ${e?.message}`);
        }
      }
    }

    // Handle statuses
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const st of value.statuses) {
        try {
          await this.biz.processStatusUpdate(st.id, st.status);
          this.logger.log(`WhatsApp status updated: ${st.id} -> ${st.status}`);
        } catch (e: any) {
          this.logger.error(`WhatsApp status error: ${e?.message}`);
        }
      }
    }

    // Meta expects 200 OK quickly
    return res.status(200).send("ok");
  }

  // ========== AUTHENTICATED API (Agent only) ==========

  @Get("whatsapp/config")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  getConfig() {
    return this.wa.getConfig();
  }

  @Get("whatsapp/conversations")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async listConversations(@Req() req: RequestWithUser, @Query() q: any) {
    const isAdmin = req.user.role === "admin";
    // For non-admin, force scope to actor. Admin can pass ?ownerAgentId=...
    // Admin sees unassigned pool by default (because unassigned convs are owned by admin agent).
    const ownerAgentId = isAdmin && q.ownerAgentId ? q.ownerAgentId : req.user.id;
    return this.biz.listConversations(ownerAgentId, { search: q.search, status: q.status, isAdmin });
  }

  @Get("whatsapp/conversations/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async getConversation(@Req() req: RequestWithUser, @Param("id") id: string) {
    const isAdmin = req.user.role === "admin";
    return this.biz.getConversation(req.user.id, id, isAdmin);
  }

  @Post("whatsapp/conversations/:id/read")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  @HttpCode(HttpStatus.OK)
  async markRead(@Req() req: RequestWithUser, @Param("id") id: string) {
    const isAdmin = req.user.role === "admin";
    return this.biz.markRead(req.user.id, id, isAdmin);
  }

  @Post("whatsapp/conversations")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async createOrGetConversation(@Req() req: RequestWithUser, @Body() body: { remotePhone: string; remoteName?: string; clientId?: string }) {
    if (!body?.remotePhone) throw new BadRequestException("remotePhone is required");
    const conv = await this.biz.getOrCreateConversation(req.user.id, body.remotePhone, {
      remoteName: body.remoteName,
      clientId: body.clientId,
    });
    return conv;
  }

  @Post("whatsapp/conversations/:id/link-customer")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async linkCustomer(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: { clientId: string }) {
    if (!body?.clientId) throw new BadRequestException("clientId is required");
    const isAdmin = req.user.role === "admin";
    return this.biz.linkToCustomer(req.user.id, id, body.clientId, isAdmin);
  }

  @Post("whatsapp/conversations/:id/create-customer")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async createAndLink(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: { name: string; email?: string; city?: string; source?: string; notes?: string }) {
    const isAdmin = req.user.role === "admin";
    return this.biz.createAndLinkCustomer(req.user.id, id, body || {}, isAdmin);
  }

  // Admin only: claim an unassigned conversation and assign it to a specific tenant agent
  @Post("whatsapp/conversations/:id/claim")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async claimUnassigned(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: { targetAgentId: string }) {
    if (!body?.targetAgentId) throw new BadRequestException("targetAgentId is required");
    return this.biz.claimUnassignedConversation(req.user.id, id, body.targetAgentId);
  }

  // ========== Phone-number -> tenant mapping (admin) ==========

  @Get("whatsapp/phone-assignments")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  listPhoneAssignments() {
    return this.biz.listPhoneAssignments();
  }

  @Post("whatsapp/phone-assignments")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  upsertPhoneAssignment(@Body() body: { phoneNumberId: string; ownerAgentId: string; label?: string }) {
    if (!body?.phoneNumberId || !body?.ownerAgentId) throw new BadRequestException("phoneNumberId and ownerAgentId required");
    return this.biz.upsertPhoneAssignment(body.phoneNumberId, body.ownerAgentId, body.label);
  }

  @Delete("whatsapp/phone-assignments/:phoneNumberId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  deletePhoneAssignment(@Param("phoneNumberId") phoneNumberId: string) {
    return this.biz.deletePhoneAssignment(phoneNumberId);
  }

  // ========== Agents list (admin only - for assignment dropdown) ==========
  @Get("whatsapp/agents")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async listAgents() {
    const { PrismaService } = await import("../prisma/prisma.service");
    // Use the prisma service indirectly via the business service's prisma
    const all = await (this.biz as any).prisma.agent.findMany({
      where: { role: "agent" },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    return all;
  }

  @Post("whatsapp/conversations/:id/messages")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async sendMessage(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: { body: string }) {
    if (!body?.body) throw new BadRequestException("body is required");
    const isAdmin = req.user.role === "admin";
    return this.biz.sendAgentMessage(req.user.id, id, body.body, isAdmin);
  }
}
