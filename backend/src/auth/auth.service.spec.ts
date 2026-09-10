import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "../common/services/email.service";
import { SmsService } from "../common/services/sms.service";
import { createHmac } from "crypto";

const OTP_PEPPER = process.env.OTP_PEPPER || process.env.JWT_SECRET || "amplizo-otp-pepper-dev-only";
function hashOtp(otp: string): string {
  return createHmac("sha256", OTP_PEPPER).update(otp).digest("hex");
}

describe("AuthService", () => {
  let service: AuthService;

  const mockPrisma = {
    agent: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    oTP: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    passwordReset: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue("mock-token"),
    verify: jest.fn().mockReturnValue({ sub: "user-id", email: "test@test.com", role: "agent" }),
  };

  const mockSms = {
    sendOtpSms: jest.fn().mockResolvedValue({ success: true }),
    sendSms: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: EmailService, useValue: { sendEmail: jest.fn(), sendPasswordResetEmail: jest.fn() } },
        { provide: SmsService, useValue: mockSms },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("sendOtp", () => {
    it("should send OTP successfully", async () => {
      mockPrisma.oTP.upsert.mockResolvedValue({});
      (mockPrisma as any).sendOtpSms = jest.fn().mockResolvedValue({ success: true });
      const result = await service.sendOtp("+919876543210");
      expect(result.success).toBe(true);
      expect(result.message).toContain("OTP sent");
    });
  });

  describe("verifyOtp", () => {
    it("should verify OTP and return tokens", async () => {
      mockPrisma.oTP.findUnique.mockResolvedValue({ phone: "+919876543210", otpHash: hashOtp("123456"), expiresAt: new Date(Date.now() + 300000), verified: false, attempts: 0, maxAttempts: 5 });
      mockPrisma.oTP.update.mockResolvedValue({});
      mockPrisma.agent.findFirst.mockResolvedValue(null);
      mockPrisma.agent.create.mockResolvedValue({ id: "new-agent-id", name: "+919876543210", email: "+919876543210@phone.com", role: "agent", status: "online", createdAt: new Date() });
      mockPrisma.agent.update.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.verifyOtp("+919876543210", "123456");
      expect(result.token).toBe("mock-token");
      expect(result.agent).toBeDefined();
    });

    it("should throw error for invalid OTP", async () => {
      mockPrisma.oTP.findUnique.mockResolvedValue({ phone: "+919876543210", otp: "999999", expiresAt: new Date(Date.now() + 300000) });
      await expect(service.verifyOtp("+919876543210", "123456")).rejects.toThrow();
    });
  });
});
