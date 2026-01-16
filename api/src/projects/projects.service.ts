import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

type ProjectPayload = {
  id: string;
  title: string;
  summary: string;
  description: string;
  year: string;
  cover?: string;
  stack?: string[];
  tools?: string[];
  links?: unknown[];
  gallery?: unknown[];
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    return project;
  }

  create(payload: ProjectPayload) {
    return this.prisma.project.create({
      data: {
        id: payload.id,
        title: payload.title,
        summary: payload.summary,
        description: payload.description,
        year: payload.year,
        coverUrl: payload.cover ?? null,
        stack: (payload.stack ?? []) as Prisma.InputJsonValue,
        tools: (payload.tools ?? []) as Prisma.InputJsonValue,
        links: (payload.links ?? []) as Prisma.InputJsonValue,
        gallery: (payload.gallery ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, payload: ProjectPayload) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        title: payload.title,
        summary: payload.summary,
        description: payload.description,
        year: payload.year,
        coverUrl: payload.cover ?? null,
        stack: (payload.stack ?? []) as Prisma.InputJsonValue,
        tools: (payload.tools ?? []) as Prisma.InputJsonValue,
        links: (payload.links ?? []) as Prisma.InputJsonValue,
        gallery: (payload.gallery ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.project.delete({ where: { id } });
  }
}
