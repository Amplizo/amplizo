import { Injectable, BadRequestException, ForbiddenException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Request } from "express";
import * as fs from "fs/promises";
import * as csv from "csv-parse/sync";
import * as csvStringify from "csv-stringify/sync";
import * as ExcelJS from "exceljs";

interface ImportResult {
  totalRows: number;
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

@Injectable()
export class ImportExportService {
  private readonly logger = new Logger(ImportExportService.name);
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];
  private readonly ALLOWED_MIME_TYPES = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  constructor(private prisma: PrismaService) {}

  async importCustomers(file: Express.Multer.File, actorId: string, isAdmin: boolean): Promise<ImportResult> {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException("Invalid file type. Only CSV and Excel files are allowed.");
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException("File size exceeds 10MB limit");
    }

    const buffer = file.buffer || (await fs.readFile(file.path));
    let rows: string[][];

    try {
      if (ext === ".csv") {
        const text = buffer.toString("utf-8");
        rows = csv.parse(text, {
          columns: false,
          skip_empty_lines: true,
          trim: true,
        }) as string[][];
      } else {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          throw new BadRequestException("Excel file has no worksheets");
        }
        rows = [];
        worksheet.eachRow((row) => {
          const rowData: string[] = [];
          row.eachCell((cell) => {
            rowData.push(String(cell.value || "").trim());
          });
          if (rowData.some((v) => v !== "")) {
            rows.push(rowData);
          }
        });
      }
    } catch (err: any) {
      this.logger.error(`Failed to parse file: ${err?.message}`);
      throw new BadRequestException("Failed to parse file. Make sure it's a valid CSV or Excel file.");
    }

    if (rows.length < 2) {
      throw new BadRequestException("File is empty or has no data rows");
    }

    const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const nameIdx = headers.findIndex((h) => ["name", "fullname", "firstname", "lastname", "customername", "contactname"].includes(h));
    const phoneIdx = headers.findIndex((h) => ["phone", "mobile", "contact", "tel", "cell", "whatsapp", "phonenumber", "mobilenumber", "contactnumber"].includes(h));
    const emailIdx = headers.findIndex((h) => ["email", "mail", "emailaddress"].includes(h));
    const cityIdx = headers.findIndex((h) => ["city", "location", "town", "place", "address"].includes(h));
    const sourceIdx = headers.findIndex((h) => ["source", "origin", "channel", "leadsource", "platform", "medium"].includes(h));
    const notesIdx = headers.findIndex((h) => ["note", "remark", "comment", "description", "comments", "notes"].includes(h));

    if (nameIdx === -1 || phoneIdx === -1) {
      throw new BadRequestException("File must contain 'Name' and 'Phone' columns");
    }

    const result: ImportResult = {
      totalRows: rows.length - 1,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    const existingPhones = new Set<string>();
    if (!isAdmin) {
      const existing = await this.prisma.client.findMany({
        where: { assignedEmployeeId: actorId },
        select: { phone: true },
      });
      existing.forEach((c) => { if (c.phone) existingPhones.add(c.phone); });
    }

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      const name = String(cells[nameIdx] || "").trim();
      const phone = String(cells[phoneIdx] || "").replace(/[^0-9]/g, "").trim();
      const email = emailIdx >= 0 ? String(cells[emailIdx] || "").trim() : "";
      const city = cityIdx >= 0 ? String(cells[cityIdx] || "").trim() : "";
      const source = sourceIdx >= 0 ? String(cells[sourceIdx] || "").trim() : "";
      const notes = notesIdx >= 0 ? String(cells[notesIdx] || "").trim() : "";

      if (!name || phone.length < 10 || phone.length > 15) {
        result.failed++;
        result.errors.push(`Row ${i + 1}: Invalid name or phone number`);
        continue;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        result.failed++;
        result.errors.push(`Row ${i + 1}: Invalid email format`);
        continue;
      }

      try {
        const existing = await this.prisma.client.findUnique({
          where: { phone },
        });

        if (existing) {
          if (!isAdmin && existing.assignedEmployeeId !== actorId) {
            result.skipped++;
            result.errors.push(`Row ${i + 1}: Phone ${phone} belongs to another agent`);
            continue;
          }
          await this.prisma.client.update({
            where: { phone },
            data: {
              name,
              email: email || undefined,
              city: city || undefined,
              source: source || "Direct",
              notes: notes || undefined,
              ...(isAdmin ? {} : { assignedEmployeeId: actorId }),
            },
          });
          result.success++;
        } else {
          await this.prisma.client.create({
            data: {
              name,
              phone,
              email: email || undefined,
              city: city || undefined,
              source: source || "Direct",
              notes: notes || undefined,
              assignedEmployeeId: isAdmin ? undefined : actorId,
            },
          });
          result.success++;
        }
      } catch (err: any) {
        result.failed++;
        result.errors.push(`Row ${i + 1}: ${err?.message || "Database error"}`);
      }
    }

    return result;
  }

  async exportCustomers(actorId: string, isAdmin: boolean, format: "csv" | "xlsx", skip = 0, take = 1000): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const where: any = {};
    if (!isAdmin) {
      where.assignedEmployeeId = actorId;
    }

    const customers = await this.prisma.client.findMany({
      where,
      skip,
      take,
      include: {
        purchases: { orderBy: { purchaseDate: "desc" } },
        assignedEmployee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = customers.map((c) => {
      const lp = c.purchases[0];
      return {
        Name: c.name,
        Phone: c.phone,
        Email: c.email || "",
        City: c.city || "",
        Source: c.source || "",
        Status: c.status,
        "Lead Status": c.currentLeadStatus,
        "Purchase Count": c.purchases.length,
        "Latest Purchase Amount": lp ? Number(lp.purchaseAmount) : 0,
        "Total Spent": c.purchases.reduce((sum, p) => sum + Number(p.purchaseAmount), 0),
        "Product/Item": lp?.productDetails || "",
        "Assigned To": c.assignedEmployee?.name || "",
        "Created Date": c.createdAt.toISOString().split("T")[0],
      };
    });

    const timestamp = new Date().toISOString().split("T")[0];

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Customers");
      if (rows.length > 0) {
        worksheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key }));
        worksheet.addRows(rows);
      }
      const arrayBuffer = await workbook.xlsx.writeBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return { buffer, filename: `customers-export-${timestamp}.xlsx`, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
    }

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    const csvRows = [headers, ...rows.map((r) => headers.map((h) => `"${String(r[h as keyof typeof r] ?? "").replace(/"/g, '""')}"`))];
    const csv = csvRows.map((r) => r.join(",")).join("\r\n");
    return { buffer: Buffer.from("\uFEFF" + csv), filename: `customers-export-${timestamp}.csv`, mimeType: "text/csv;charset=utf-8;" };
  }
}
