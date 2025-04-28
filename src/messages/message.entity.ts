// src/messages/message.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Conversation } from '../conversations/conversation.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'text' })
  type: 'text' | 'visio';  // Nouveau champ : type de message

  @Column({ nullable: true })
  content: string; // Vide pour une visio si besoin

  @Column({ nullable: true })
  callRoomId: string; // ID de la salle de visio associée (ex: 'room-abc123')

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.messages)
  sender: User;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  conversation: Conversation;
}
