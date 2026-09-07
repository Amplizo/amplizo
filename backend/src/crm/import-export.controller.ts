import { Controller, Post, Get, UseGuards, Req, UploadedFile, BadRequestException, Query, Res, StreamableFile, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { ImportExportService } from "./import-export.service";
import { Request } from "express";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { join } from "path";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportExportController {
  constructor(private importExportService: ImportExportService) {}

  @Post("crm/import/customers")
  @Roles("admin", "agent")
  @UseInterceptors(FileInterceptor("file", {
    dest: join(process.cwd(), "uploads"),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
      if ([".csv", ".xlsx", ".xls"].includes(ext)) {
        callback(null, true);
      } else {
        callback(new BadRequestException("Only CSV and Excel files are allowed"), false);
      }
    },
  }))
  async importCustomers(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const user = req.user as any;
    const result = await this.importExportService.importCustomers(file, user.id, user.role === "admin");
    return {
      success: result.failed === 0,
      totalRows: result.totalRows,
      successCount: result.success,
      failedCount: result.failed,
      skippedCount: result.skipped,
      errors: result.errors.slice(0, 50),
      message: result.failed === 0
        ? `Successfully imported ${result.success} customers`
        : `Imported ${result.success} customers, ${result.failed} failed, ${result.skipped} skipped`,
    };
  }

  @Get("crm/export/customers")
  @Roles("admin", "agent")
  async exportCustomers(@Req() req: Request, @Query("format") format: "csv" | "xlsx", @Query("skip") skip: string, @Query("take") take: string, @Res() res: Response) {
    const user = req.user as any;
    const exportFormat = format === "xlsx" ? "xlsx" : "csv";
    const s = Number(skip);
    const t = Number(take);
    const result = await this.importExportService.exportCustomers(user.id, user.role === "admin", exportFormat, s, t);

    res.set({
      "Content-Type": result.mimeType,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Content-Length": result.buffer.length,
    });
    res.send(result.buffer);
  }
}