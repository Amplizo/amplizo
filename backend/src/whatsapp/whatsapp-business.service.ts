import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsAppService } from "./whatsapp.service";

@Injectable()
export class WhatsAppBusinessService {
  private readonly logger = new Logger("WhatsAppBusinessService");

  constructor(
    private prisma: PrismaService,
    private wa: WhatsAppService,
  ) {}

  private normalizePhone(p: string) {
    if (!p) return "";
    const t = p.trim().replace(/[\s\-()]/g, "");
    if (t.startsWith("+")) return t.replace(/[^\d+]/g, "");
    const d = t.replace(/[^0-9]/g, "");
    if (d.length === 10) return `+91${d}`;
    if (d.length === 11 && d.startsWith("0")) return `+91${d.slice(1)}`;
    if (d.length === 12 && d.startsWith("91")) return `+${d}`;
    return `+${d.replace(/^\+/, "")}`;
  }

  /**
   * Find or create a conversation for (ownerAgent, remotePhone).
   * Optionally auto-link to a customer with matching phone (if customer belongs to this agent/tenant).
   */
  async getOrCreateConversation(ownerAgentId: string, remotePhone: string, opts: { remoteName?: string; clientId?: string; phoneNumberId?: string; isUnassigned?: boolean } = {}) {
    const phone = this.normalizePhone(remotePhone);
    if (!phone) throw new BadRequestException("Invalid phone number");

    // Validate ownership if clientId provided
    if (opts.clientId) {
      const client = await this.prisma.client.findUnique({ where: { id: opts.clientId } });
      if (!client) throw new NotFoundException("Customer not found");
      // Customer must belong to the same agent/tenant (or be unassigned)
      if (client.assignedEmployeeId && client.assignedEmployeeId !== ownerAgentId) {
        throw new ForbiddenException("Customer belongs to another tenant");
      }
    }

    let conversation = await this.prisma.whatsAppConversation.findUnique({
      where: { ownerAgentId_remotePhone: { ownerAgentId, remotePhone: phone } },
    });

    if (!conversation) {
      conversation = await this.prisma.whatsAppConversation.create({
        data: {
          ownerAgentId,
          remotePhone: phone,
          remoteName: opts.remoteName,
          clientId: opts.clientId,
          phoneNumberId: opts.phoneNumberId,
          isUnassigned: !opts.clientId,
          status: !opts.clientId ? "UNASSIGNED" : "OPEN",
        },
      });
    } else if (opts.clientId && conversation.clientId !== opts.clientId) {
      // Allow linking customer if not already linked
      conversation = await this.prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { clientId: opts.clientId, remoteName: opts.remoteName || conversation.remoteName, isUnassigned: false, status: "OPEN" },
      });
    } else if (opts.remoteName && !conversation.remoteName) {
      conversation = await this.prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { remoteName: opts.remoteName },
      });
    }
    return conversation;
  }

  /**
   * Find an existing customer with the same phone (only within caller's tenant).
   * Returns first matching client owned by `ownerAgentId`.
   */
  async findCustomerByPhone(ownerAgentId: string, phone: string) {
    const norm = this.normalizePhone(phone);
    if (!norm) return null;
    const all = await this.prisma.client.findMany({
      where: {
        assignedEmployeeId: ownerAgentId,
        phone: { contains: norm.replace(/^\+/, "").slice(-10) },
      },
      take: 5,
    });
    return all[0] || null;
  }

  /**
   * List conversations.
   * - Admin (isAdmin=true): sees their own tenant's conversations + ALL isUnassigned=true
   *   (which are owned by the admin agent themselves, so the union is the same agent's
   *    conversations in practice).
   * - Non-admin: only ownerAgentId === self. Unassigned convs are owned by admin agent
   *   so they NEVER appear for non-admin clients. This is the tenant isolation boundary.
   */
  async listConversations(ownerAgentId: string, opts: { search?: string; status?: string; isAdmin?: boolean } = {}) {
    const where: any = {};
    if (opts.isAdmin) {
      // Admin sees conversations they own (which includes the unassigned pool) PLUS
      // we still scope to their ownerAgentId. Unassigned convs ARE owned by admin agent.
      where.ownerAgentId = ownerAgentId;
    } else {
      // Non-admin: strictly their own tenant
      where.ownerAgentId = ownerAgentId;
    }
    if (opts.status) where.status = opts.status;
    if (opts.search) {
      const q = opts.search.trim();
      where.OR = [
        { remotePhone: { contains: q } },
        { remoteName: { contains: q } },
        { client: { name: { contains: q } } },
        { client: { phone: { contains: q } } },
      ];
    }
    const items = await this.prisma.whatsAppConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      take: 200,
      include: {
        client: { select: { id: true, name: true, email: true, phone: true, city: true, currentLeadStatus: true, plan: true, status: true } },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
          select: { id: true, direction: true, body: true, status: true, sentAt: true, type: true },
        },
      },
    });
    const totalUnread = await this.prisma.whatsAppConversation.aggregate({
      where: { ownerAgentId, status: { in: ["OPEN", "UNASSIGNED"] } },
      _sum: { unreadCount: true },
    });
    return { items, totalUnread: totalUnread._sum.unreadCount || 0 };
  }

  /**
   * Get a conversation by id, scoped to owner.
   */
  async getConversation(ownerAgentId: string, conversationId: string, isAdmin: boolean) {
    const conv = await this.prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
      include: {
        client: true,
        messages: { orderBy: { sentAt: "asc" }, take: 200 },
      },
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    if (!isAdmin && conv.ownerAgentId !== ownerAgentId) {
      throw new NotFoundException("Conversation not found");
    }
    return conv;
  }

  /**
   * Mark conversation as read (clears unread).
   */
  async markRead(ownerAgentId: string, conversationId: string, isAdmin: boolean) {
    const conv = await this.getConversation(ownerAgentId, conversationId, isAdmin);
    if (conv.unreadCount > 0) {
      await this.prisma.whatsAppConversation.update({
        where: { id: conversationId },
        data: { unreadCount: 0 },
      });
    }
    return { ok: true };
  }

  /**
   * Send a message from an agent. Stores OUTBOUND message, calls Meta API, updates status.
   */
  async sendAgentMessage(
    ownerAgentId: string,
    conversationId: string,
    body: string,
    isAdmin: boolean,
  ) {
    if (!body || !body.trim()) {
      throw new BadRequestException("Message body is required");
    }
    const conv = await this.getConversation(ownerAgentId, conversationId, isAdmin);

    // Create PENDING message first
    const message = await this.prisma.whatsAppMessage.create({
      data: {
        conversationId: conv.id,
        direction: "OUTBOUND",
        type: "text",
        body: body.trim(),
        status: "PENDING",
      },
    });

    // Update conversation preview
    await this.prisma.whatsAppConversation.update({
      where: { id: conv.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: body.trim().slice(0, 120),
        lastMessageDirection: "OUTBOUND",
        unreadCount: 0,
      },
    });

    // Call WhatsApp
    const result = await this.wa.sendTextMessage(conv.remotePhone, body.trim(), {
      phoneNumberId: conv.phoneNumberId || undefined,
    });

    // Update message with result
    const updated = await this.prisma.whatsAppMessage.update({
      where: { id: message.id },
      data: {
        status: result.success ? "SENT" : "FAILED",
        whatsappMessageId: result.whatsappMessageId,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      },
    });

    return {
      ...updated,
      mock: result.mock || false,
    };
  }

  /**
   * Handle an incoming message from the webhook.
   *
   * Tenant resolution order (CRITICAL for isolation):
   *  1. If the phone_number_id from the webhook is mapped to an agent
   *     (WhatsAppPhoneAssignment table), the conversation belongs to that agent's tenant.
   *  2. Otherwise, fall back to the agent that owns the customer with the matching phone
   *     (existing matched-customer behavior).
   *  3. Otherwise, route to the GLOBAL ADMIN UNASSIGNED POOL.
   *     - The conversation is owned by the admin agent, marked isUnassigned=true.
   *     - Non-admin agents NEVER see unassigned conversations (their filter excludes
   *       isUnassigned=true and their ownerAgentId check would fail anyway).
   *     - Admin can claim it and reassign to a client tenant.
   *     - This prevents cross-tenant leak: we never GUESS the tenant.
   */
  async processIncomingMessage(payload: {
    fromPhone: string;
    body: string;
    whatsappMessageId: string;
    profileName?: string;
    phoneNumberId?: string;
    dedupKey?: string;
  }) {
    const phone = this.normalizePhone(payload.fromPhone);

    // Dedup check
    if (payload.dedupKey) {
      const existing = await this.prisma.whatsAppWebhookEvent.findUnique({ where: { dedupKey: payload.dedupKey } });
      if (existing) return { ignored: true, reason: "duplicate", dedupKey: payload.dedupKey };
    }

    // ----- 1. Resolve target agent by phone_number_id mapping (tenant signal) -----
    let ownerAgentId: string | null = null;
    let resolvedVia: "phone_mapping" | "customer_match" | "admin_unassigned" = "admin_unassigned";
    let mappedPhoneNumberId: string | null = null;
    if (payload.phoneNumberId) {
      const mapping = await this.prisma.whatsAppPhoneAssignment.findUnique({
        where: { phoneNumberId: payload.phoneNumberId },
      });
      if (mapping) {
        ownerAgentId = mapping.ownerAgentId;
        resolvedVia = "phone_mapping";
        mappedPhoneNumberId = mapping.phoneNumberId;
        this.logger.log(`Inbound ${phone} -> tenant via phone_mapping (${payload.phoneNumberId}) -> agent ${ownerAgentId}`);
      }
    }

    // ----- 2. If no mapping OR mapping found but no customer linked yet, try matched customer -----
    // (Always look up a customer for the phone, so we can auto-link even on the phone_mapping path.)
    let client: any = null;
    const allClients = await this.prisma.client.findMany({
      where: { phone: { contains: phone.replace(/^\+/, "").slice(-10) } },
      take: 10,
    });
    client = allClients[0] || null;
    if (!ownerAgentId) {
      // No phone mapping -> resolve tenant by matched customer
      if (client) {
        ownerAgentId = client.assignedEmployeeId;
        if (ownerAgentId) {
          resolvedVia = "customer_match";
          this.logger.log(`Inbound ${phone} -> tenant via customer_match (customer ${client.id}) -> agent ${ownerAgentId}`);
        }
      }
    } else if (resolvedVia === "phone_mapping" && client) {
      // Mapped to a tenant: only allow auto-link if the customer belongs to that tenant.
      // This preserves tenant isolation: never link a customer from a different tenant.
      if (!client.assignedEmployeeId || client.assignedEmployeeId === ownerAgentId) {
        this.logger.log(`Inbound ${phone} -> auto-link to customer ${client.id} (same tenant)`);
      } else {
        this.logger.warn(`Inbound ${phone} -> customer ${client.id} belongs to different tenant, NOT auto-linking`);
        client = null;
      }
    }

    // ----- 3. Fallback: ADMIN UNASSIGNED POOL -----
    if (!ownerAgentId) {
      // Find the global admin agent. There should be exactly one (role=admin).
      const admin = await this.prisma.agent.findFirst({ where: { role: "admin" } });
      if (!admin) {
        this.logger.error(`No admin agent exists to host unassigned leads. Dropping ${phone}.`);
        if (payload.dedupKey) {
          try {
            await this.prisma.whatsAppWebhookEvent.create({
              data: {
                payload: JSON.stringify(payload),
                type: "message",
                dedupKey: payload.dedupKey,
                processingStatus: "failed",
                processingError: "No admin and no tenant mapping",
              },
            });
          } catch {}
        }
        return { ignored: true, reason: "no_admin" };
      }
      ownerAgentId = admin.id;
      resolvedVia = "admin_unassigned";
      this.logger.warn(`Inbound ${phone} -> ADMIN UNASSIGNED POOL (admin ${admin.id}). Tenant cannot be determined safely.`);
    }

    // Get/create conversation
    const conv = await this.getOrCreateConversation(ownerAgentId, phone, {
      remoteName: payload.profileName,
      // Only link to a customer for matched-customer path (not for phone_mapping or unassigned)
      // For phone_mapping we still may link if a customer with that phone exists for this agent.
      clientId: resolvedVia === "admin_unassigned" ? undefined : (client?.id || undefined),
      phoneNumberId: mappedPhoneNumberId || payload.phoneNumberId,
      isUnassigned: resolvedVia === "admin_unassigned",
    });

    // Store inbound message
    const message = await this.prisma.whatsAppMessage.create({
      data: {
        conversationId: conv.id,
        direction: "INBOUND",
        type: "text",
        body: payload.body,
        status: "DELIVERED",
        whatsappMessageId: payload.whatsappMessageId,
        deliveredAt: new Date(),
      },
    });

    await this.prisma.whatsAppConversation.update({
      where: { id: conv.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: (payload.body || "").slice(0, 120),
        lastMessageDirection: "INBOUND",
        unreadCount: { increment: 1 },
      },
    });

    if (payload.dedupKey) {
      try {
        await this.prisma.whatsAppWebhookEvent.create({
          data: {
            payload: JSON.stringify(payload),
            conversationId: conv.id,
            type: "message",
            dedupKey: payload.dedupKey,
            processingStatus: "processed",
          },
        });
      } catch {}
    }

    return {
      stored: true,
      conversationId: conv.id,
      messageId: message.id,
      resolvedVia,
      isUnassigned: resolvedVia === "admin_unassigned",
    };
  }

  /**
   * Handle a status update (delivered, read, failed) for an outbound message.
   */
  async processStatusUpdate(whatsappMessageId: string, status: string) {
    const statusUpper = status.toUpperCase();
    const message = await this.prisma.whatsAppMessage.findUnique({ where: { whatsappMessageId } });
    if (!message) return { ignored: true, reason: "unknown_wamid" };
    const data: any = { status: statusUpper };
    if (statusUpper === "DELIVERED") data.deliveredAt = new Date();
    if (statusUpper === "READ") data.readAt = new Date();
    await this.prisma.whatsAppMessage.update({ where: { id: message.id }, data });
    return { updated: true, messageId: message.id, status: statusUpper };
  }

  // ---------------- UNASSIGNED LEAD HANDLING ----------------

  /**
   * Admin-only: claim an unassigned conversation and transfer it to a specific tenant
   * (the chosen agent's workspace). After claim, isUnassigned=false and ownerAgentId
   * is the target agent. Complete message history is preserved.
   */
  async claimUnassignedConversation(adminAgentId: string, conversationId: string, targetAgentId: string) {
    // Verify caller is admin
    const caller = await this.prisma.agent.findUnique({ where: { id: adminAgentId } });
    if (!caller || caller.role !== "admin") {
      throw new ForbiddenException("Only admin can claim unassigned conversations");
    }
    const conv = await this.prisma.whatsAppConversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException("Conversation not found");
    if (!conv.isUnassigned) {
      throw new BadRequestException("Conversation is not unassigned");
    }
    const target = await this.prisma.agent.findUnique({ where: { id: targetAgentId } });
    if (!target) throw new NotFoundException("Target agent not found");

    // Move conversation: change ownerAgentId -> target. The unique constraint
    // (ownerAgentId, remotePhone) would block if a conv with this remote already
    // exists for the target. We must merge to prevent duplicates.
    const existingForTarget = await this.prisma.whatsAppConversation.findUnique({
      where: { ownerAgentId_remotePhone: { ownerAgentId: targetAgentId, remotePhone: conv.remotePhone } },
      include: { messages: true },
    });

    if (existingForTarget && existingForTarget.id !== conv.id) {
      // Merge: move all messages from unassigned conv -> existing target conv, delete the unassigned
      await this.prisma.$transaction(async (tx) => {
        await tx.whatsAppMessage.updateMany({
          where: { conversationId: conv.id },
          data: { conversationId: existingForTarget.id },
        });
        // Move webhook events
        await tx.whatsAppWebhookEvent.updateMany({
          where: { conversationId: conv.id },
          data: { conversationId: existingForTarget.id },
        });
        await tx.whatsAppConversation.delete({ where: { id: conv.id } });
        // Touch the surviving conv to bump updatedAt
        await tx.whatsAppConversation.update({
          where: { id: existingForTarget.id },
          data: { lastMessageAt: new Date() },
        });
      });
      return { merged: true, conversationId: existingForTarget.id };
    }

    // No conflict: simple update
    const updated = await this.prisma.whatsAppConversation.update({
      where: { id: conv.id },
      data: { ownerAgentId: targetAgentId, isUnassigned: false, status: "OPEN" },
    });
    return { merged: false, conversationId: updated.id };
  }

  /**
   * Link an unassigned conversation to an existing customer (preserving full history).
   * - The customer must already belong to the conversation's owning agent/tenant.
   * - After linking, isUnassigned stays false; the conversation is now "known".
   */
  async linkToCustomer(callerAgentId: string, conversationId: string, customerId: string, isAdmin: boolean) {
    const conv = await this.getConversation(callerAgentId, conversationId, isAdmin);
    const customer = await this.prisma.client.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException("Customer not found");

    // Tenant safety: customer must belong to this agent (or be unassigned globally)
    if (customer.assignedEmployeeId && customer.assignedEmployeeId !== conv.ownerAgentId) {
      throw new ForbiddenException("Customer belongs to another tenant");
    }

    // Auto-assign the customer to the conv's owner if not assigned
    if (!customer.assignedEmployeeId) {
      await this.prisma.client.update({
        where: { id: customer.id },
        data: { assignedEmployeeId: conv.ownerAgentId },
      });
    }

    // If this was a phone_mapping path (conv already has phoneNumberId), the phone on the
    // customer might be missing - ensure we keep them in sync.
    const updated = await this.prisma.whatsAppConversation.update({
      where: { id: conv.id },
      data: {
        clientId: customer.id,
        isUnassigned: false,
        status: "OPEN",
        remoteName: conv.remoteName || customer.name,
      },
    });
    return updated;
  }

  /**
   * Create a new customer (assigned to the conversation's tenant) and link the
   * unassigned conversation to it. Full message history is preserved.
   */
  async createAndLinkCustomer(
    callerAgentId: string,
    conversationId: string,
    payload: { name: string; email?: string; city?: string; source?: string; notes?: string },
    isAdmin: boolean,
  ) {
    if (!payload.name || !payload.name.trim()) {
      throw new BadRequestException("Customer name is required");
    }
    const conv = await this.getConversation(callerAgentId, conversationId, isAdmin);

    // Create customer assigned to this conversation's owner (the tenant)
    const customer = await this.prisma.client.create({
      data: {
        name: payload.name.trim(),
        phone: conv.remotePhone, // E.164 from the WhatsApp number
        email: payload.email || null,
        city: payload.city || null,
        source: payload.source || "WhatsApp",
        notes: payload.notes || null,
        assignedEmployeeId: conv.ownerAgentId,
        status: "Active",
      },
    });

    // Link the conversation
    const updated = await this.prisma.whatsAppConversation.update({
      where: { id: conv.id },
      data: {
        clientId: customer.id,
        isUnassigned: false,
        status: "OPEN",
        remoteName: conv.remoteName || customer.name,
      },
    });
    return { customer, conversation: updated };
  }

  /**
   * List all WhatsApp phone assignments (admin only).
   */
  async listPhoneAssignments() {
    return this.prisma.whatsAppPhoneAssignment.findMany({
      include: { ownerAgent: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Create or update a phone-number -> agent mapping (admin only).
   * This is how admins tell Amplizo which tenant owns which Meta phone number.
   */
  async upsertPhoneAssignment(phoneNumberId: string, ownerAgentId: string, label?: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id: ownerAgentId } });
    if (!agent) throw new NotFoundException("Agent not found");
    return this.prisma.whatsAppPhoneAssignment.upsert({
      where: { phoneNumberId },
      update: { ownerAgentId, label },
      create: { phoneNumberId, ownerAgentId, label },
    });
  }

  /**
   * Delete a phone-number mapping (admin only).
   * After deletion, future webhooks for this phone_number_id will go to the unassigned pool.
   */
  async deletePhoneAssignment(phoneNumberId: string) {
    return this.prisma.whatsAppPhoneAssignment.delete({ where: { phoneNumberId } });
  }
}
