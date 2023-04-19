import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateNewsInputDto } from './dto/news.dto';
import { user } from '@prisma/client';

@Injectable()
export class NewsService {
  constructor(private readonly prismaService: PrismaService) {}

  createNews(news: CreateNewsInputDto, minRead: number, author: user) {
    this.prismaService.news.create({
      data: {
        ...news,
        min_read: minRead,
        author: {
          connect: {
            id: author.id,
          },
        },
      },
    });
  }
}
