import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, ForbiddenException } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { AssignAgentDto } from "./dto/assign-agent.dto";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

interface RequestWithUser extends Request {
  user: { id: string; role: string };
}

@Controller()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post("chats")
  async create(@Body() createChatDto: CreateChatDto) { return this.chatService.create(createChatDto); }

  @Get("chats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent")
  async findAll(@Req() req: RequestWithUser, @Query("status") status?: string) {
    const isAdmin = req.user.role === "admin";
    const agentId = isAdmin ? undefined : req.user.id;
    return this.chatService.findAll(status, agentId);
  }

  @Get("chats/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent")
  async findOne(@Req() req: RequestWithUser, @Param("id") id: string) {
    const chat = await this.chatService.findOne(id);
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && chat.agentId && chat.agentId !== req.user.id) {
      throw new ForbiddenException("You do not have access to this chat");
    }
    return chat;
  }

  @Post("chats/:id/assign")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent")
  async assignAgent(@Param("id") id: string, @Body() assignAgentDto: AssignAgentDto) { return this.chatService.assignAgent(id, assignAgentDto.agentId); }

  @Post("chats/:id/close")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent")
  async closeChat(@Param("id") id: string) { return this.chatService.closeChat(id); }

  @Post("chats/:id/reopen")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent")
  async reopenChat(@Param("id") id: string) { return this.chatService.reopenChat(id); }

  // AI handover - stop AI auto-reply, mark as waiting for human
  @Post("chats/:id/trigger-handover")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent")
  async triggerHandover(@Param("id") id: string) {
    return this.chatService.triggerAiHandover(id);
  }

  // Link chat to existing customer (by customer ID)
  @Post("chats/:id/link-customer")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent")
  async linkCustomer(@Param("id") id: string, @Body() body: { clientId: string }) {
    return this.chatService.linkToCustomer(id, body.clientId);
  }

  // Set conversation state (AI_ACTIVE / WAITING_FOR_HUMAN / HUMAN_ASSIGNED / HUMAN_ACTIVE / CLOSED)
  @Post("chats/:id/state")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent")
  async setState(@Param("id") id: string, @Body() body: { state: string }) {
    return this.chatService.setConversationState(id, body.state);
  }

  @Post("chats/:id/mark-read")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent")
  async markRead(@Param("id") id: string) {
    return this.chatService.markAsRead(id);
  }
}
