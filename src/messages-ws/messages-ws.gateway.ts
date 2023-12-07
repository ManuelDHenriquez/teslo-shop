import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;


  constructor(
    private readonly messagesWsService: MessagesWsService
  ) {}

  handleConnection(client: Socket) {
    // console.log( 'Cliente conectado', client.id );
    this.messagesWsService.registerClient(client);

    
    client.emit('connected-clients', this.messagesWsService.getConectedClients());
    
  }

  handleDisconnect(client: Socket) {
    // console.log( 'Cliente desconectado', client.id );
    this.messagesWsService.removeClient(client.id);
  }
}
