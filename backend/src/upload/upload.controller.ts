import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Body, UseGuards } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { v4 as uuidv4 } from "uuid";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { PrismaService } from "../prisma/prisma.service";

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_AUDIO = ["audio/mpeg", "audio/wav", "audio/aac", "audio/ogg", "audio/webm"];
const ALLOWED_ALL = [...ALLOWED_IMAGE, ...ALLOWED_VIDEO, ...ALLOWED_AUDIO];

@Controller()
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private prisma: PrismaService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", {
    storage: diskStorage({ destination: join(process.cwd(), "uploads"), filename: (req, file, callback) => callback(null, `${uuidv4()}${extname(file.originalname)}`) }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, callback) => { if (!ALLOWED_ALL.includes(file.mimetype)) return callback(new BadRequestException("File type not allowed"), false); callback(null, true); },
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body("chatId") chatId: string) {
    if (!file) throw new BadRequestException("No file uploaded");
    let type: "image" | "video" | "audio" = "audio";
    if (ALLOWED_IMAGE.includes(file.mimetype)) type = "image";
    else if (ALLOWED_VIDEO.includes(file.mimetype)) type = "video";
    const url = `/uploads/${file.filename}`;
    const attachment = await this.prisma.attachment.create({ data: { messageId: chatId, url, fileName: file.originalname, fileSize: file.size, mimeType: file.mimetype, type } });
    return { id: attachment.id, url: attachment.url, thumbnailUrl: attachment.thumbnailUrl, fileName: attachment.fileName, fileSize: attachment.fileSize, mimeType: attachment.mimeType, type: attachment.type, duration: attachment.duration };
  }
}
