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

    async sendPrivateVisio(senderId: number, receiverId: number) {
        const sender = await this.userRepository.findOneBy({ id: senderId });
        const receiver = await this.userRepository.findOneBy({ id: receiverId });
    
        if (!sender || !receiver) {
            throw new Error('Utilisateur introuvable');
        }
    
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
    
        const callRoomId = `room-${Date.now()}-${senderId}-${receiverId}`; // génère un ID unique de salle de visio
    
        const message = this.messageRepository.create({
            type: 'visio',  // CHANGEMENT ICI
            content: '',                // pas de texte
            callRoomId,                 // ID de la salle de visio
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

    async createGroupConversation(name: string, participantIds: number[]): Promise<Conversation> {
        const participants = await this.userRepository.findByIds(participantIds);

        const conversation = this.conversationRepository.create({
            name,
            isGroup: true,
            participants,
        });

        return await this.conversationRepository.save(conversation);
    }

    async getGroupConversation(groupId: string) {
        return this.conversationRepository.findOne({
            where: { id: Number(groupId), isGroup: true },
            relations: ['participants', 'messages', 'messages.sender'],
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

    async getUserConversationsSorted(userId: number) {
        const conversations = await this.conversationRepository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'participant', 'participant.id = :userId', { userId })
            .leftJoinAndSelect('conversation.messages', 'message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('conversation.participants', 'allParticipants')
            .orderBy('message.createdAt', 'DESC')
            .getMany();

        return conversations.map(conversation => {
            // Dernier message
            const lastMessage = conversation.messages?.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0] || null;

            // Nom de la conversation :
            // - si c'est un groupe => utiliser le nom
            // - sinon => trouver l'autre utilisateur
            let displayName = conversation.name;

            let displayAvatar: string | null = null;

            if (!conversation.isGroup) {
                const otherUser = conversation.participants.find(p => p.id !== userId);
                displayName = otherUser?.username || 'Inconnu';
                displayAvatar = otherUser?.photo || null; // ✅ maintenant c'est OK
            }

            const isSender = lastMessage?.sender?.id === userId;

            let receiverId;
            let receiverName;
            let receiverColor;

            if (!conversation.isGroup && lastMessage) {
                const otherUser = conversation.participants.find(p => p.id !== userId);
                receiverId = isSender ? otherUser?.id : lastMessage.sender.id;
                receiverName = isSender ? otherUser?.username : lastMessage.sender.username;
                receiverColor = isSender ? otherUser?.avatarColor : lastMessage.sender.avatarColor;
            }

            return {
                id: conversation.id,
                isGroup: conversation.isGroup,
                name: displayName,
                avatar: displayAvatar,
                participants: conversation.participants,
                lastMessage,
                receiverId,
                receiverName,
                receiverColor,
            };
        });
    }

}
