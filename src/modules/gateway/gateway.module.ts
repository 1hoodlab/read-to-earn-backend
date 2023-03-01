import { Module } from '@nestjs/common';
import { DetectReadNewsGateway } from './detect-readnews.gateway';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway, DetectReadNewsGateway],
})
export class GatewayModule {}
