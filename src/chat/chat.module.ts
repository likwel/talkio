// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../conversations/conversation.entity';
import { Message } from '../messages/message.entity';
import { User } from '../users/user.entity';
import { ChatGateway } from './chat.gateway';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User])
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, UsersService],
  exports: [ChatService],
})
export class ChatModule {}
