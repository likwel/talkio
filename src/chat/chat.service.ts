import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '../conversations/conversation.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Message } from 'src/messages/message.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) { }

    async sendPrivateMessage(senderId: number, receiverId: number, content: string) {
        const sender = await this.userRepository.findOneBy({ id: senderId });
        const receiver = await this.userRepository.findOneBy({ id: receiverId });

        if (!sender || !receiver) {
            throw new Error('Utilisateur introuvable');
        }

        // Crée une clé unique pour les conversations privées (ex: "1-5")
        const uniqueKey = [senderId, receiverId].sort((a, b) => a - b).join('-');

        let conversation = await this.conversationRepository.findOne({
            where: {
                uniquePrivateKey: uniqueKey,
                isGroup: false,
            },
            relations: ['participants'],
        });

        if (!conversation) {
            conversation = this.conversationRepository.create({
                name: `${sender.username} - ${receiver.username}`,
                isGroup: false,
                uniquePrivateKey: uniqueKey,
                participants: [sender, receiver],
            });
            await this.conversationRepository.save(conversation);
        }

        const message = this.messageRepository.create({
            content,
            sender,
            conversation,
        });

        return this.messageRepository.save(message);
    }

    async sendGroupMessage(senderId: number, groupId: number, content: string) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: groupId, isGroup: true },
        });

        const sender = await this.userRepository.findOneBy({ id: senderId });

        if (!sender || !conversation) {
            throw new Error('Utilisateur ou groupe introuvable');
        }

        const message = this.messageRepository.create({
            content,
            sender,
            conversation,
        });

        return this.messageRepository.save(message);
    }

    async getPrivateMessages(userAId: number, userBId: number) {
        const conversation = await this.conversationRepository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'p1', 'p1.id = :userAId', { userAId })
            .innerJoin('conversation.participants', 'p2', 'p2.id = :userBId', { userBId })
            .where('conversation.isGroup = false')
            .leftJoinAndSelect('conversation.messages', 'messages')
            .leftJoinAndSelect('messages.sender', 'sender')
            .orderBy('messages.createdAt', 'ASC')
            // .getOne();
            .getMany();

        if (!conversation) {
            return [];
        }

        return conversation;
    }

    async getGroupConversation(groupId: string) {
        return this.conversationRepository.findOne({
            where: { id: Number(groupId), isGroup: true },
            relations: ['messages', 'messages.sender'],
        });
    }

    async getMessages(conversationId: string) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: Number(conversationId) },
            relations: ['messages', 'messages.sender'],
        });
        return conversation?.messages || [];
    }

    async getUserConversationsWithLastMessages(userId: number) {
        return this.conversationRepository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'participant', 'participant.id = :userId', { userId })
            .leftJoinAndSelect('conversation.messages', 'messages')
            .orderBy('messages.createdAt', 'DESC')
            .getMany();
    }
}
