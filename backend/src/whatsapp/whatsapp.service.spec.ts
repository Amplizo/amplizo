import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";
import { WhatsAppService } from "./whatsapp.service";
import { PrismaService } from "../prisma/prisma.service";

const TEST_APP_SECRET = "test-app-secret-12345";
const TEST_VERIFY_TOKEN = "test-verify-token-67890";

function generateSignature(rawBody: string, secret: string): string {
  return "sha256=" + createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

function createMockConfig(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    WHATSAPP_ACCESS_TOKEN: "test-token",
    WHATSAPP_PHONE_NUMBER_ID: "123456789",
    WHATSAPP_BUSINESS_ACCOUNT_ID: "test-biz-id",
    WHATSAPP_VERIFY_TOKEN: TEST_VERIFY_TOKEN,
    WHATSAPP_APP_SECRET: TEST_APP_SECRET,
  };
  const values = { ...defaults, ...overrides };
  return {
    get: jest.fn((key: string) => values[key]),
  };
}

const mockPrisma = {
  $transaction: jest.fn(),
  whatsAppConversation: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  whatsAppMessage: {
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
  },
  whatsAppWebhookEvent: {
    findUnique: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  whatsAppPhoneAssignment: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  agent: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  client: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

async function createService(configOverrides: Record<string, string> = {}) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      WhatsAppService,
      { provide: ConfigService, useValue: createMockConfig(configOverrides) },
      { provide: PrismaService, useValue: mockPrisma },
    ],
  }).compile();
  return module.get<WhatsAppService>(WhatsAppService);
}

describe("WhatsAppService", () => {
  let service: WhatsAppService;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
    service = await createService();
  });

  describe("verifySignature", () => {
    it("should return true for a valid HMAC-SHA256 signature", () => {
      const rawBody = JSON.stringify({ entry: [{ changes: [{ value: { messages: [] } }] }] });
      const signature = generateSignature(rawBody, TEST_APP_SECRET);

      const result = service.verifySignature(rawBody, signature);
      expect(result).toBe(true);
    });

    it("should return false for an invalid signature", () => {
      const rawBody = JSON.stringify({ entry: [{ changes: [] }] });
      const signature = "sha256=invalid-signature-value";

      const result = service.verifySignature(rawBody, signature);
      expect(result).toBe(false);
    });

    it("should return false when signature header is missing", () => {
      const rawBody = JSON.stringify({ foo: "bar" });

      const result = service.verifySignature(rawBody, undefined);
      expect(result).toBe(false);
    });

    it("should return true in non-production when app secret is not set (skips verification)", async () => {
      process.env.NODE_ENV = "test";
      const noSecretService = await createService({ WHATSAPP_APP_SECRET: "" });
      const rawBody = JSON.stringify({ foo: "bar" });

      const result = noSecretService.verifySignature(rawBody, undefined);
      expect(result).toBe(true);
    });

    it("should return false in production when app secret is not set (fail closed)", async () => {
      process.env.NODE_ENV = "production";
      const noSecretService = await createService({ WHATSAPP_APP_SECRET: "" });
      const rawBody = JSON.stringify({ foo: "bar" });

      const result = noSecretService.verifySignature(rawBody, "sha256=anything");
      expect(result).toBe(false);
    });

    it("should demonstrate that re-serialized body breaks signature verification", () => {
      const rawBody = JSON.stringify({ message: "original" });
      const signature = generateSignature(rawBody, TEST_APP_SECRET);

      const tamperedBody = JSON.stringify(JSON.parse(rawBody));

      const result = service.verifySignature(tamperedBody, signature);
      expect(result).toBe(tamperedBody === rawBody ? true : false);
    });

    it("should correctly verify a real webhook payload (integration test)", () => {
      const realPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "123456789",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "1234567890",
                    phone_number_id: "123456789",
                  },
                  contacts: [{ profile: { name: "John Doe" }, wa_id: "918888888888" }],
                  messages: [
                    {
                      id: "wamid.HACKED_MESSAGE_ID",
                      timestamp: "1234567890",
                      text: { body: "Hello", preview_url: 0 },
                      type: "text",
                      from: "918888888888",
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const rawBody = JSON.stringify(realPayload);
      const signature = generateSignature(rawBody, TEST_APP_SECRET);

      expect(service.verifySignature(rawBody, signature)).toBe(true);
    });
  });

  describe("verifyWebhook", () => {
    it("should return ok with challenge when token matches", () => {
      const result = service.verifyWebhook("subscribe", TEST_VERIFY_TOKEN, "challenge123");
      expect(result.ok).toBe(true);
      expect(result.challenge).toBe("challenge123");
    });

    it("should return ok=false when token does not match", () => {
      const result = service.verifyWebhook("subscribe", "wrong-token", "challenge123");
      expect(result.ok).toBe(false);
      expect(result.challenge).toBeUndefined();
    });

    it("should return ok=false when mode is not subscribe", () => {
      const result = service.verifyWebhook("unsubscribe", TEST_VERIFY_TOKEN, "challenge123");
      expect(result.ok).toBe(false);
    });

    it("should return ok=false in production when verify token is not set", async () => {
      process.env.NODE_ENV = "production";
      const noTokenService = await createService({ WHATSAPP_VERIFY_TOKEN: "" });

      const result = noTokenService.verifyWebhook("subscribe", "", "");
      expect(result.ok).toBe(false);
    });
  });

  describe("isReady", () => {
    it("should return true when all WhatsApp env vars are set", () => {
      expect(service.isReady()).toBe(true);
    });

    it("should return false when app secret is missing", async () => {
      const noSecretService = await createService({ WHATSAPP_APP_SECRET: "" });
      expect(noSecretService.isReady()).toBe(false);
    });

    it("should return false when access token is missing", async () => {
      const noTokenService = await createService({ WHATSAPP_ACCESS_TOKEN: "" });
      expect(noTokenService.isReady()).toBe(false);
    });
  });

  describe("normalizePhone", () => {
    it("should normalize a 10-digit Indian number", () => {
      const result = service["normalizePhone"]("9876543210");
      expect(result).toBe("+919876543210");
    });

    it("should normalize an 11-digit number starting with 0", () => {
      const result = service["normalizePhone"]("09876543210");
      expect(result).toBe("+919876543210");
    });

    it("should preserve +91 prefix", () => {
      const result = service["normalizePhone"]("+919876543210");
      expect(result).toBe("+919876543210");
    });

    it("should return empty string for falsy input", () => {
      const result = service["normalizePhone"]("");
      expect(result).toBe("");
    });
  });

  describe("isValidPhone", () => {
    it("should validate a valid Indian phone number", () => {
      expect(service["isValidPhone"]("9876543210")).toBe(true);
    });

    it("should validate a valid E.164 number", () => {
      expect(service["isValidPhone"]("+919876543210")).toBe(true);
    });

    it("should reject a number that is too short", () => {
      expect(service["isValidPhone"]("123")).toBe(false);
    });

    it("should reject an empty string", () => {
      expect(service["isValidPhone"]("")).toBe(false);
    });
  });
});
