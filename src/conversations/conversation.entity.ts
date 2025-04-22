// src/conversations/conversation.entity.ts

import { OneToMany, ManyToMany, Entity, PrimaryGeneratedColumn, Column, JoinTable } from 'typeorm';
import { User } from '../users/user.entity'; // si tu as une entité User
import { Message } from '../messages/message.entity'; // adapte le chemin si besoin

@Entity()
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    uniquePrivateKey: string;

    @Column({ nullable: true })
    name: string;

    // Exemple relation utilisateurs <-> conversations
    @ManyToMany(() => User, user => user.conversations)
    @JoinTable()
    participants: User[];

    @OneToMany(() => Message, message => message.conversation)
    messages: Message[];


    @Column({ default: false })
    isGroup: boolean;
}
