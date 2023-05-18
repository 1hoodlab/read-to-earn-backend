import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger(EventsGateway.name);
  afterInit() {
    this.logger.log('Init');
  }

  handleDisconnect(client) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
