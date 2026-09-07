import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, ForbiddenException } from "@nestjs/common";
import { MessageService } from "./message.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateMessageDto } from "./dto/create-message.dto";

interface RequestWithUser extends Request {
  user: { id: string; role: string; name?: string };
}

@Controller()
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get("chats/:chatId/messages")
  @UseGuards(JwtAuthGuard)
  async findByChatId(@Req() req: RequestWithUser, @Param("chatId") chatId: string, @Query("skip") skip?: string, @Query("take") take?: string) {
    const isAdmin = req.user.role === "admin";
    const s = skip ? Number(skip) : 0;
    const t = take ? Number(take) : 50;
    if (!isAdmin) {
      const chat = await this.messageService.findByChatId(chatId, s, t);
      return chat;
    }
    return this.messageService.findByChatId(chatId, s, t);
  }

  @Post("chats/:chatId/messages")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async create(@Req() req: RequestWithUser, @Param("chatId") chatId: string, @Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(chatId, { content: createMessageDto.content, replyTo: createMessageDto.replyTo }, req.user.id, "agent");
  }
}
