import { Injectable } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { CreateNewsInputDto } from './dto/news.dto';
import { Prisma, user } from '@prisma/client';
import { createPaginator } from 'src/_serivces/pagination.service';

@Injectable()
export class NewsService {
  constructor(private readonly prismaService: PrismaService) {}

  createNews(news: CreateNewsInputDto, minRead: number, author: user) {
    return this.prismaService.news.create({
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

  findNews(slug: string) {
    return this.prismaService.news.findFirst({
      where: {
        slug: slug,
      },
    });
  }

  getNewsAll({ page, perPage, keyword }: { page: number; perPage: number; keyword?: string }) {
    const paginate = createPaginator({ perPage });
    console.log(page, perPage);
    return paginate<any, Prisma.NewsAggregateArgs>(
      this.prismaService.news,
      {
        where: {
          title: {
            contains: keyword,
            mode: 'insensitive',
          },
          published: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      },
      {
        page: page,
      },
    );
  }
}
