import { Body, Controller, Post, Req, UseGuards, HttpCode, HttpStatus, Get, Res, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./jwt.guard";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { Throttle } from "@nestjs/throttler";

interface AuthenticatedRequest extends Request { user: { id: string; email: string; role: string; name: string; status: string }; }

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) { return this.authService.login(loginDto); }

  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) { return this.authService.refreshTokenFn(refreshTokenDto.refreshToken); }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthenticatedRequest) { await this.authService.logout(req.user.id); return { success: true }; }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const { token, refreshToken, agent } = req.user;
    const agentData = encodeURIComponent(JSON.stringify(agent));
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}&agent=${agentData}`);
  }

  @Get("facebook")
  @UseGuards(AuthGuard("facebook"))
  async facebookAuth() {}

  @Get("facebook/callback")
  @UseGuards(AuthGuard("facebook"))
  async facebookAuthCallback(@Req() req: any, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const { token, refreshToken, agent } = req.user;
    const agentData = encodeURIComponent(JSON.stringify(agent));
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}&agent=${agentData}`);
  }

  @Post("otp/send")
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: { phone: string }) { return this.authService.sendOtp(body.phone); }

  @Post("otp/verify")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { phone: string; otp: string }) { return this.authService.verifyOtp(body.phone, body.otp); }

  @Post("phone/login")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async phoneLogin(@Body() body: { phone: string; name?: string }) { return this.authService.phoneLogin(body.phone, body.name); }

  @Post("forgot-password")
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) { return this.authService.forgotPassword(body.email); }

  @Post("reset-password")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; newPassword: string }) { return this.authService.resetPassword(body.token, body.newPassword); }
}
