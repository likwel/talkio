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

    console.log(`✅ Client ${client.id} joined room group-${payload.groupId}`);

    this.server.to(`group-${payload.groupId}`).emit('groupMessage', message);
  }

  // Invitation à un appel visio privé
  @SubscribeMessage('privateVisio')
  async handlePrivateVisio(
    @MessageBody()
    payload: { toUserId: number; fromUserId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendPrivateVisio(
      payload.fromUserId,
      payload.toUserId,
    );

    // envoyer au destinataire (room privée)
    this.server.to(`user-${payload.toUserId}`).emit('privateVisio', message);

    // écho à l'expéditeur
    client.emit('privateVisio', message);
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
    if (payload.groupId) {
      client.join(`group-${payload.groupId}`);
      console.log(`✅ Client ${client.id} joined room group-${payload.groupId}`);
    }
  }

  // 1. Quand un utilisateur rejoint une room
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(payload.roomId);
    client.to(payload.roomId).emit('userJoined', { socketId: client.id });
  }

  // 2. Quand un utilisateur envoie une "offer"
  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() payload: { roomId: string; offer: any; targetSocketId: string },
  ) {
    this.server.to(payload.targetSocketId).emit('offer', {
      offer: payload.offer,
      socketId: payload.targetSocketId,
    });
  }

  // 3. Quand un utilisateur envoie une "answer"
  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() payload: { roomId: string; answer: any; targetSocketId: string },
  ) {
    this.server.to(payload.targetSocketId).emit('answer', {
      answer: payload.answer,
      socketId: payload.targetSocketId,
    });
  }

  // 4. ICE candidate
  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() payload: { roomId: string; candidate: any; targetSocketId: string },
  ) {
    this.server.to(payload.targetSocketId).emit('ice-candidate', {
      candidate: payload.candidate,
      socketId: payload.targetSocketId,
    });
  }
}
