import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Logger } from "@nestjs/common";

interface MetricEntry {
  name: string;
  help: string;
  type: string;
  values: Array<{ labels: Record<string, string>; value: number }>;
}

@Injectable()
export class PrometheusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger("PrometheusService");
  private metrics: Map<string, MetricEntry> = new Map();
  private enabled = false;
  private server: any;

  onModuleInit() {
    if (process.env.PROMETHEUS_ENABLED === "true") {
      this.enabled = true;
      this.registerMetric("http_requests_total", "Total HTTP requests", "counter");
      this.registerMetric("http_request_duration_seconds", "HTTP request duration", "histogram");
      this.registerMetric("active_chats", "Currently active chats", "gauge");
      this.registerMetric("online_agents", "Online agents", "gauge");
      this.registerMetric("messages_total", "Total messages", "counter");
      this.registerMetric("ws_connections_total", "WebSocket connections", "gauge");
      this.logger.log("Prometheus metrics enabled");
    }
  }

  async onModuleDestroy() {
    if (this.server) {
      this.server.close();
    }
  }

  private registerMetric(name: string, help: string, type: string) {
    this.metrics.set(name, { name, help, type, values: [] });
  }

  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    if (!this.enabled) return;
    this.increment("http_requests_total", { method, route, status: String(status) }, duration);
  }

  increment(metricName: string, labels?: Record<string, string>, value = 1) {
    if (!this.enabled) return;
    const metric = this.metrics.get(metricName);
    if (metric) {
      const labelKey = labels ? JSON.stringify(labels) : "{}";
      const existing = metric.values.find((v) => JSON.stringify(v.labels) === labelKey);
      if (existing) {
        existing.value += value;
      } else {
        metric.values.push({ labels: labels || {}, value });
      }
    }
  }

  setGauge(metricName: string, value: number, labels?: Record<string, string>) {
    if (!this.enabled) return;
    const metric = this.metrics.get(metricName);
    if (metric) {
      const labelKey = labels ? JSON.stringify(labels) : "{}";
      const existing = metric.values.find((v) => JSON.stringify(v.labels) === labelKey);
      if (existing) {
        existing.value = value;
      } else {
        metric.values.push({ labels: labels || {}, value });
      }
    }
  }

  getMetricsOutput(): string {
    let output = "";
    for (const metric of this.metrics.values()) {
      output += `# HELP ${metric.name} ${metric.help}\n`;
      output += `# TYPE ${metric.name} ${metric.type}\n`;
      for (const v of metric.values) {
        const labels = Object.entries(v.labels)
          .map(([k, val]) => `${k}="${val}"`)
          .join(",");
        output += `${metric.name}{${labels}} ${v.value}\n`;
      }
    }
    return output;
  }
}
