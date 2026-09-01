import { Injectable, LoggerService, LogLevel } from "@nestjs/common";
import * as winston from "winston";

@Injectable()
export class WinstonLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
      defaultMeta: { service: "amplizo-backend" },
      transports: [
        new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }),
        new winston.transports.File({ filename: "logs/error.log", level: "error", maxsize: 5242880, maxFiles: 5 }),
        new winston.transports.File({ filename: "logs/combined.log", maxsize: 5242880, maxFiles: 5 }),
      ],
    });
  }

  log(message: any, ...optionalParams: any[]) { this.logger.info(message, ...optionalParams); }
  error(message: any, ...optionalParams: any[]) { this.logger.error(message, ...optionalParams); }
  warn(message: any, ...optionalParams: any[]) { this.logger.warn(message, ...optionalParams); }
  debug(message: any, ...optionalParams: any[]) { this.logger.debug(message, ...optionalParams); }
  verbose(message: any, ...optionalParams: any[]) { this.logger.verbose(message, ...optionalParams); }
}
