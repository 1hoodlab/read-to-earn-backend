import { Logger, UseGuards } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway()
export class DetectReadNewsGateway {
  constructor() {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger(DetectReadNewsGateway.name);
}
