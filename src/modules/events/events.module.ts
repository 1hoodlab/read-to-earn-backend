import { Module } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';
import { EventsGateway } from '../gateway/events.gateway';
import { NewsModule } from '../news/news.module';

@Module({
  providers: [TrackingGateway, EventsGateway],
  imports: [NewsModule],
})
export class EventsModule {}
