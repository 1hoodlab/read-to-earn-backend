import { Injectable } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { CreateNewsInputDto } from './dto/news.dto';
import { ClaimStatus, Prisma, news, user } from '@prisma/client';
import { createPaginator } from 'src/_serivces/pagination.service';

@Injectable()
export class NewsService {
  constructor(private readonly prismaService: PrismaService) {}

  createNews(news: CreateNewsInputDto, minRead: number, author: user, tokenId: number, totalSupply: string) {
    console.log(news, tokenId);
    return this.prismaService.news.create({
      data: {
        title: news.title,
        cid: news.cid,
        content_url: news.content_url,
        payment_token: news.payment_token,
        total_supply: totalSupply,
        slug: news.slug,
        thumbnail: news.thumbnail,
        token_id: tokenId,
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

  getListClaimNews(user_id: string) {
    return this.prismaService.user_claim_news.findMany({
      where: {
        user_id: user_id,
      },
      select: {
        news: true,
        status: true,
        token_earned: true,
        transaction_id: true,
        created_at: true,
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

  createUserClaimNews(transaction_id: string, user_id: string, news_id: number) {
    return this.prismaService.user_claim_news.create({
      data: {
        news: {
          connect: {
            id: news_id,
          },
        },
        user: {
          connect: {
            id: user_id,
          },
        },
        transaction_id: transaction_id,
        token_earned: '0',
      },
    });
  }
}
