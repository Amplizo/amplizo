import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Request } from "express";
import { PLANS, getPlanById, PlanId } from "./plans";
import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";

interface CreatePaymentInput {
  agentId: string;
  planId: PlanId;
  provider?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  paymentMethod?: string;
  metadata?: string;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly razorpay: Razorpay | null = null;

  constructor(private prisma: PrismaService) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }

  private getRazorpay(): Razorpay {
    if (!this.razorpay) {
      throw new BadRequestException("Payment provider not configured");
    }
    return this.razorpay;
  }

  async getMySubscription(agentId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      include: { payments: { orderBy: { createdAt: "desc" }, take: 5 } },
    });

    if (!sub) {
      const plan = getPlanById("free");
      if (!plan) {
        throw new NotFoundException("Default plan not found");
      }
      return this.createSubscription(agentId, "free", plan);
    }

    return sub;
  }

  async createSubscription(agentId: string, planId: PlanId, plan: { name: string; price: number; interval: string; currency: string }) {
    const now = new Date();
    const expires = new Date(now);
    if (plan.interval === "month") {
      expires.setMonth(expires.getMonth() + 1);
    } else {
      expires.setFullYear(expires.getFullYear() + 1);
    }

    return this.prisma.subscription.create({
      data: {
        agentId,
        planId,
        planName: plan.name,
        status: planId === "free" ? "active" : "pending",
        amount: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        startedAt: now,
        expiresAt: planId === "free" ? null : expires,
        autoRenew: planId === "free" ? false : true,
      },
    });
  }

  async updateSubscription(agentId: string, planId: PlanId, actorId: string, isAdmin: boolean) {
    const plan = getPlanById(planId);
    if (!plan) {
      throw new BadRequestException("Invalid plan");
    }

    const existing = await this.prisma.subscription.findFirst({
      where: { agentId },
      orderBy: { createdAt: "desc" },
    });

    if (existing && existing.status === "active" && existing.planId === planId) {
      return existing;
    }

    if (existing) {
      if (!isAdmin && existing.status === "active" && existing.planId !== planId) {
        throw new ForbiddenException("Payment required to change plan");
      }

      if (planId === "free") {
        return this.prisma.subscription.update({
          where: { id: existing.id },
          data: {
            planId,
            planName: plan.name,
            status: "active",
            amount: plan.price,
            interval: plan.interval,
            startedAt: new Date(),
            expiresAt: null,
            autoRenew: false,
            canceledAt: new Date(),
          },
        });
      }

      return this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId,
          planName: plan.name,
          amount: plan.price,
          interval: plan.interval,
          status: "pending",
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + (plan.interval === "month" ? 30 : 365) * 24 * 60 * 60 * 1000),
          autoRenew: true,
        },
      });
    }

    return this.createSubscription(agentId, planId, plan);
  }

  async cancelSubscription(agentId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { agentId },
      orderBy: { createdAt: "desc" },
    });

    if (!sub || sub.status === "cancelled") {
      throw new NotFoundException("No active subscription found");
    }

    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "cancelled",
        autoRenew: false,
        canceledAt: new Date(),
      },
    });
  }

  async reactivateSubscription(agentId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { agentId },
      orderBy: { createdAt: "desc" },
    });

    if (!sub || sub.status !== "cancelled") {
      throw new NotFoundException("No cancelled subscription found");
    }

    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "active",
        autoRenew: true,
        canceledAt: null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async createRazorpayOrder(agentId: string, planId: PlanId, amount: number, currency: string) {
    const razorpay = this.getRazorpay();

    const subscription = await this.prisma.subscription.findFirst({
      where: { agentId },
      orderBy: { createdAt: "desc" },
    });

    const existingPayment = await this.prisma.payment.findFirst({
      where: { providerOrderId: subscription?.id, status: "pending" },
      orderBy: { createdAt: "desc" },
    });

    if (existingPayment) {
      return {
        orderId: existingPayment.providerOrderId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    }

    const options = {
      amount: amount * 100,
      currency: currency || "INR",
      receipt: `sub_${subscription?.id || agentId}_${Date.now()}`,
      payment_capture: 1,
    };

    let order: any;
    try {
      order = await razorpay.orders.create(options);
    } catch (err: any) {
      const message = err?.error?.description || err?.message || "Failed to create payment order";
      throw new BadRequestException(message);
    }

    const payment = await this.prisma.payment.create({
      data: {
        agentId,
        subscriptionId: subscription?.id,
        amount,
        currency: currency || "INR",
        status: "pending",
        provider: "razorpay",
        providerOrderId: order.id,
        metadata: JSON.stringify({ planId, receipt: order.receipt }),
      },
    });

    return {
      orderId: order.id,
      amount: Number(order.amount) / 100,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    };
  }

  async verifyRazorpayPayment(agentId: string, orderId: string, paymentId: string, signature: string) {
    const razorpay = this.getRazorpay();

    const payment = await this.prisma.payment.findFirst({
      where: { providerOrderId: orderId, agentId },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status === "paid") {
      return payment;
    }

    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new BadRequestException("Payment verification not configured");
      }
      const payload = `${orderId}|${paymentId}`;
      const expectedSignature = createHmac("sha256", webhookSecret).update(payload).digest("hex");
      const a = Buffer.from(expectedSignature);
      const b = Buffer.from(signature);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        throw new BadRequestException("Invalid payment signature");
      }
    } catch (err: any) {
      this.logger.warn(`Payment signature verification failed: ${err?.message}`);
      throw new BadRequestException("Invalid payment signature");
    }

    const razorpayPayment = await razorpay.payments.fetch(paymentId);

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: paymentId,
        providerSignature: signature,
        status: razorpayPayment.status === "captured" ? "paid" : razorpayPayment.status,
        paymentMethod: `razorpay_${razorpayPayment.method}`,
        receiptUrl: razorpayPayment.amount ? `https://dashboard.razorpay.com/app/payments/${paymentId}` : undefined,
        errorMessage: razorpayPayment.status === "failed" ? (razorpayPayment.error_description || razorpayPayment.error_reason || "Payment failed") : null,
      },
    });

    if (updated.status === "paid" && payment.subscriptionId) {
      await this.prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "active" },
      });
    }

    return updated;
  }

  async handleWebhook(provider: string, payload: any, signature: string | undefined) {
    this.logger.log(`Webhook received from ${provider}`);

    const orderId = payload?.order_id || payload?.orderId || payload?.razorpay_order_id;
    const paymentId = payload?.payment_id || payload?.paymentId || payload?.razorpay_payment_id;
    const status = payload?.status || payload?.payment?.status;

    if (!orderId) {
      throw new BadRequestException("Missing order_id in webhook");
    }

    const payment = await this.prisma.payment.findFirst({
      where: { providerOrderId: orderId },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      this.logger.warn(`Webhook for unknown order: ${orderId}`);
      throw new NotFoundException("Payment not found");
    }

    if (payment.status === "paid") {
      return payment;
    }

    let newStatus: string = "pending";
    if (status === "paid" || status === "captured" || status === "succeeded") {
      newStatus = "paid";
    } else if (status === "failed" || status === "cancelled" || status === "expired") {
      newStatus = status === "cancelled" ? "cancelled" : "failed";
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: paymentId || payment.providerPaymentId,
        status: newStatus,
        errorMessage: newStatus === "paid" ? null : (payload?.error_description || payload?.error?.message || "Payment failed"),
      },
    });

    if (newStatus === "paid" && payment.subscriptionId) {
      await this.prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "active" },
      });
    }

    return updated;
  }

  async getPayments(agentId: string, isAdmin: boolean) {
    const where: any = {};
    if (!isAdmin) {
      where.agentId = agentId;
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}
