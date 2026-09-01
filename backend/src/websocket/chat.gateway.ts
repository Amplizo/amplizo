import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ChatService } from "../chat/chat.service";
import { MessageService } from "../chat/message.service";
import { PrismaService } from "../prisma/prisma.service";

@WebSocketGateway({ cors: { origin: ["http://localhost:3000", "http://localhost:3001"], methods: ["GET", "POST"] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger("ChatGateway");

  constructor(private jwtService: JwtService, private chatService: ChatService, private messageService: MessageService, private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) { client.disconnect(); return; }
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      await this.prisma.agent.update({ where: { id: payload.sub }, data: { status: "online" } });
      this.server.emit("presence", { userId: payload.sub, status: "online" });
      this.logger.log(`Agent connected: ${payload.sub}`);
    } catch (error) { client.disconnect(); }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.user) {
      await this.prisma.agent.update({ where: { id: client.data.user.sub }, data: { status: "offline" } });
      this.server.emit("presence", { userId: client.data.user.sub, status: "offline" });
      this.logger.log(`Agent disconnected: ${client.data.user.sub}`);
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
      const message = await this.messageService.create(data.chatId, { content: data.content, attachments: data.attachments, replyTo: data.replyTo }, user.sub, "agent");
      await this.prisma.chat.update({ where: { id: data.chatId }, data: { updatedAt: new Date() } });
      this.server.to(`chat:${data.chatId}`).emit("message:new", message);
    } catch (error) {
      client.emit("error", { message: "Failed to send message", error: error.message });
    }
  }

  @SubscribeMessage("typing")
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    client.to(`chat:${data.chatId}`).emit("typing", { chatId: data.chatId, userId: client.data.user.sub, userName: client.data.user.name || "Agent", isTyping: data.isTyping });
  }

  @SubscribeMessage("message:status")
  handleMessageStatus(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.server.to(`chat:${data.chatId}`).emit("message:status", { chatId: data.chatId, messageId: data.messageId, status: data.status });
  }
}
