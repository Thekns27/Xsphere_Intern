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

@Entity("otps")
export class OTP {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column("numeric")
  otp: number;

  @Column()
  expiresAt: Date;

  @Column({
    type: "boolean",
    default: false,
  })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
