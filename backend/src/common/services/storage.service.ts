import { Injectable, Logger } from "@nestjs/common";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";

@Injectable()
export class StorageService {
  private readonly logger = new Logger("StorageService");
  private s3Client: S3Client | null = null;
  private bucket = process.env.AWS_S3_BUCKET || "amplizo-uploads";
  private region = process.env.AWS_S3_REGION || "ap-south-1";
  private useS3 = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  constructor() {
    if (this.useS3) {
      this.s3Client = new S3Client({ region: this.region });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const filename = `${uuidv4()}${extname(file.originalname)}`;

    if (this.useS3 && this.s3Client) {
      try {
        await this.s3Client.send(new PutObjectCommand({ Bucket: this.bucket, Key: filename, Body: file.buffer, ContentType: file.mimetype }));
        const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filename}`;
        return { url, key: filename };
      } catch (error) {
        this.logger.error(`S3 upload failed: ${error.message}`);
      }
    }

    const uploadDir = join(process.cwd(), "uploads");
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    const filePath = join(uploadDir, filename);
    writeFileSync(filePath, file.buffer);
    return { url: `/uploads/${filename}`, key: filename };
  }

  async deleteFile(key: string): Promise<void> {
    if (this.useS3 && this.s3Client) {
      try {
        await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      } catch (error) {
        this.logger.error(`S3 delete failed: ${error.message}`);
      }
    } else {
      const filePath = join(process.cwd(), "uploads", key);
      if (existsSync(filePath)) {
        try { unlinkSync(filePath); } catch {}
      }
    }
  }
}
