import { Controller, Post, Body, Headers, Ip, Logger, BadRequestException, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SubscriptionService } from "./subscription.service";
import { createHmac, timingSafeEqual } from "crypto";

@Controller()
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(
    private subscriptionService: SubscriptionService,
    private config: ConfigService,
  ) {}

  @Post("payments/webhook")
  async handleWebhook(@Body() payload: any, @Req() req: any, @Headers("x-razorpay-signature") razorpaySignature: string | undefined, @Ip() ip: string) {
    const isProduction = process.env.NODE_ENV === "production";
    const webhookSecret = this.config.get<string>("RAZORPAY_WEBHOOK_SECRET") || process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      if (isProduction) {
        this.logger.error("RAZORPAY_WEBHOOK_SECRET is not set. Rejecting webhook.", { ip });
        throw new BadRequestException("Webhook secret not configured");
      }
      this.logger.warn("RAZORPAY_WEBHOOK_SECRET not set in non-production. Skipping signature verification.", { ip });
    } else if (!razorpaySignature) {
      if (isProduction) {
        this.logger.error("Missing x-razorpay-signature header. Rejecting webhook.", { ip });
        throw new BadRequestException("Missing signature header");
      }
      this.logger.warn("Missing x-razorpay-signature header in non-production.", { ip });
    } else {
      const rawBody = req.rawBody;
      if (!rawBody) {
        this.logger.error("Raw body unavailable for Razorpay signature verification.", { ip });
        throw new BadRequestException("Raw body unavailable");
      }
      const rawBodyString = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : String(rawBody);
      const expected = createHmac("sha256", webhookSecret).update(rawBodyString, "utf8").digest("hex");
      const a = Buffer.from(expected);
      const b = Buffer.from(razorpaySignature);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        this.logger.warn("Webhook signature verification failed", { ip });
        throw new BadRequestException("Invalid webhook signature");
      }
    }

    try {
      const result = await this.subscriptionService.handleWebhook("razorpay", payload, razorpaySignature);
      this.logger.log(`Webhook processed: order=${payload?.order_id || payload?.razorpay_order_id}, status=${result.status}`);
      return { received: true };
    } catch (err: any) {
      this.logger.error(`Webhook processing failed: ${err?.message}`);
      return { received: true };
    }
  }
}
