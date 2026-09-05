import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "agent")
@ApiBearerAuth()
export class NotificationController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Get notifications for current user" })
  async getNotifications(@Query("unread") unread?: string, @Query("limit") limit?: string) {
    const agentId = undefined;
    const where: any = {};
    if (unread === "true") where.read = false;
    const take = limit ? parseInt(limit) : 20;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  async getUnreadCount() {
    const count = await this.prisma.notification.count({ where: { read: false } });
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
