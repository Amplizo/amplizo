import { Controller, Get, Post, Put, Delete, Body, Req, UseGuards, BadRequestException, ForbiddenException, Headers, Ip } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { SubscriptionService } from "./subscription.service";
import { Request } from "express";
import { PLANS } from "./plans";

@Controller()
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get("subscriptions/plans")
  async getPlans() {
    return PLANS.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      interval: p.interval,
      currency: p.currency,
    }));
  }

  @Get("subscriptions/me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMySubscription(@Req() req: Request) {
    const user = req.user as any;
    return this.subscriptionService.getMySubscription(user.id);
  }

  @Post("subscriptions/checkout")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "agent")
  async createCheckout(@Req() req: Request, @Body("planId") planId: string) {
    const user = req.user as any;
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      throw new BadRequestException("Invalid plan");
    }

    const sub = await this.subscriptionService.updateSubscription(user.id, planId as any, user.id, user.role === "admin");

    if (planId === "free") {
      return {
        subscription: sub,
        payment: null,
        plan,
      };
    }

    const razorpayOrder = await this.subscriptionService.createRazorpayOrder(user.id, planId as any, plan.price, plan.currency);

    return {
      subscription: sub,
      payment: {
        id: razorpayOrder.paymentId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        providerOrderId: razorpayOrder.orderId,
        status: "pending",
        provider: "razorpay",
      },
      plan,
      razorpayKeyId: razorpayOrder.keyId,
    };
  }

  @Post("subscriptions/verify")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "agent")
  async verifyPayment(@Req() req: Request, @Body("orderId") orderId: string, @Body("paymentId") paymentId: string, @Body("signature") signature: string) {
    const user = req.user as any;
    const payment = await this.subscriptionService.verifyRazorpayPayment(user.id, orderId, paymentId, signature);
    return { success: true, payment };
  }

  @Post("subscriptions/cancel")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "agent")
  async cancelSubscription(@Req() req: Request) {
    const user = req.user as any;
    return this.subscriptionService.cancelSubscription(user.id);
  }

  @Post("subscriptions/reactivate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "agent")
  async reactivateSubscription(@Req() req: Request) {
    const user = req.user as any;
    return this.subscriptionService.reactivateSubscription(user.id);
  }

  @Get("subscriptions/payments")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "agent")
  async getPayments(@Req() req: Request) {
    const user = req.user as any;
    const isAdmin = user.role === "admin";
    return this.subscriptionService.getPayments(user.id, isAdmin);
  }
}
