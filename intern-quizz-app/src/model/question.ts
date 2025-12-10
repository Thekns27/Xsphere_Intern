import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Answer } from "./answer";

export enum QuestionType {
  BOOLEAN = "boolean",
  BLANK = "blank",
  CHOICES = "choices",
}

export interface correctAnswer {
  answer: string | boolean | string[];
}

@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; // 1 + 1 =

  @Column({
    type: "enum",
    enum: QuestionType,
    enumName: "answer_type",
  })
  questionType: QuestionType;

  @Column({
    type: "simple-json",
  })
  correctAnswer: correctAnswer;

  @Column({
    default: 0,
    type: "numeric",
  })
  score: number;

  @OneToMany(() => Answer, asnwer => asnwer.question)
  answers: Answer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
