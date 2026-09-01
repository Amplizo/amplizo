import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVisitorDto } from "./dto/create-visitor.dto";

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}

  async create(createVisitorDto: CreateVisitorDto) {
    return this.prisma.visitor.create({ data: { name: createVisitorDto.name, email: createVisitorDto.email, status: "online", lastSeenAt: new Date() } });
  }

  async findAll() { return this.prisma.visitor.findMany({ orderBy: { createdAt: "desc" } }); }
  async findOne(id: string) { return this.prisma.visitor.findUnique({ where: { id } }); }
  async updateStatus(id: string, status: string) { return this.prisma.visitor.update({ where: { id }, data: { status, lastSeenAt: new Date() } }); }
}
