import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { VisitorService } from "./visitor.service";
import { CreateVisitorDto } from "./dto/create-visitor.dto";
import { JwtAuthGuard } from "../auth/jwt.guard";

@Controller()
export class VisitorController {
  constructor(private visitorService: VisitorService) {}

  @Post("visitor")
  async create(@Body() createVisitorDto: CreateVisitorDto) { return this.visitorService.create(createVisitorDto); }

  @Get("visitors")
  @UseGuards(JwtAuthGuard)
  async findAll() { return this.visitorService.findAll(); }

  @Get("visitors/:id")
  @UseGuards(JwtAuthGuard)
  async findOne(@Param("id") id: string) { return this.visitorService.findOne(id); }

  @Patch("visitors/:id/status")
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param("id") id: string, @Body("status") status: string) { return this.visitorService.updateStatus(id, status); }
}
