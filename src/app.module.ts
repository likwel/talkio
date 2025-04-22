import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Conversation } from './conversations/conversation.entity';
import { ConversationParticipant } from './conversations/conversation-participant.entity';
import { Message } from './messages/message.entity';
import { ChatGateway } from './chat/chat.gateway';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/task.entity';
import { TaskColumn } from './tasks/column.entity';
import { Project } from './tasks/project.entity'; 
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersModule } from './users/users.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthAccessMiddleware } from './auth/auth-access.middleware';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // pour ne pas avoir à importer dans chaque module
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'talkio_com',
      synchronize: true, // 🚨 À désactiver en prod
      entities: [User,Task,TaskColumn,Project, Conversation, ConversationParticipant, Message],
    }),

    TypeOrmModule.forFeature([User, Task,TaskColumn,Project, Conversation, ConversationParticipant, Message]),

    TasksModule,

    AuthModule,

    UsersModule,

    ChatModule,

  ],
  controllers: [AppController, AuthController, ChatController],
  providers: [ AppService, ChatService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthAccessMiddleware)
      .forRoutes('*');
  }
}
