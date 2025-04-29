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
  @SubscribeMessage('webrtc-offer')
  async handleWebrtcOffer(
    @MessageBody() payload: { fromUserId: number; toUserId: number; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendPrivateVisio(payload.fromUserId, payload.toUserId);
    this.server.to(`user-${payload.toUserId}`).emit('webrtc-offer', {
      fromUserId: payload.fromUserId,
      offer: payload.offer,
      callRoomId: message.callRoomId,
    });
    client.emit('webrtc-offer', {
      fromUserId: payload.fromUserId, 
      offer: payload.offer, 
      callRoomId: message.callRoomId,
    });

    // envoyer aussi le message de type 'visio' comme un message normal
    this.server.to(`user-${payload.toUserId}`).emit('privateMessage', message);
    client.emit('privateMessage', message); // retour à l’émetteur aussi
    
  }

  @SubscribeMessage('webrtc-answer')
  handleWebrtcAnswer(
    @MessageBody() payload: { fromUserId: number; toUserId: number; answer: RTCSessionDescriptionInit },
  ) {
    this.server.to(`user-${payload.toUserId}`).emit('webrtc-answer', {
      fromUserId: payload.fromUserId,
      answer: payload.answer,
    });
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleWebrtcIceCandidate(
    @MessageBody() payload: { fromUserId: number; toUserId: number; candidate: RTCIceCandidateInit },
  ) {
    this.server.to(`user-${payload.toUserId}`).emit('webrtc-ice-candidate', {
      fromUserId: payload.fromUserId,
      candidate: payload.candidate,
    });
  }

  @SubscribeMessage('invite-participant')
  handleInviteParticipant(
    @MessageBody() payload: { fromUserId: number; toUserId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Envoi d'un message ou d'une alerte en temps réel
    this.server.to(`user-${payload.toUserId}`).emit('receive-invitation', {
      fromUserId: payload.fromUserId,
      message: `🔔 Vous êtes invité(e) à rejoindre un appel !`,
    });
 
    client.emit('invitation-sent', {
      toUserId: payload.toUserId,
      status: 'success',
    });
  }

  @SubscribeMessage('hangup-call')
  async handleHangupCall(
    @MessageBody() payload: { fromUserId: number; toUserId: number },
  ) {
    this.server.to(`user-${payload.toUserId}`).emit('call-ended', {
      fromUserId: payload.fromUserId,
    });
    await this.chatService.updateCallEnded(payload.fromUserId, payload.toUserId);
  }

}
