import { IsOptional, IsString, IsArray } from "class-validator";
export class CreateChatDto { @IsString() visitorId: string; @IsOptional() @IsString() subject?: string; @IsOptional() @IsString() clientId?: string; @IsOptional() @IsString() agentId?: string; }
export class AssignAgentDto { @IsString() agentId: string; }
