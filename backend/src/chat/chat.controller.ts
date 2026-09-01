import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { AssignAgentDto } from "./dto/assign-agent.dto";
import { JwtAuthGuard } from "../auth/jwt.guard";

@Controller()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post("chats")
  async create(@Body() createChatDto: CreateChatDto) { return this.chatService.create(createChatDto); }

  @Get("chats")
  @UseGuards(JwtAuthGuard)
  async findAll(@Query("status") status?: string) { return this.chatService.findAll(status); }

  @Get("chats/:id")
  @UseGuards(JwtAuthGuard)
  async findOne(@Param("id") id: string) { return this.chatService.findOne(id); }

  @Post("chats/:id/assign")
  @UseGuards(JwtAuthGuard)
  async assignAgent(@Param("id") id: string, @Body() assignAgentDto: AssignAgentDto) { return this.chatService.assignAgent(id, assignAgentDto.agentId); }

  @Post("chats/:id/close")
  @UseGuards(JwtAuthGuard)
  async closeChat(@Param("id") id: string) { return this.chatService.closeChat(id); }
}
