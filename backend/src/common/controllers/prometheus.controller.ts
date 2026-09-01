import { Controller, Get, Res } from "@nestjs/common";
import { PrometheusService } from "../services/prometheus.service";
import { Response } from "express";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("monitoring")
@Controller("metrics")
export class PrometheusController {
  constructor(private prometheusService: PrometheusService) {}

  @Get()
  getMetrics(@Res() res: Response) {
    res.set("Content-Type", "text/plain; version=0.0.4");
    res.send(this.prometheusService.getMetricsOutput());
  }
}
