import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async assertChatAccess(chatId: string, actorId: string, isAdmin: boolean) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId }, select: { id: true, agentId: true } });
    if (!chat) throw new NotFoundException("Chat not found");
    if (!isAdmin && chat.agentId !== actorId) {
      throw new ForbiddenException("You do not have access to this chat");
    }
    return chat;
  }

  async create(chatId: string, data: any, senderId: string, senderType: string) {
    return this.prisma.message.create({ data: { chatId, senderId, senderType, senderName: data.senderName, content: data.content, status: "sent", replyTo: data.replyTo, attachments: data.attachments?.length ? { create: data.attachments } : undefined }, include: { attachments: true } });
  }

  async findByChatId(chatId: string, skip = 0, take = 50) {
    const [items, total] = await Promise.all([
      this.prisma.message.findMany({ where: { chatId }, skip, take, orderBy: { createdAt: "asc" }, include: { attachments: true } }),
      this.prisma.message.count({ where: { chatId } }),
    ]);
    return { items, total, skip, take };
  }
}
