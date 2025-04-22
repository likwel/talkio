import { Entity, PrimaryGeneratedColumn, Column as Col, ManyToOne, OneToMany } from 'typeorm';
import { Project } from './project.entity';
import { Task } from './task.entity';

@Entity()
export class TaskColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Col()
  name: string;

  @ManyToOne(() => Project, (project) => project.columns, { onDelete: 'CASCADE' })
  project: Project;

  @OneToMany(() => Task, (task) => task.column)
  tasks: Task[];
}
