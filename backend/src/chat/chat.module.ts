import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({ imports: [PrismaModule], controllers: [ChatController, MessageController], providers: [ChatService, MessageService], exports: [ChatService, MessageService] })
export class ChatModule {}
