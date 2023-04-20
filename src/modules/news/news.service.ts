import { Injectable } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { CreateNewsInputDto } from './dto/news.dto';
import { ClaimStatus, Prisma, user } from '@prisma/client';
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

  findNewsById(id: number) {
    return this.prismaService.news.findUnique({
      where: {
        id,
      },
    });
  }

  findNewsBySlug(slug: string) {
    return this.prismaService.news.findFirst({
      where: {
        slug,
      },
    });
  }

  getNewsAll({ page, perPage, keyword }: { page: number; perPage: number; keyword?: string }) {
    const paginate = createPaginator({ perPage });

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

  findUserClaimNewsById(user_id: string, news_id: number) {
    return this.prismaService.user_claim_news.findUnique({
      where: {
        news_id_user_id: {
          user_id: user_id,
          news_id: news_id,
        },
      },
    });
  }

  countUserClaimNews(user_id: string) {
    return this.prismaService.user_claim_news.count({
      where: {
        user_id: user_id,
        status: ClaimStatus.success,
      },
    });
  }
}
