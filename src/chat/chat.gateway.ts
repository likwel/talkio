// src/chat/chat.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) { }

  @WebSocketServer()
  server: Server; //

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() payload: { fromUserId: number; toUserId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`user-${payload.toUserId}`).emit('typing', {
      fromUserId: payload.fromUserId,
    });

    // Optionnel : arrêt auto après X secondes
    setTimeout(() => {
      this.server.to(`user-${payload.toUserId}`).emit('stopTyping', {
        fromUserId: payload.fromUserId,
      });
    }, 3000);
  }

  // Message perso
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody()
    payload: { toUserId: number; fromUserId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendPrivateMessage(
      payload.fromUserId,
      payload.toUserId,
      payload.content,
    );

    // envoyer au destinataire (room privée)
    this.server.to(`user-${payload.toUserId}`).emit('privateMessage', message);

    // écho à l'expéditeur
    client.emit('privateMessage', message);
  }

  // Message groupe
  @SubscribeMessage('groupMessage')
  async handleGroupMessage(
    @MessageBody()
    payload: { groupId: number; fromUserId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendGroupMessage(
      payload.fromUserId,
      payload.groupId,
      payload.content,
    );

    this.server.to(`group-${payload.groupId}`).emit('groupMessage', message);
  }

  // Rejoindre une room
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() payload: { userId?: number; groupId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (payload.userId) {
      client.join(`user-${payload.userId}`);
      console.log(`✅ Client ${client.id} joined room user-${payload.userId}`);
    }
    if (payload.groupId) client.join(`group-${payload.groupId}`);
  }
}
