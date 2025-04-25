
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { Message } from '../messages/message.entity';
import { Conversation } from '../conversations/conversation.entity';
import { ConversationParticipant } from '../conversations/conversation-participant.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: null })
  photo: string;

  @Column({ nullable: true })
  avatarColor: string;

  @Column({ default: 0 })
  status: number;

  // 🔁 Tous les messages envoyés par l’utilisateur
  @OneToMany(() => Message, message => message.sender)
  messages: Message[];

  // 🔁 Conversations auxquelles l'utilisateur participe (si ManyToMany utilisé)
  @ManyToMany(() => Conversation, conversation => conversation.participants)
  conversations: Conversation[];

  // 🔁 Lien vers entité intermédiaire
  @OneToMany(() => ConversationParticipant, cp => cp.user)
  conversationParticipants: ConversationParticipant[];
}
