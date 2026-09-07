import { Controller, Post, Body, Headers, Ip, Logger, BadRequestException } from "@nestjs/common";
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
  async handleWebhook(@Body() payload: any, @Headers("x-razorpay-signature") razorpaySignature: string | undefined, @Ip() ip: string) {
    const webhookSecret = this.config.get<string>("RAZORPAY_WEBHOOK_SECRET") || process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && razorpaySignature) {
      const body = JSON.stringify(payload);
      const expected = createHmac("sha256", webhookSecret).update(body, "utf8").digest("hex");
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
