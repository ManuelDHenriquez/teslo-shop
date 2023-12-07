import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true, namespace: 'messages'})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  constructor(
    private readonly messagesWsService: MessagesWsService
  ) {}

  handleConnection(client: Socket) {
    console.log( 'Cliente conectado', client.id );
    
  }

  handleDisconnect(client: any) {
    console.log( 'Cliente desconectado', client.id );
    ;
  }
}
