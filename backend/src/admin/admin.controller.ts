import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

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
}
