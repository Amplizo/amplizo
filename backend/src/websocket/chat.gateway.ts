import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ChatService } from "../chat/chat.service";
import { MessageService } from "../chat/message.service";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../crm/ai.service";
import { ActivityLogService } from "../crm/activity-log.service";

@WebSocketGateway({ cors: { origin: ["http://localhost:3000", "http://localhost:3001"], methods: ["GET", "POST"] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger("ChatGateway");

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private messageService: MessageService,
    private prisma: PrismaService,
    private aiService: AiService,
    private activityLog: ActivityLogService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        // Allow visitor connections (no token = visitor)
        client.data.visitor = true;
        return;
      }
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      await this.prisma.agent.update({ where: { id: payload.sub }, data: { status: "online" } });
      this.server.emit("presence", { userId: payload.sub, status: "online" });
      this.logger.log(`Agent connected: ${payload.sub}`);
    } catch (error) {
      // Visitor connections are fine
      client.data.visitor = true;
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.user) {
      await this.prisma.agent.update({ where: { id: client.data.user.sub }, data: { status: "offline" } });
      this.server.emit("presence", { userId: client.data.user.sub, status: "offline" });
    }
  }

  @SubscribeMessage("chat:join")
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
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
      // Agent message
      if (user) {
        const message = await this.messageService.create(data.chatId, { content: data.content, attachments: data.attachments, replyTo: data.replyTo }, user.sub, "agent");
        await this.prisma.chat.update({ where: { id: data.chatId }, data: { updatedAt: new Date() } });
        this.server.to(`chat:${data.chatId}`).emit("message:new", message);
        return;
      }
      // Visitor message - detect AI intent and respond
      const chat = await this.prisma.chat.findUnique({ where: { id: data.chatId }, include: { client: true } });
      if (!chat) return;
      const visitorMessage = await this.messageService.create(data.chatId, { content: data.content }, data.visitorId || "visitor", "visitor");
      this.server.to(`chat:${data.chatId}`).emit("message:new", visitorMessage);
      await this.prisma.chat.update({ where: { id: data.chatId }, data: { unreadCount: { increment: 1 }, updatedAt: new Date() } });

      // Only auto-respond if AI is active
      if (chat.conversationState !== "AI_ACTIVE") return;

      const intent = this.aiService.detectBuyingIntent(data.content);
      if (intent.isInterested) {
        // Mark as hot lead + trigger handover
        if (chat.clientId) {
          await this.prisma.client.update({ where: { id: chat.clientId }, data: { currentLeadStatus: "HOT_LEAD" } });
          await this.activityLog.log({
            clientId: chat.clientId,
            activityType: "LEAD_STATUS_CHANGED",
            description: `Auto-marked as HOT LEAD from chat (keywords: ${intent.matchedKeywords.join(", ")})`,
          });
        }
        await this.prisma.chat.update({ where: { id: data.chatId }, data: { conversationState: "WAITING_FOR_HUMAN" } });
        this.server.to(`chat:${data.chatId}`).emit("conversation:state", { chatId: data.chatId, state: "WAITING_FOR_HUMAN" });
        this.server.to(`chat:${data.chatId}`).emit("handover:triggered", { chatId: data.chatId, reason: "buying_intent" });
        return;
      }

      // Generate AI reply
      const aiReply = await this.aiService.generateResponse(data.content);
      const aiMessage = await this.messageService.create(data.chatId, { content: aiReply }, "ai_assistant", "ai");
      this.server.to(`chat:${data.chatId}`).emit("message:new", aiMessage);
    } catch (error) {
      client.emit("error", { message: "Failed to send message", error: error.message });
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
