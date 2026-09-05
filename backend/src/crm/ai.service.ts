import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const BUYING_INTENT_KEYWORDS = [
  "buy", "purchase", "order", "want to buy", "i want", "i need",
  "how much", "price", "cost", "rate", "discount", "offer",
  "visit", "come to", "come down", "reach", "address", "location",
  "when can", "available", "stock", "in stock", "delivery",
  "pay", "payment", "card", "upi", "cash",
  "yes i am interested", "i am interested", "interested",
  "send me", "share details", "more details", "call me",
  "book", "appointment", "schedule", "demo",
];

const NEGATIVE_KEYWORDS = [
  "not interested", "no thanks", "no thank you", "don't call",
  "do not call", "stop", "remove", "unsubscribe", "leave me alone",
  "not now", "later", "maybe later", "busy",
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {}

  detectBuyingIntent(message: string): { isInterested: boolean; confidence: number; matchedKeywords: string[] } {
    const text = message.toLowerCase().trim();
    const matched: string[] = [];
    for (const kw of BUYING_INTENT_KEYWORDS) {
      if (text.includes(kw)) matched.push(kw);
    }
    const negativeMatches = NEGATIVE_KEYWORDS.filter((kw) => text.includes(kw));
    const confidence = Math.min(matched.length * 0.3, 1);
    const isInterested = matched.length > 0 && negativeMatches.length === 0 && confidence >= 0.3;
    return { isInterested, confidence, matchedKeywords: matched };
  }

  async generateResponse(userMessage: string, context?: { businessName?: string; productInfo?: string }): Promise<string> {
    const businessName = context?.businessName || process.env.BUSINESS_NAME || "Amplizo";
    const text = userMessage.toLowerCase().trim();

    if (this.containsAny(text, ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"])) {
      return `Hi! Welcome to ${businessName}. How can I help you today?`;
    }
    if (this.containsAny(text, ["price", "cost", "how much", "rate", "charges"])) {
      return context?.productInfo
        ? `Here is what I can share: ${context.productInfo}. Would you like to know more about any specific item?`
        : `Our team can share exact pricing with you. Would you like me to connect you with a human for accurate details?`;
    }
    if (this.containsAny(text, ["product", "item", "what do you sell", "what do you have", "available"])) {
      return context?.productInfo
        ? `We have: ${context.productInfo}. Want more details on any of these?`
        : `Our team can walk you through our full product range. Want me to connect you with someone?`;
    }
    if (this.containsAny(text, ["address", "location", "where are you", "shop", "store", "timing", "hours", "open"])) {
      return `Our team will share the address and timings with you. Should I have someone get in touch?`;
    }
    if (this.containsAny(text, ["delivery", "shipping"])) {
      return `Delivery options are confirmed on order. Want me to have our team share the exact details?`;
    }
    if (this.containsAny(text, ["refund", "return", "warranty"])) {
      return `Refund, return, and warranty terms are handled by our team. Shall I have them get in touch?`;
    }
    if (this.containsAny(text, ["buy", "purchase", "want", "need", "order", "interested"])) {
      return `Great! I am connecting you with our team so they can help you right away. One moment please.`;
    }
    if (this.containsAny(text, ["thanks", "thank you", "ok", "okay", "got it"])) {
      return `You are welcome! Is there anything else I can help you with?`;
    }

    return `Thanks for your message. I will have our team assist you with this. Anything specific you would like to know?`;
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some((k) => text.includes(k));
  }
}
