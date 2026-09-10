import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { MessageService } from "../chat/message.service";
import { AiService } from "../crm/ai.service";
import { ActivityLogService } from "../crm/activity-log.service";
import { NotificationService } from "../notification/notification.service";

@WebSocketGateway({ cors: { origin: (process.env.ALLOWED_WS_ORIGINS || "http://localhost:3000,http://localhost:3001").split(","), methods: ["GET", "POST"] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger("ChatGateway");

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private messageService: MessageService,
    private aiService: AiService,
    private activityLog: ActivityLogService,
    private notificationService: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.data.visitor = true;
        return;
      }
      const payload = this.jwtService.verify(token);
      const agent = await this.prisma.agent.findUnique({ where: { id: payload.sub }, select: { id: true, role: true, status: true, isActive: true } });
      if (!agent || agent.status === "offline" || agent.isActive === false) {
        client.data.visitor = true;
        return;
      }
      client.data.user = { sub: agent.id, role: agent.role };
      await this.prisma.agent.update({ where: { id: agent.id }, data: { status: "online" } });
      this.server.emit("presence", { userId: agent.id, status: "online" });
      this.logger.log(`Agent connected: ${agent.id}`);
    } catch (error) {
      client.data.visitor = true;
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.user?.sub) {
      await this.prisma.agent.update({ where: { id: client.data.user.sub }, data: { status: "offline" } });
      this.server.emit("presence", { userId: client.data.user.sub, status: "offline" });
    }
  }

  @SubscribeMessage("chat:join")
  async handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    const user = client.data.user;
    if (user) {
      const chat = await this.prisma.chat.findUnique({ where: { id: data.chatId }, select: { id: true, agentId: true } });
      if (!chat) {
        client.emit("error", { message: "Chat not found" });
        return;
      }
      const isAdmin = user.role === "admin";
      if (!isAdmin && chat.agentId !== user.sub) {
        client.emit("error", { message: "You do not have access to this chat" });
        return;
      }
    }
    client.join(`chat:${data.chatId}`);
  }

  @SubscribeMessage("chat:leave")
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    client.leave(`chat:${data.chatId}`);
  }

  @SubscribeMessage("message:send")
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const user = client.data.user;
      if (user) {
        const chat = await this.prisma.chat.findUnique({ where: { id: data.chatId }, select: { id: true, agentId: true } });
        if (!chat) {
          client.emit("error", { message: "Chat not found" });
          return;
        }
        const isAdmin = user.role === "admin";
        if (!isAdmin && chat.agentId !== user.sub) {
          client.emit("error", { message: "You do not have access to this chat" });
          return;
        }
        const message = await this.messageService.create(data.chatId, { content: data.content, attachments: data.attachments, replyTo: data.replyTo }, user.sub, "agent");
        await this.prisma.chat.update({ where: { id: data.chatId }, data: { updatedAt: new Date() } });
        this.server.to(`chat:${data.chatId}`).emit("message:new", message);
        return;
      }
      const chat = await this.prisma.chat.findUnique({ where: { id: data.chatId }, include: { client: true } });
      if (!chat) return;
      const visitorMessage = await this.messageService.create(data.chatId, { content: data.content }, data.visitorId || "visitor", "visitor");
      this.server.to(`chat:${data.chatId}`).emit("message:new", visitorMessage);
      await this.prisma.chat.update({ where: { id: data.chatId }, data: { unreadCount: { increment: 1 }, updatedAt: new Date() } });

      if (chat.conversationState !== "AI_ACTIVE") return;

      const intent = this.aiService.detectBuyingIntent(data.content);
      if (intent.isInterested) {
        if (chat.clientId) {
          await this.prisma.client.update({ where: { id: chat.clientId }, data: { currentLeadStatus: "HOT_LEAD" } });
          await this.activityLog.log({
            clientId: chat.clientId,
            activityType: "LEAD_STATUS_CHANGED",
            description: `Auto-marked as HOT LEAD from chat (keywords: ${intent.matchedKeywords.join(", ")})`,
          });
          if (chat.agentId) {
            await this.prisma.client.update({
              where: { id: chat.clientId },
              data: { assignedEmployeeId: chat.agentId },
            });
            await this.notificationService.createForAgent(chat.agentId, {
              type: "handover",
              title: "Hot lead handover triggered",
              message: `A visitor on chat ${chat.id} showed buying intent and was marked as HOT LEAD. Please take over the conversation.`,
              link: `/chats/${chat.id}`,
              metadata: JSON.stringify({ chatId: chat.id, clientId: chat.clientId, reason: "buying_intent" }),
            });
          }
        }
        await this.prisma.chat.update({ where: { id: data.chatId }, data: { conversationState: "WAITING_FOR_HUMAN" } });
        this.server.to(`chat:${data.chatId}`).emit("conversation:state", { chatId: data.chatId, state: "WAITING_FOR_HUMAN" });
        this.server.to(`chat:${data.chatId}`).emit("handover:triggered", { chatId: data.chatId, reason: "buying_intent" });
        return;
      }

      const aiReply = await this.aiService.generateResponse(data.content);
      const aiMessage = await this.messageService.create(data.chatId, { content: aiReply }, "ai_assistant", "ai");
      this.server.to(`chat:${data.chatId}`).emit("message:new", aiMessage);
    } catch (error) {
      client.emit("error", { message: "Failed to send message" });
    }
  }

  @SubscribeMessage("typing")
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.server.to(`chat:${data.chatId}`).emit("typing", { chatId: data.chatId, userId: client.data.user?.sub || "visitor", userName: client.data.user?.name || "Visitor", isTyping: data.isTyping });
  }

  @SubscribeMessage("message:status")
  handleMessageStatus(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.server.to(`chat:${data.chatId}`).emit("message:status", { chatId: data.chatId, messageId: data.messageId, status: data.status });
  }
}
