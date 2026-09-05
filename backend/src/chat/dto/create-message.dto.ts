import { IsOptional, IsString, IsArray } from "class-validator";
export class CreateMessageDto { @IsString() content: string; @IsOptional() @IsArray() replyTo?: string; }
