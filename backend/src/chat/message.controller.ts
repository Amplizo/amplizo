import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MessageService } from "./message.service";
import { JwtAuthGuard } from "../auth/jwt.guard";

@Controller()
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get("chats/:chatId/messages")
  @UseGuards(JwtAuthGuard)
  async findByChatId(@Param("chatId") chatId: string) { return this.messageService.findByChatId(chatId); }
}
