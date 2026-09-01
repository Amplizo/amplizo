import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChatDto } from "./dto/create-chat.dto";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async create(createChatDto: CreateChatDto) {
    return this.prisma.chat.create({ data: { visitorId: createChatDto.visitorId, subject: createChatDto.subject, status: "waiting", unreadCount: 0, tags: "" }, include: { visitor: true, agent: { select: { id: true, name: true, email: true, role: true, avatar: true, status: true } } } });
  }

  async findAll(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.chat.findMany({ where, orderBy: { updatedAt: "desc" }, include: { visitor: true, agent: { select: { id: true, name: true, email: true, role: true, avatar: true, status: true } }, messages: { take: 1, orderBy: { createdAt: "desc" } } } });
  }

  async findOne(id: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id }, include: { visitor: true, agent: { select: { id: true, name: true, email: true, role: true, avatar: true, status: true } }, messages: { orderBy: { createdAt: "asc" }, include: { attachments: true } } } });
    if (!chat) throw new NotFoundException("Chat not found");
    return chat;
  }

  async assignAgent(chatId: string, agentId: string) {
    return this.prisma.chat.update({ where: { id: chatId }, data: { agentId, status: "active" }, include: { visitor: true, agent: { select: { id: true, name: true, email: true, role: true, avatar: true, status: true } } } });
  }

  async closeChat(chatId: string) {
    return this.prisma.chat.update({ where: { id: chatId }, data: { status: "closed", closedAt: new Date() } });
  }
}
