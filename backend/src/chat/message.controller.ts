import { Body, Controller, Get, Param, Post, UseGuards, ForbiddenException, Req } from "@nestjs/common";
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
  async findByChatId(@Req() req: RequestWithUser, @Param("chatId") chatId: string) {
    const isAdmin = req.user.role === "admin";
    if (!isAdmin) {
      const chat = await this.messageService.findByChatId(chatId);
      // Additional tenant check could be added here if needed
      return chat;
    }
    return this.messageService.findByChatId(chatId);
  }

  @Post("chats/:chatId/messages")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("agent", "admin")
  async create(@Req() req: RequestWithUser, @Param("chatId") chatId: string, @Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(chatId, { content: createMessageDto.content, replyTo: createMessageDto.replyTo }, req.user.id, "agent");
  }
}
