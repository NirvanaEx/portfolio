import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

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

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll() {
    const items = await this.projectsService.findAll();
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      description: item.description,
      year: item.year,
      cover: item.coverUrl ?? undefined,
      stack: asArray<string>(item.stack),
      tools: asArray<string>(item.tools),
      links: asArray(item.links),
      gallery: asArray(item.gallery),
    }));
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const item = await this.projectsService.findOne(id);
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      description: item.description,
      year: item.year,
      cover: item.coverUrl ?? undefined,
      stack: asArray<string>(item.stack),
      tools: asArray<string>(item.tools),
      links: asArray(item.links),
      gallery: asArray(item.gallery),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: ProjectPayload) {
    const item = await this.projectsService.create(body);
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      description: item.description,
      year: item.year,
      cover: item.coverUrl ?? undefined,
      stack: asArray<string>(item.stack),
      tools: asArray<string>(item.tools),
      links: asArray(item.links),
      gallery: asArray(item.gallery),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  async update(@Param("id") id: string, @Body() body: ProjectPayload) {
    const item = await this.projectsService.update(id, body);
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      description: item.description,
      year: item.year,
      cover: item.coverUrl ?? undefined,
      stack: asArray<string>(item.stack),
      tools: asArray<string>(item.tools),
      links: asArray(item.links),
      gallery: asArray(item.gallery),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.projectsService.remove(id);
  }
}
