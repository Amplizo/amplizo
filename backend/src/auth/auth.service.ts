import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../common/services/email.service";
import { SmsService } from "../common/services/sms.service";
import { v4 as uuidv4 } from "uuid";
import * as argon2 from "argon2";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async login(loginDto: LoginDto) {
    const agent = await this.prisma.agent.findUnique({ where: { email: loginDto.email } });
    if (!agent) throw new UnauthorizedException("Invalid credentials");
    const isPasswordValid = await argon2.verify(agent.password, loginDto.password);
    if (!isPasswordValid) throw new UnauthorizedException("Invalid credentials");
    return this.generateTokens(agent);
  }

  async validateOAuthUser(data: { provider: string; providerId: string; email?: string; name?: string; avatar?: string }) {
    let agent = await this.prisma.agent.findFirst({ where: { email: data.email } });
    if (!agent) {
      agent = await this.prisma.agent.create({
        data: { name: data.name || "User", email: data.email || `${data.provider}_${data.providerId}@oauth.com`, password: await argon2.hash(uuidv4()), role: "agent", avatar: data.avatar, status: "online" },
      });
    }
    await this.prisma.agent.update({ where: { id: agent.id }, data: { status: "online" } });
    return this.generateTokens(agent);
  }

  async sendOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.prisma.oTP.upsert({ where: { phone }, update: { otp, expiresAt, verified: false }, create: { phone, otp, expiresAt, verified: false } });

    await this.smsService.sendOtpSms(phone, otp);
    return { success: true, message: `OTP sent to ${phone}` };
  }

  async verifyOtp(phone: string, otp: string) {
    const record = await this.prisma.oTP.findUnique({ where: { phone } });
    if (!record || record.otp !== otp || record.expiresAt < new Date()) throw new UnauthorizedException("Invalid or expired OTP");
    await this.prisma.oTP.update({ where: { phone }, data: { verified: true } });

    let agent = await this.prisma.agent.findFirst({ where: { name: phone } });
    if (!agent) {
      agent = await this.prisma.agent.create({ data: { name: phone, email: `${phone}@phone.com`, password: await argon2.hash(uuidv4()), role: "agent", status: "online" } });
    }
    await this.prisma.agent.update({ where: { id: agent.id }, data: { status: "online" } });
    return this.generateTokens(agent);
  }

  async phoneLogin(phone: string, name?: string) {
    let agent = await this.prisma.agent.findFirst({ where: { name: phone } });
    if (!agent) {
      agent = await this.prisma.agent.create({ data: { name: name || phone, email: `${phone}@phone.com`, password: await argon2.hash(uuidv4()), role: "agent", status: "online" } });
    }
    await this.prisma.agent.update({ where: { id: agent.id }, data: { status: "online" } });
    return this.generateTokens(agent);
  }

  async forgotPassword(email: string) {
    const agent = await this.prisma.agent.findUnique({ where: { email } });
    if (!agent) return { success: true, message: "If this email exists, a reset link will be sent" };

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordReset.upsert({
      where: { agentId: agent.id },
      update: { token: resetToken, expiresAt, used: false },
      create: { agentId: agent.id, token: resetToken, expiresAt, used: false },
    });

    await this.emailService.sendPasswordResetEmail(email, resetToken, agent.name);
    return { success: true, message: "If this email exists, a reset link will be sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordReset.findUnique({ where: { token }, include: { agent: true } });
    if (!record || record.expiresAt < new Date() || record.used) throw new UnauthorizedException("Invalid or expired reset token");

    await this.prisma.agent.update({ where: { id: record.agentId }, data: { password: await argon2.hash(newPassword) } });
    await this.prisma.passwordReset.update({ where: { id: record.id }, data: { used: true } });

    return { success: true, message: "Password reset successful" };
  }

  private async generateTokens(agent: any) {
    const payload = { sub: agent.id, email: agent.email, role: agent.role };
    const token = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({ data: { token: refreshToken, agentId: agent.id, expiresAt } });
    const { password, ...agentData } = agent;
    return { agent: { id: agentData.id, name: agentData.name, email: agentData.email, role: agentData.role, avatar: agentData.avatar, status: "online", createdAt: agentData.createdAt?.toISOString?.() || new Date().toISOString() }, token, refreshToken };
  }

  async refreshTokenFn(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { agent: true } });
    if (!storedToken || storedToken.expiresAt < new Date()) throw new UnauthorizedException("Invalid refresh token");
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
    const payload = { sub: storedToken.agent.id, email: storedToken.agent.email, role: storedToken.agent.role };
    const token = this.jwtService.sign(payload);
    const newRefreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({ data: { token: newRefreshToken, agentId: storedToken.agent.id, expiresAt } });
    return { token, refreshToken: newRefreshToken };
  }

  async logout(agentId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { agentId } });
    await this.prisma.agent.update({ where: { id: agentId }, data: { status: "offline" } });
  }
}
