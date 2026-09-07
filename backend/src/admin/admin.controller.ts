import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { Request } from "express";

@ApiTags("admin")
@Controller()
export class AdminController {
  constructor(private adminService: AdminService, private prisma: PrismaService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  async health() {
    let dbStatus = "ok";
    try { await this.prisma.$queryRaw`SELECT 1`; } catch { dbStatus = "error"; }
    return { status: "ok", database: dbStatus, timestamp: new Date().toISOString(), service: "Amplizo Backend", version: "1.0.0" };
  }

  @Get("admin/stats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get admin dashboard statistics" })
  async getStats() { return this.adminService.getStats(); }

  @Get("admin/clients")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all clients" })
  async getClients(@Query("search") search?: string, @Query("skip") skip?: string, @Query("take") take?: string) {
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
      ],
    } : {};
    const s = skip ? Number(skip) : 0;
    const t = take ? Number(take) : 50;
    const [items, total] = await Promise.all([
      this.prisma.client.findMany({ where, skip: s, take: t, orderBy: { createdAt: "desc" } }),
      this.prisma.client.count({ where }),
    ]);
    return { items, total, skip: s, take: t };
  }

  @Get("admin/clients/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get client by ID" })
  async getClient(@Param("id") id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  @Post("admin/clients")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create new client" })
  async createClient(@Body() body: { name: string; email: string; phone?: string; city?: string; plan?: string; status?: string }) {
    return this.prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        city: body.city,
        plan: body.plan || "Starter",
        status: body.status || "Active",
      },
    });
  }

  @Put("admin/clients/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update client" })
  async updateClient(@Param("id") id: string, @Body() body: { name?: string; email?: string; phone?: string; city?: string; plan?: string; status?: string }) {
    return this.prisma.client.update({
      where: { id },
      data: body,
    });
  }

  @Delete("admin/clients/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete client" })
  async deleteClient(@Param("id") id: string) {
    return this.prisma.client.delete({ where: { id } });
  }

  @Get("search")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Search clients, chats and visitors (accessible to all authenticated users)" })
  async publicSearch(@Req() req: Request, @Query("q") query: string) {
    if (!query || query.length < 2) return { clients: [], chats: [], visitors: [] };

    const searchTerm = query.toLowerCase();
    const user = req.user as any;
    const isAdmin = user?.role === "admin";
    const actorId = user?.id;

    const clientWhere: any = { OR: [{ name: { contains: searchTerm } }, { email: { contains: searchTerm } }, { city: { contains: searchTerm } }, { phone: { contains: searchTerm } }] };
    const chatWhere: any = { OR: [{ subject: { contains: searchTerm } }, { tags: { contains: searchTerm } }] };
    const visitorWhere: any = { OR: [{ name: { contains: searchTerm } }, { email: { contains: searchTerm } }] };

    if (!isAdmin) {
      clientWhere.assignedEmployeeId = actorId;
      chatWhere.agentId = actorId;
    }

    const [clients, chats, visitors] = await Promise.all([
      this.prisma.client.findMany({ where: clientWhere, take: 5, orderBy: { createdAt: "desc" } }),
      this.prisma.chat.findMany({ where: chatWhere, take: 5, orderBy: { updatedAt: "desc" }, include: { visitor: true } }),
      this.prisma.visitor.findMany({ where: visitorWhere, take: 5, orderBy: { lastSeenAt: "desc" } }),
    ]);

    return {
      clients: clients.map((c: { id: any; name: any; email: any; plan: any; status: any }) => ({ id: c.id, type: "client", title: c.name, subtitle: c.email, badge: c.plan, status: c.status })),
      chats: chats.map((c: { id: any; subject: any; status: any; visitor: any }) => ({ id: c.id, type: "chat", title: c.subject || `Chat #${c.id.slice(0, 8)}`, subtitle: `Status: ${c.status}`, badge: c.status, visitorName: c.visitor?.name, visitorEmail: c.visitor?.email })),
      visitors: visitors.map((v: { id: any; name: any; email: any; status: any }) => ({ id: v.id, type: "visitor", title: v.name || "Anonymous", subtitle: v.email || "No email", badge: v.status })),
    };
  }

  @Get("admin/search")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Global search across clients, agents, chats (admin only)" })
  async globalSearch(@Query("q") query: string) {
    if (!query || query.length < 2) return { clients: [], agents: [], chats: [], visitors: [] };

    const searchTerm = query.toLowerCase();
    const clientWhere = { OR: [{ name: { contains: searchTerm } }, { email: { contains: searchTerm } }, { city: { contains: searchTerm } }, { phone: { contains: searchTerm } }] };
    const agentWhere = { OR: [{ name: { contains: searchTerm } }, { email: { contains: searchTerm } }] };
    const chatWhere = { OR: [{ subject: { contains: searchTerm } }, { tags: { contains: searchTerm } }] };
    const visitorWhere = { OR: [{ name: { contains: searchTerm } }, { email: { contains: searchTerm } }] };

    const [clients, agents, chats, visitors] = await Promise.all([
      this.prisma.client.findMany({ where: clientWhere, take: 5, orderBy: { createdAt: "desc" } }),
      this.prisma.agent.findMany({ where: agentWhere, take: 5, orderBy: { createdAt: "desc" } }),
      this.prisma.chat.findMany({ where: chatWhere, take: 5, orderBy: { createdAt: "desc" } }),
      this.prisma.visitor.findMany({ where: visitorWhere, take: 5, orderBy: { lastSeenAt: "desc" } }),
    ]);

    return {
      clients: clients.map((c: { id: any; name: any; email: any; plan: any; status: any }) => ({ id: c.id, type: "client", title: c.name, subtitle: c.email, badge: c.plan, status: c.status })),
      agents: agents.map((a: { id: any; name: any; email: any; role: any; status: any }) => ({ id: a.id, type: "agent", title: a.name, subtitle: a.email, badge: a.role, status: a.status })),
      chats: chats.map((c: { id: any; subject: any; status: any }) => ({ id: c.id, type: "chat", title: c.subject || `Chat #${c.id.slice(0, 8)}`, subtitle: `Status: ${c.status}`, badge: c.status })),
      visitors: visitors.map((v: { id: any; name: any; email: any; status: any }) => ({ id: v.id, type: "visitor", title: v.name || "Anonymous", subtitle: v.email || "No email", badge: v.status })),
    };
  }
}
