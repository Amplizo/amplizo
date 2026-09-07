import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { Request } from "express";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "agent")
@ApiBearerAuth()
export class NotificationController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Get notifications for current user" })
  async getNotifications(@Req() req: Request, @Query("unread") unread?: string, @Query("limit") limit?: string, @Query("skip") skip?: string) {
    const agentId = (req.user as any)?.id;
    const where: any = { agentId };
    if (unread === "true") where.read = false;
    const take = limit ? parseInt(limit) : 20;
    const skipVal = skip ? parseInt(skip) : 0;

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: skipVal,
        take,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, skip: skipVal, take };
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  async getUnreadCount(@Req() req: Request) {
    const agentId = (req.user as any)?.id;
    const count = await this.prisma.notification.count({ where: { agentId, read: false } });
    return { count };
  }

  @Post()
  @ApiOperation({ summary: "Create a notification" })
  async createNotification(@Body() body: { type: string; title: string; message: string; link?: string; metadata?: string }) {
    return this.prisma.notification.create({
      data: {
        type: body.type,
        title: body.title,
        message: body.message,
        link: body.link,
        metadata: body.metadata,
      },
    });
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  async markAsRead(@Param("id") id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  @Post("mark-all-read")
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead() {
    await this.prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    return { success: true };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification" })
  async deleteNotification(@Param("id") id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  @Delete()
  @ApiOperation({ summary: "Delete all read notifications" })
  async clearRead() {
    await this.prisma.notification.deleteMany({ where: { read: true } });
    return { success: true };
  }
}
