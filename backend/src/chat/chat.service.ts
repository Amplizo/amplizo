import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChatDto } from "./dto/create-chat.dto";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async assertChatAccess(chatId: string, actorId: string, isAdmin: boolean) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId }, select: { id: true, agentId: true } });
    if (!chat) throw new NotFoundException("Chat not found");
    if (!isAdmin && chat.agentId !== actorId) {
      throw new ForbiddenException("You do not have access to this chat");
    }
    return chat;
  }

  async create(createChatDto: CreateChatDto, actorId: string, isAdmin: boolean) {
    const client = createChatDto.clientId ? await this.prisma.client.findUnique({ where: { id: createChatDto.clientId } }) : null;
    if (createChatDto.clientId && !client) {
      throw new ForbiddenException("Customer not found");
    }
    if (createChatDto.clientId && client && !isAdmin && client.assignedEmployeeId !== actorId) {
      throw new ForbiddenException("You can only create chats for your assigned customers");
    }
    const agentId = isAdmin ? createChatDto.agentId : actorId;
    return this.prisma.chat.create({
      data: {
        visitorId: createChatDto.visitorId,
        subject: createChatDto.subject,
        clientId: createChatDto.clientId,
        agentId,
        status: "waiting",
        unreadCount: 0,
        tags: "",
        conversationState: "AI_ACTIVE",
      },
      include: {
        visitor: true,
        client: true,
        agent: { select: { id: true, name: true, email: true, role: true, avatar: true, status: true } },
      },
    });
  }

  async findAll(status?: string, agentId?: string, skip = 0, take = 50) {
    const where: any = {};
    if (status) where.status = status;
    if (agentId) where.agentId = agentId;
    const [items, total] = await Promise.all([
      this.prisma.chat.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: {
          visitor: true,
          client: { select: { id: true, name: true, phone: true, city: true, currentLeadStatus: true } },
          agent: { select: { id: true, name: true, email: true, role: true, avatar: true, status: true } },
          messages: { take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      this.prisma.chat.count({ where }),
    ]);
    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        visitor: true,
        client: {
          include: {
            assignedEmployee: { select: { id: true, name: true, email: true } },
            purchases: { orderBy: { purchaseDate: "desc" }, take: 5 },
            followUps: { where: { status: "PENDING" }, orderBy: { scheduledDate: "asc" }, take: 3 },
          },
        },
        agent: { select: { id: true, name: true, email: true, role: true, avatar: true, status: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { attachments: true } },
      },
    });
    if (!chat) throw new NotFoundException("Chat not found");
    return chat;
  }

  async assignAgent(chatId: string, agentId: string, actorId: string, isAdmin: boolean) {
    await this.assertChatAccess(chatId, actorId, isAdmin);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { agentId, status: "active", conversationState: "HUMAN_ASSIGNED" },
      include: {
        visitor: true,
        client: true,
        agent: { select: { id: true, name: true, email: true, role: true, avatar: true, status: true } },
      },
    });
  }

  async closeChat(chatId: string, actorId: string, isAdmin: boolean) {
    await this.assertChatAccess(chatId, actorId, isAdmin);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { status: "closed", conversationState: "CLOSED", closedAt: new Date() },
    });
  }

  async reopenChat(chatId: string, actorId: string, isAdmin: boolean) {
    await this.assertChatAccess(chatId, actorId, isAdmin);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { status: "active", conversationState: "HUMAN_ACTIVE", closedAt: null },
      include: {
        visitor: true,
        client: true,
        agent: { select: { id: true, name: true, email: true, role: true, avatar: true, status: true } },
      },
    });
  }

  async triggerAiHandover(chatId: string, actorId: string, isAdmin: boolean) {
    await this.assertChatAccess(chatId, actorId, isAdmin);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { conversationState: "WAITING_FOR_HUMAN" },
    });
  }

  async setConversationState(chatId: string, state: string, actorId: string, isAdmin: boolean) {
    await this.assertChatAccess(chatId, actorId, isAdmin);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { conversationState: state },
    });
  }

  async linkToCustomer(chatId: string, clientId: string, actorId: string, isAdmin: boolean) {
    await this.assertChatAccess(chatId, actorId, isAdmin);
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException("Customer not found");
    if (!isAdmin && client.assignedEmployeeId !== actorId) {
      throw new ForbiddenException("You can only link chats to your assigned customers");
    }
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { clientId },
      include: { client: true },
    });
  }

  async markAsRead(chatId: string, actorId: string, isAdmin: boolean) {
    await this.assertChatAccess(chatId, actorId, isAdmin);
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { unreadCount: 0 },
    });
  }
}
