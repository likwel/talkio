import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')  // Rendre le template home.hbs
  getHello() {
    return { title: 'Bienvenue sur Talkio', message : this.appService.getHello() };
  }
}
