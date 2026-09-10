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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async create(@Req() req: RequestWithUser, @Body() createChatDto: CreateChatDto) {
    const isAdmin = req.user.role === "admin";
    return this.chatService.create(createChatDto, req.user.id, isAdmin);
  }

  @Get("chats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async findAll(@Req() req: RequestWithUser, @Query("status") status?: string, @Query("skip") skip?: string, @Query("take") take?: string) {
    const isAdmin = req.user.role === "admin";
    const agentId = isAdmin ? undefined : req.user.id;
    return this.chatService.findAll(status, agentId, skip ? Number(skip) : 0, take ? Number(take) : 50);
  }

  @Get("chats/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async findOne(@Req() req: RequestWithUser, @Param("id") id: string) {
    const chat = await this.chatService.findOne(id);
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && chat.agentId && chat.agentId !== req.user.id) {
      throw new ForbiddenException("You do not have access to this chat");
    }
    if (!isAdmin && !chat.agentId) {
      throw new ForbiddenException("You do not have access to this chat");
    }
    return chat;
  }

  @Post("chats/:id/assign")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async assignAgent(@Req() req: RequestWithUser, @Param("id") id: string, @Body() assignAgentDto: AssignAgentDto) {
    const isAdmin = req.user.role === "admin";
    return this.chatService.assignAgent(id, assignAgentDto.agentId, req.user.id, isAdmin);
  }

  @Post("chats/:id/close")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async closeChat(@Req() req: RequestWithUser, @Param("id") id: string) {
    const isAdmin = req.user.role === "admin";
    return this.chatService.closeChat(id, req.user.id, isAdmin);
  }

  @Post("chats/:id/reopen")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async reopenChat(@Req() req: RequestWithUser, @Param("id") id: string) {
    const isAdmin = req.user.role === "admin";
    return this.chatService.reopenChat(id, req.user.id, isAdmin);
  }

  @Post("chats/:id/trigger-handover")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async triggerHandover(@Req() req: RequestWithUser, @Param("id") id: string) {
    const isAdmin = req.user.role === "admin";
    return this.chatService.triggerAiHandover(id, req.user.id, isAdmin);
  }

  @Post("chats/:id/link-customer")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async linkCustomer(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: { clientId: string }) {
    const isAdmin = req.user.role === "admin";
    return this.chatService.linkToCustomer(id, body.clientId, req.user.id, isAdmin);
  }

  @Post("chats/:id/state")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async setState(@Req() req: RequestWithUser, @Param("id") id: string, @Body() body: { state: string }) {
    const isAdmin = req.user.role === "admin";
    return this.chatService.setConversationState(id, body.state, req.user.id, isAdmin);
  }

  @Post("chats/:id/mark-read")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async markRead(@Req() req: RequestWithUser, @Param("id") id: string) {
    const isAdmin = req.user.role === "admin";
    return this.chatService.markAsRead(id, req.user.id, isAdmin);
  }
}
