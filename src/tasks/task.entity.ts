import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TaskColumn } from './column.entity';
import { User } from '../users/user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => TaskColumn, (column) => column.tasks, { onDelete: 'CASCADE' })
  column: TaskColumn;

  @ManyToOne(() => User, { nullable: true })
  assignedTo: User;
}
