// src/conversations/conversation-participant.entity.ts

import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class ConversationParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.conversationParticipants)
  user: User;

  @ManyToOne(() => Conversation, conversation => conversation.participants)
  conversation: Conversation;
}
