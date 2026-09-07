import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
export class ForgotPasswordDto { @IsEmail() email: string; }
export class ResetPasswordDto { @IsString() token: string; @IsString() @MinLength(6) newPassword: string; }
export class PhoneLoginDto { @IsString() phone: string; @IsOptional() @IsString() name?: string; }
export class DetectIntentDto { @IsString() message: string; }
export class AiRespondDto { @IsString() message: string; @IsOptional() context?: any; }