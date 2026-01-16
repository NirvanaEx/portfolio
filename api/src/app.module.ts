import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import path from "path";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ProjectsModule } from "./projects/projects.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "uploads"),
      serveRoot: "/uploads",
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    UploadsModule,
  ],
})
export class AppModule {}
