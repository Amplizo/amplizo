import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(chatId: string, data: any, senderId: string, senderType: string) {
    return this.prisma.message.create({ data: { chatId, senderId, senderType, senderName: data.senderName, content: data.content, status: "sent", replyTo: data.replyTo, attachments: data.attachments?.length ? { create: data.attachments } : undefined }, include: { attachments: true } });
  }

  async findByChatId(chatId: string) {
    return this.prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: "asc" }, include: { attachments: true } });
  }
}
