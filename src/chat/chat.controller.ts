import { Controller, Get, Post, Param, Body, Req, Render } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';

import * as dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly userService: UsersService
    ) { }

    @Get('private/:userId')
    @Render('message-perso')
    async getPrivateChat(@Param('userId') otherUserId: number, @Req() req) {
        const currentUserId = req.user?.id || 1; // temporaire
        const messages = await this.chatService.getPrivateMessages(currentUserId, otherUserId);
        const otherUser = await this.userService.findById(otherUserId);
        // console.log(messages.flatMap(c => c.messages))

        const lastMessage = await this.chatService.getUserConversationsSorted(currentUserId);

        const allMessages = messages.flatMap(c => c.messages);

        // 👉 Grouper les messages par jour
        const groupedMessages = {};
        for (const message of allMessages) {
            const rawDate = dayjs(message.createdAt).format('dddd D MMMM'); // "lundi 22 avril"
            // const dateKey = rawDate.charAt(0).toUpperCase() + rawDate.slice(1); // "Lundi 22 avril"
            const dateKey = this.getDateLabel(message.createdAt);
            if (!groupedMessages[dateKey]) {
                groupedMessages[dateKey] = [];
            }
            groupedMessages[dateKey].push(message);
        }

        const users = await this.userService.findAll();
        // console.log(users);

        const currentUrl = req.url;

        return {
            users,
            lastMessage: lastMessage,
            messages: groupedMessages,
            userId: otherUserId,     // 👈 envoyé à la vue
            otherUser: otherUser,
            currentUserId: currentUserId, // optionnel
            currentUrl,
        };
    }

    @Get('group/:groupId')
    @Render('message-group') // ou remplacer par .json() si c’est une API REST
    async getGroupChatNew(@Param('groupId') groupId: string, @Req() req) {
        // const conversation = await this.chatService.getGroupConversation(groupId);
        const currentUserId = req.user?.id || 1
        const group = await this.chatService.getGroupConversation(groupId);

        if (!group) {
            return { error: 'Groupe introuvable', messages: [] };
        }

        // const allMessages = group.flatMap(c => c.messages);
        const allMessages = group.messages;

        // 👉 Grouper les messages par jour
        const groupedMessages = {};
        for (const message of allMessages) {
            const rawDate = dayjs(message.createdAt).format('dddd D MMMM'); // "lundi 22 avril"
            // const dateKey = rawDate.charAt(0).toUpperCase() + rawDate.slice(1); // "Lundi 22 avril"
            const dateKey = this.getDateLabel(message.createdAt);
            if (!groupedMessages[dateKey]) {
                groupedMessages[dateKey] = [];
            }
            groupedMessages[dateKey].push(message);
        }

        const lastMessage = await this.chatService.getUserConversationsSorted(currentUserId);

        const users = await this.userService.findAll();
        const currentUrl = req.url;
        // console.log(users); 


        return {
            // conversation,
            users,
            lastMessage: lastMessage,
            group: group,
            messages: groupedMessages,
            currentUserId: currentUserId,
            groupId,
            currentUrl,
        };
    }

    getDateLabel(date: Date): string {
        const d = dayjs(date);
        const today = dayjs();
        const yesterday = dayjs().subtract(1, 'day');

        if (d.isSame(today, 'day')) return "Aujourd’hui";
        if (d.isSame(yesterday, 'day')) return "Hier";

        // sinon, format en français
        const raw = d.format('dddd D MMMM'); // lundi 22 avril
        return raw.charAt(0).toUpperCase() + raw.slice(1); // Lundi 22 avril
    }

    // @Get('group/:groupId')
    // async getGroupChat(@Param('groupId') groupId: string) {
    //     return this.chatService.getGroupConversation(groupId);
    // }

    @Post('message/private/:userId')
    async sendPrivateMessage(
        @Param('userId') userId: number,
        @Body('content') content: string,
        @Req() req,
    ) {
        const senderId = req.user?.id || 1;
        return this.chatService.sendPrivateMessage(senderId, userId, content);
    }

    @Post('message/group/:groupId')
    async sendGroupMessage(
        @Param('groupId') groupId: number,
        @Body('content') content: string,
        @Req() req,
    ) {
        const senderId = req.user?.id || 1;
        return this.chatService.sendGroupMessage(senderId, groupId, content);
    }

    @Post('message/private/visio/:userId')
    async sendPrivateVisio(
        @Param('userId') userId: number,
        @Req() req,
    ) {
        const senderId = req.user?.id || 1;
        return this.chatService.sendPrivateVisio(senderId, userId);
    }

    @Get('messages/:conversationId')
    async getMessages(@Param('conversationId') id: string) {
        return this.chatService.getMessages(id);
    }

    @Get('my')
    async getMyConversations(@Req() req) {
        const userId = req.user?.id || 1;
        return this.chatService.getUserConversationsWithLastMessages(userId);
    }

    @Post('group/create')
    async createGroup(@Body() body: { name: string; participantIds: number[] }) {
        return this.chatService.createGroupConversation(body.name, body.participantIds);
    }

}