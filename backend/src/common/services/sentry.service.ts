import { Logger, Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger("SentryService");
  private enabled = false;
  private Sentry: any;

  onModuleInit() {
    const dsn = process.env.SENTRY_DSN;
    if (dsn) {
      try {
        this.Sentry = require("@sentry/node");
        this.Sentry.init({ dsn, environment: process.env.NODE_ENV || "development", tracesSampleRate: 1.0 });
        this.enabled = true;
        this.logger.log("Sentry initialized");
      } catch (error) {
        this.logger.warn("Sentry not available, install @sentry/node to enable error tracking");
      }
    }
  }

  captureException(error: Error, context?: Record<string, any>) {
    if (!this.enabled) return;
    this.Sentry.captureException(error, { extra: context });
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: Record<string, any>) {
    if (!this.enabled) return;
    this.Sentry.captureMessage(message, level as any, { extra: context });
  }

  setUser(user: { id: string; email?: string }) {
    if (!this.enabled) return;
    this.Sentry.setUser(user);
  }

  setTag(key: string, value: string) {
    if (!this.enabled) return;
    this.Sentry.setTag(key, value);
  }

  setContext(name: string, context: Record<string, any>) {
    if (!this.enabled) return;
    this.Sentry.setContext(name, context);
  }

  isEnabled() {
    return this.enabled;
  }
}
