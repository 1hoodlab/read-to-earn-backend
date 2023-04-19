import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role, news } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateNewsInputDto } from './dto/news.dto';
import { NewsService } from './news.service';

@Controller('news')
@ApiTags('News')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post('create')
  @Roles([Role.writer])
  async createNews(@Body() news: CreateNewsInputDto): Promise<news> {
    return;
  }
}
