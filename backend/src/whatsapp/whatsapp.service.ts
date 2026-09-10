import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

const META_GRAPH_API = "https://graph.facebook.com/v20.0";

export interface SendResult {
  success: boolean;
  mock?: boolean;
  whatsappMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger("WhatsAppService");
  private readonly accessToken: string;
  private readonly phoneNumberId: string;
  private readonly businessAccountId: string;
  private readonly verifyToken: string;
  private readonly appSecret: string;
  private readonly isConfigured: boolean;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.accessToken = (this.config.get("WHATSAPP_ACCESS_TOKEN") || "").trim();
    this.phoneNumberId = (this.config.get("WHATSAPP_PHONE_NUMBER_ID") || "").trim();
    this.businessAccountId = (this.config.get("WHATSAPP_BUSINESS_ACCOUNT_ID") || "").trim();
    this.verifyToken = (this.config.get("WHATSAPP_VERIFY_TOKEN") || "").trim();
    this.appSecret = (this.config.get("WHATSAPP_APP_SECRET") || "").trim();

    this.isConfigured = !!(
      this.accessToken &&
      this.phoneNumberId &&
      this.businessAccountId &&
      this.appSecret
    );

    if (this.isConfigured) {
      this.logger.log(`WhatsApp Cloud API configured (phoneNumberId=${this.phoneNumberId})`);
    } else {
      this.logger.warn(
        "WhatsApp Cloud API NOT CONFIGURED. Set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ACCOUNT_ID and WHATSAPP_APP_SECRET in .env. Outgoing messages will be MOCKED."
      );
    }
  }

  isReady() {
    return this.isConfigured;
  }

  getConfig() {
    return {
      configured: this.isConfigured,
      phoneNumberId: this.isConfigured ? this.phoneNumberId : null,
      businessAccountId: this.isConfigured ? this.businessAccountId : null,
    };
  }

  private normalizePhone(to: string): string {
    if (!to) return "";
    const trimmed = to.trim().replace(/[\s\-()]/g, "");
    if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
    const digits = trimmed.replace(/[^0-9]/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (digits.length === 13 && digits.startsWith("091")) return `+${digits.slice(1)}`;
    return `+${digits.replace(/^\+/, "")}`;
  }

  private isValidPhone(to: string): boolean {
    const n = this.normalizePhone(to);
    return /^\+[1-9]\d{7,14}$/.test(n);
  }

  /**
   * Webhook verification (GET). Meta sends hub.mode, hub.verify_token, hub.challenge.
   * We must echo the challenge if verify_token matches.
   */
  verifyWebhook(mode: string, token: string, challenge: string): { ok: boolean; challenge?: string } {
    if (!this.verifyToken) {
      if (process.env.NODE_ENV === "production") {
        this.logger.error("WHATSAPP_VERIFY_TOKEN not set. Rejecting webhook verification.");
        return { ok: false };
      }
      this.logger.warn("WHATSAPP_VERIFY_TOKEN not set");
      return { ok: false };
    }
    if (mode === "subscribe" && token === this.verifyToken) {
      return { ok: true, challenge };
    }
    return { ok: false };
  }

  /**
   * Verify the X-Hub-Signature-256 header from Meta.
   * Meta signs the raw body with HMAC-SHA256 using the App Secret.
   * Returns true if the signature matches.
   */
  verifySignature(rawBody: string, signatureHeader: string | undefined): boolean {
    if (!this.appSecret) {
      if (process.env.NODE_ENV === "production") {
        this.logger.error("WHATSAPP_APP_SECRET not set. Rejecting webhook signature (INSECURE in production).");
        return false;
      }
      this.logger.warn("WHATSAPP_APP_SECRET not set - skipping signature verification (INSECURE in production)");
      return true;
    }
    if (!signatureHeader) return false;
    const expected = "sha256=" + createHmac("sha256", this.appSecret).update(rawBody, "utf8").digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signatureHeader);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  /**
   * Send a text message to a phone number via Meta WhatsApp Cloud API.
   * Returns success/failure. Never marks a message as sent unless Meta confirmed.
   */
  async sendTextMessage(to: string, body: string, opts: { phoneNumberId?: string } = {}): Promise<SendResult> {
    if (!this.isValidPhone(to)) {
      return { success: false, errorCode: "invalid_phone", errorMessage: "Invalid phone number" };
    }
    if (!body || !body.trim()) {
      return { success: false, errorCode: "empty_message", errorMessage: "Message body is required" };
    }
    if (body.length > 4096) {
      return { success: false, errorCode: "message_too_long", errorMessage: "Message exceeds 4096 characters" };
    }

    const toE164 = this.normalizePhone(to);
    const fromPhoneId = opts.phoneNumberId || this.phoneNumberId;

    if (!this.isConfigured) {
      this.logger.log(`[WHATSAPP MOCK] To: ${toE164} Body: ${body}`);
      return {
        success: true,
        mock: true,
        whatsappMessageId: `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
    }

    try {
      const url = `${META_GRAPH_API}/${fromPhoneId}/messages`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toE164.replace("+", ""),
          type: "text",
          text: { preview_url: false, body },
        }),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = data?.error?.code ? String(data.error.code) : `http_${res.status}`;
        const msg = data?.error?.message || data?.error?.error_user_msg || res.statusText;
        this.logger.error(`WhatsApp send failed to ${toE164}: [${code}] ${msg}`);
        return { success: false, errorCode: code, errorMessage: msg };
      }
      const wamid = data?.messages?.[0]?.id;
      if (!wamid) {
        this.logger.error(`WhatsApp returned 200 but no message id: ${JSON.stringify(data)}`);
        return { success: false, errorCode: "no_message_id", errorMessage: "Meta returned no message id" };
      }
      this.logger.log(`WhatsApp sent to ${toE164} wamid=${wamid}`);
      return { success: true, whatsappMessageId: wamid };
    } catch (e: any) {
      this.logger.error(`WhatsApp send exception: ${e?.message}`);
      return { success: false, errorCode: "exception", errorMessage: e?.message || "Network error" };
    }
  }
}
