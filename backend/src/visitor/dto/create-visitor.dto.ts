import { IsEmail, IsOptional, IsString } from "class-validator";
export class CreateVisitorDto { @IsOptional() @IsString() name?: string; @IsOptional() @IsEmail() email?: string; }
