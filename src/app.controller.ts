import { Controller, Get, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { ChatService } from './chat/chat.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatService: ChatService,
    private readonly userService: UsersService
  ) {}

  @Get()
  @Render('index')  // Rendre le template home.hbs
  async getHello(@Req() req) {
    const currentUserId = req.user?.id || 1
    
    const lastMessage = await this.chatService.getUserConversationsSorted(currentUserId);
    const users = await this.userService.findAll();
    const user = await this.userService.findById(currentUserId);
    const currentUrl = req.url;
    return { 
      title: 'Bienvenue sur Talkio', 
      message : this.appService.getHello(), 
      lastMessage : lastMessage,
      currentUrl,
      users, 
      user,
    };
  }
}
