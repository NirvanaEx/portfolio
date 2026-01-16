import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import fs from "fs";
import path from "path";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

const getUploadDir = () =>
  path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = getUploadDir();
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base =
      path
        .basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "") || "upload";
    const name = `${Date.now()}-${base}${ext || ""}`;
    cb(null, name);
  },
});

@Controller("upload")
export class UploadsController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadFile(@UploadedFile() file?: { filename: string }) {
    if (!file) {
      return { url: "" };
    }
    return { url: `/uploads/${file.filename}` };
  }
}
