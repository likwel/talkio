import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TaskColumn } from './column.entity'; // Assurez-vous que TaskColumn est bien importée

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => TaskColumn, (column) => column.project)
  columns: TaskColumn[];
}
