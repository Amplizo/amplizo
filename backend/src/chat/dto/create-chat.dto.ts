import { IsOptional, IsString, IsArray } from "class-validator";
export class CreateChatDto { @IsString() visitorId: string; @IsOptional() @IsString() subject?: string; }
export class AssignAgentDto { @IsString() agentId: string; }
