import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
} from "typeorm";
import { correctAnswer, Question } from "./question";
import { User } from "./user";

export enum answerType {
  BOOLEAN = "boolean",
  BLANK = "blank",
  CHOICES = "choices",
}

@Entity("answers")
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: answerType,
  })
  answerType: answerType;

  @Column({
    type: "simple-json",
  })
  answer: correctAnswer;

  @Column("boolean")
  isCorrect: boolean;

  @Column({
    default: 0,
    type: "numeric",
  })
  score: number;

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;

  @ManyToOne(() => User, (user) => user.answers)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
