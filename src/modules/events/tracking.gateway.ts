import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ClaimStatus } from '@prisma/client';

import { Server, Socket } from 'socket.io';
import { NewsService } from '../news/news.service';
import * as dayjs from 'dayjs';

const reader = new Map<string, ReaderType>();

type ReaderType = {
  slug: string;
  user_id: string;
  is_scroll: boolean;
  claim_status: ClaimStatus;
  tracking_scroll: number;
  tracking_next_tab: boolean;
  tracking_unfocused: boolean;
  end_time_valid: number;
  reader_token: string;
};

@WebSocketGateway()
export class TrackingGateway {
  constructor(private readonly newsService: NewsService) {}
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger(TrackingGateway.name);

  @SubscribeMessage('PING_PONG')
  async pingPong(@MessageBody() data: any) {
    this.logger.log(data);
  }

  @SubscribeMessage('JOIN_ROOM')
  async joinRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    try {
      const { slug, user_id, is_scroll, reader_token } = JSON.parse(data);

      const roomId = `${slug}-${user_id}`;

      client.emit('ROOM', roomId);

      const news = await this.newsService.findNewsBySlug(slug);

      const minReadToSecond = Number((news.min_read * 60).toFixed());

      const endTimeValid = dayjs().add(minReadToSecond, 'seconds').unix();

      reader.set(roomId, {
        slug: news.slug,
        user_id: user_id,
        is_scroll: is_scroll,
        claim_status: ClaimStatus.pending,
        tracking_scroll: 0,
        tracking_next_tab: false,
        tracking_unfocused: false,
        end_time_valid: endTimeValid,
        reader_token: reader_token,
      });

      const userClaimNews = await this.newsService.createUserClaimNews(reader_token, slug);

      client.join(roomId);

      client.emit('LOG', {
        data: {
          ...userClaimNews,
          roomId: roomId,
        },
      });
    } catch (error) {
      client.emit('LOG', 'Error!');
    }
  }

  @SubscribeMessage('TRACKING_SCROLL')
  async trackingScroll(@MessageBody() data: any) {
    const { roomId, trackingScroll } = JSON.parse(data);

    const readerInfo = reader.get(roomId);

    if (!readerInfo) return;

    reader.set(roomId, {
      ...readerInfo,
      tracking_scroll: parseFloat(trackingScroll),
    });
  }

  @SubscribeMessage('TRACKING_NEXT_TAB')
  async trackingNextTab(@MessageBody() data: any) {
    const { roomId, trackingNextTab } = JSON.parse(data);
    const readerInfo = reader.get(roomId);

    if (!readerInfo) return;

    reader.set(roomId, {
      ...readerInfo,
      tracking_next_tab: trackingNextTab,
    });
  }

  @SubscribeMessage('TRACKING_UNFOCUSED')
  async trackingUnfocused(@MessageBody() data: any) {
    const { roomId, trackingUnfocused } = JSON.parse(data);
    const readerInfo = reader.get(roomId);

    if (!readerInfo) return;

    reader.set(roomId, {
      ...readerInfo,
      tracking_unfocused: trackingUnfocused,
    });
  }

  @SubscribeMessage('UNSUBCRIBE')
  async unsubcribe(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { roomId } = JSON.parse(data);

    this.logger.log(`Leave room: ${roomId}`);

    client.leave(roomId);

    reader.delete(roomId);
  }

  @SubscribeMessage('SUBMIT')
  async submit(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { roomId } = JSON.parse(data);

    const currentTime = dayjs(new Date()).unix();

    const readerInfo = reader.get(roomId);

    if (!readerInfo) return;

    let claimStatus: ClaimStatus;

    if (
      readerInfo &&
      (currentTime < readerInfo.end_time_valid ||
        readerInfo.tracking_unfocused ||
        readerInfo.tracking_next_tab ||
        (readerInfo.is_scroll && readerInfo.tracking_scroll < 99))
    ) {
      claimStatus = ClaimStatus.failure;
    } else {
      claimStatus = ClaimStatus.success;
    }

    try {
      const statusUserClaimNews = await this.newsService.updateStatusUserClaimNews(readerInfo.reader_token, readerInfo.slug, claimStatus);

      client.emit('RESULT', { data: statusUserClaimNews, status: claimStatus, message: `Claim news ${claimStatus}`, readerInfo });
    } catch (error) {
      if (error instanceof Error) {
        client.emit('RESULT', { message: error.message, status: ClaimStatus.failure });
      } else {
        client.emit('RESULT', { message: 'BAD REQUEST', status: ClaimStatus.failure });
      }
    }
  }
}
