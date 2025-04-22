import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Message } from './messages/message.entity';
import { Conversation } from './conversations/conversation.entity';
import { ConversationParticipant } from './conversations/conversation-participant.entity';
import { Task } from './tasks/task.entity';
import { TaskColumn } from './tasks/column.entity';
import { Project } from './tasks/project.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'talkio_com',
  synchronize: false,
  logging: false,
  entities: [
    User,
    Message,
    Conversation,
    ConversationParticipant,
    Task,
    TaskColumn,
    Project
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
