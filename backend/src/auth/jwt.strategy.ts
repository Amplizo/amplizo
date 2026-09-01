import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private prisma: PrismaService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.get<string>("JWT_SECRET") || "retainx-secret-key-change-in-production" });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const agent = await this.prisma.agent.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, role: true, name: true, status: true } });
    if (!agent) throw new Error("Unauthorized");
    return { ...agent };
  }
}
