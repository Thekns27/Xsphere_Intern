import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  OneToMany,
} from "typeorm";
import { Answer } from "./answer";

export interface UserProfile {
  dateOfBirth: Date;
  phone: string;
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({
    unique: true,
  })
  email: string;

  @OneToMany(() => Answer, a => a.user)
  answers: Answer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
