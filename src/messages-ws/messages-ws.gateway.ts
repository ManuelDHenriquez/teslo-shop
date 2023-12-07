import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-messages.dto';

@WebSocketGateway({ cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;


  constructor(
    private readonly messagesWsService: MessagesWsService
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    console.log({ token });   
    
    // console.log( 'Cliente conectado', client.id );
    this.messagesWsService.registerClient(client);
    
    this.wss.emit('clients-updated', this.messagesWsService.getConectedClients());
    
  }

  handleDisconnect(client: Socket) {
    // console.log( 'Cliente desconectado', client.id );
    this.messagesWsService.removeClient(client.id);

    this.wss.emit('clients-updated', this.messagesWsService.getConectedClients());

  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto): void {

    //! Emitir unicamente al cliente que envio el mensaje
    // client.emit('message-from-server', payload, {
    //   fullName: 'Jorge Cano',
    //   message: payload.message || 'No hay mensaje',
    // });
    // this.wss.emit('message-from-server', payload);

    //! Emitir a todos los clientes conectados
    // this.wss.emit('message-from-server', payload, {
    //   fullName: 'Jorge Cano',
    //   message: payload.message || 'No hay mensaje',
    // });

    //! Emitir a todos los clientes conectados menos al que envio el mensaje
    this.wss.emit('message-from-server', {
      fullName: 'Jorge Cano',
      message: payload.message || 'No hay mensaje',
    });
  }
}
