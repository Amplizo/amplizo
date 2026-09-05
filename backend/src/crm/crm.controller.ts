import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, BadRequestException } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { CustomerService } from "./customer.service";
import { PurchaseService } from "./purchase.service";
import { FollowUpService } from "./follow-up.service";
import { AssignmentService } from "./assignment.service";
import { AiService } from "./ai.service";
import { ScheduledCallService } from "./scheduled-call.service";
import { EmailService } from "../common/services/email.service";
import { ActivityLogService } from "./activity-log.service";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

interface RequestWithUser extends Request {
  user: { id: string; role: string };
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("agent", "admin")
export class CrmController {
  constructor(
    private customerService: CustomerService,
    private purchaseService: PurchaseService,
    private followUpService: FollowUpService,
    private assignmentService: AssignmentService,
    private aiService: AiService,
    private scheduledCallService: ScheduledCallService,
    private emailService: EmailService,
    private activityLog: ActivityLogService,
  ) {}

  private actor(req: RequestWithUser) {
    return { actorId: req.user.id, isAdmin: req.user.role === "admin" };
  }

  // ===== CUSTOMERS =====
  @Get("customers")
  async listCustomers(@Req() req: RequestWithUser, @Query() query: any) {
    return this.customerService.findAll({
      ...this.actor(req),
      search: query.search,
      leadStatus: query.leadStatus,
      status: query.status,
      plan: query.plan,
      isNew: query.isNew === "true" || query.isNew === true,
      assignedEmployeeId: query.assignedEmployeeId,
      city: query.city,
      skip: query.skip ? Number(query.skip) : 0,
      take: query.take ? Number(query.take) : 50,
    });
  }

  @Get("customers/stats")
  async customerStats(@Req() req: RequestWithUser) {
    return this.customerService.getStats(req.user.id, req.user.role === "admin");
  }

  @Get("customers/:id")
  async getCustomer(@Req() req: RequestWithUser, @Param("id") id: string) {
    return this.customerService.findOne(id, req.user.id, req.user.role === "admin");
  }

  @Post("customers")
  async createCustomer(@Req() req: RequestWithUser, @Body() body: any) {
    const isAdmin = req.user.role === "admin";
    const createPayload = { ...body };
    if (!isAdmin) {
      createPayload.assignedEmployeeId = req.user.id;
    }
    const { client, isReturning } = await this.customerService.create(createPayload, req.user.id);
    if (body.purchaseAmount && body.purchaseAmount > 0) {
      await this.purchaseService.create(
        { clientId: client.id, purchaseAmount: body.purchaseAmount, productDetails: body.productDetails },
        req.user.id,
      );
    }
    try {
      return await this.customerService.findOne(client.id, req.user.id, isAdmin);
    } catch {
      return client;
    }
  }

  @Post("customers/bulk")
  async bulkCreateCustomers(@Req() req: RequestWithUser, @Body() body: { customers: any[] }) {
    const isAdmin = req.user.role === "admin";
    const list = Array.isArray(body?.customers) ? body.customers : [];
    const results: any[] = [];
    for (const row of list) {
      const name = (row?.name || "").toString().trim();
      const phone = (row?.phone || "").toString().replace(/[^0-9]/g, "");
      if (!name || phone.length < 10 || phone.length > 15) {
        results.push({ ok: false, name, status: "validation", error: "Name and a valid 10-15 digit mobile are required" });
        continue;
      }
      const createPayload: any = { ...row, name, phone };
      if (!isAdmin) {
        createPayload.assignedEmployeeId = req.user.id;
      }
      try {
        const { client, isReturning } = await this.customerService.create(createPayload, req.user.id);
        if (row?.purchaseAmount && Number(row.purchaseAmount) > 0) {
          try {
            await this.purchaseService.create(
              { clientId: client.id, purchaseAmount: Number(row.purchaseAmount), productDetails: row.productDetails },
              req.user.id,
            );
          } catch {}
        }
        results.push({ ok: true, name, id: client.id, isReturning, status: isReturning ? "duplicate" : "created" });
      } catch (e: any) {
        const msg = e?.response?.message || e?.message || "Failed to create customer";
        results.push({ ok: false, name, status: "system", error: typeof msg === "string" ? msg : JSON.stringify(msg) });
      }
    }
    return { results, total: list.length, success: results.filter((r) => r.ok).length };
  }

  @Post("customers/bulk-delete")
  async bulkDeleteCustomers(@Req() req: RequestWithUser, @Body() body: { ids: string[] }) {
    const isAdmin = req.user.role === "admin";
    const ids = Array.isArray(body?.ids) ? body.ids.filter((x) => typeof x === "string") : [];
    if (ids.length === 0) {
      return { total: 0, success: 0, failed: 0, results: [] };
    }
    const results: any[] = [];
    for (const id of ids) {
      try {
        const existing = await this.customerService.findOneRaw(id);
        if (!existing) {
          results.push({ ok: false, id, status: "not_found", error: "Customer not found" });
          continue;
        }
        if (!isAdmin && existing.assignedEmployeeId !== req.user.id) {
          results.push({ ok: false, id, status: "forbidden", error: "You can only delete your assigned customers" });
          continue;
        }
        await this.customerService.delete(id);
        results.push({ ok: true, id, status: "deleted" });
      } catch (e: any) {
        const msg = e?.response?.message || e?.message || "Delete failed";
        results.push({ ok: false, id, status: "system", error: typeof msg === "string" ? msg : JSON.stringify(msg) });
      }
    }
    const success = results.filter((r) => r.ok).length;
    return { results, total: ids.length, success, failed: ids.length - success };
  }

  @Put("customers/:id")
  async updateCustomer(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: any) {
    return this.customerService.update(id, body, req.user.id, req.user.role === "admin");
  }

  @Delete("customers/:id")
  async deleteCustomer(@Param("id") id: string) {
    return this.customerService.delete(id);
  }

  // ===== PURCHASES =====
  @Get("customers/:id/purchases")
  async getPurchases(@Param("id") id: string) {
    return this.purchaseService.findByClient(id);
  }

  @Post("customers/:id/purchases")
  async addPurchase(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: any) {
    return this.purchaseService.create({ clientId: id, ...body }, req.user.id);
  }

  @Get("sales/stats")
  async salesStats(@Req() req: RequestWithUser) {
    return this.purchaseService.getSalesStats(req.user.id, req.user.role === "admin");
  }

  // ===== FOLLOW-UPS =====
  @Get("followups")
  @Roles("agent")
  async listFollowUps(@Req() req: RequestWithUser, @Query() query: any) {
    return this.followUpService.findAll({
      ...this.actor(req),
      status: query.status,
      today: query.today === "true",
      overdue: query.overdue === "true",
      clientId: query.clientId,
      employeeId: query.employeeId,
    });
  }

  @Get("followups/stats")
  @Roles("agent")
  async followUpStats(@Req() req: RequestWithUser) {
    return this.followUpService.getStats(req.user.id, req.user.role === "admin");
  }

  @Get("followups/:id")
  @Roles("agent")
  async getFollowUp(@Req() req: RequestWithUser, @Param("id") id: string) {
    return this.followUpService.findOne(id, req.user.id, req.user.role === "admin");
  }

  @Post("followups/:id/complete")
  @Roles("agent")
  async completeFollowUp(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: any) {
    return this.followUpService.complete(id, body?.notes, req.user.id, req.user.role === "admin");
  }

  @Post("followups/:id/skip")
  @Roles("agent")
  async skipFollowUp(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: any) {
    return this.followUpService.skip(id, body?.notes, req.user.id, req.user.role === "admin");
  }

  @Post("followups/:id/send-sms")
  @Roles("agent")
  async sendFollowUpSms(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: { message?: string }) {
    return this.followUpService.sendFollowUpSms(id, req.user.id, req.user.role === "admin", body?.message);
  }

  // ===== ASSIGNMENTS =====
  @Post("customers/:id/assign")
  async assign(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: any) {
    return this.assignmentService.assign(id, body.employeeId, req.user.id);
  }

  @Post("customers/:id/unassign")
  async unassign(@Req() req: RequestWithUser, @Param("id") id: string) {
    return this.assignmentService.unassign(id, req.user.id);
  }

  @Get("employees")
  async listEmployees() {
    return this.assignmentService.getEmployees();
  }

  @Get("employees/:id/workload")
  async employeeWorkload(@Param("id") id: string) {
    return this.assignmentService.getEmployeeWorkload(id);
  }

  // ===== SCHEDULED CALLS =====
  @Post("crm/schedule-call")
  @Roles("agent")
  async scheduleCall(@Req() req: RequestWithUser, @Body() body: { clientId: string; scheduledDate: string; notes?: string }) {
    if (!body?.clientId || !body?.scheduledDate) {
      throw new BadRequestException("Customer and call date/time are required");
    }
    const client = await this.customerService.findOneRaw(body.clientId);
    if (!client) throw new BadRequestException("Customer not found");
    if (req.user.role !== "admin" && client.assignedEmployeeId !== req.user.id) {
      throw new BadRequestException("You can only schedule calls for your assigned customers");
    }
    return this.scheduledCallService.create(
      { clientId: body.clientId, phone: client.phone || "", scheduledDate: body.scheduledDate, notes: body.notes },
      req.user.id,
    );
  }

  @Get("crm/scheduled-calls")
  @Roles("agent")
  async listScheduledCalls(@Req() req: RequestWithUser) {
    return this.scheduledCallService.findAll(req.user.id, req.user.role === "admin");
  }

  @Get("crm/scheduled-calls/stats")
  @Roles("agent")
  async scheduledCallStats(@Req() req: RequestWithUser) {
    return this.scheduledCallService.getStats(req.user.id, req.user.role === "admin");
  }

  // ===== EMAIL =====
  @Post("crm/send-email")
  @Roles("agent")
  async sendEmail(@Req() req: RequestWithUser, @Body() body: { clientId: string; subject: string; message: string }) {
    if (!body?.clientId || !body?.subject || !body?.message) {
      throw new BadRequestException("Customer, subject and message are required");
    }
    const client = await this.customerService.findOneRaw(body.clientId);
    if (!client) throw new BadRequestException("Customer not found");
    if (req.user.role !== "admin" && client.assignedEmployeeId !== req.user.id) {
      throw new BadRequestException("You can only send emails to your assigned customers");
    }
    if (!client.email) {
      throw new BadRequestException("Customer has no email address on file");
    }

    if (!this.emailService.isReady()) {
      throw new BadRequestException("Email service is not configured on the backend");
    }

    const emailResult = await this.emailService.sendEmail(
      client.email,
      body.subject,
      `<p>${body.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "</p><p>")}</p>`,
    );

    await this.activityLog.log({
      clientId: body.clientId,
      userId: req.user.id,
      activityType: emailResult.success ? "EMAIL_SENT" : "EMAIL_FAILED",
      description: emailResult.success
        ? `Email sent to ${client.name} (${client.email})${emailResult.mock ? " [MOCK]" : ""}`
        : `Email FAILED to ${client.name} (${client.email}): ${emailResult.error}`,
      metadata: JSON.stringify({ to: client.email, subject: body.subject, mock: !!emailResult.mock, error: emailResult.error, messageId: emailResult.messageId }),
    });

    return {
      success: emailResult.success,
      mock: emailResult.mock || false,
      to: client.email,
      subject: body.subject,
      messageId: emailResult.messageId,
      error: emailResult.error,
    };
  }

  // ===== AI (text chat only - no voice/phone calls) =====
  @Post("ai/detect-intent")
  async detectIntent(@Body() body: { message: string }) {
    return this.aiService.detectBuyingIntent(body?.message || "");
  }

  @Post("ai/respond")
  async aiRespond(@Body() body: { message: string; context?: any }) {
    const reply = await this.aiService.generateResponse(body?.message || "", body?.context);
    return { reply };
  }
}
