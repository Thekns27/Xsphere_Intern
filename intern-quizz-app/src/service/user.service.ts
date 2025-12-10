import { userRepository } from "./../repositories/user.repository";
import { Repository, UpdateResult } from "typeorm";
import { User } from "../model/user";
import { resetPasswordPayload } from "../types/auth.type";
import { promises } from "dns";
import { response } from "express";
import { AppError } from "../error-codes/app.error";

interface createUserPayload {
  username: string;
  email: string;
  password: string;
}

interface passwordPayload {
  email: string;
  newPassword: string;
  oldPassword?: string;
}

export interface IUserService {
  userFindByEmail: (email: string) => Promise<User | null>;
  userFindById: (id: number) => Promise<User | null>;
  createUser: (payload: createUserPayload) => Promise<User>;
  changePassword: (udpayload: passwordPayload) => Promise<User>;
  comparePassword: (oldPassword: string, newPassword: string) => Promise<User>;
}

export class UserService implements IUserService {
  constructor(private userRepository: Repository<User>) {
    // default value
  }
  userFindByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }
  userFindById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async createUser(payload: createUserPayload) {
    const newUser = this.userRepository.create({
      email: payload.email,
      password: payload.password,
      username: payload.username,
    });
    const user = await this.userRepository.save(newUser);
    return user;
  }

  async comparePassword(oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOneBy({ password: oldPassword });
    if (!user) throw new AppError("msg", "AUTH_INVALID_USER", 401);

    return this.userRepository.save(user);
  }
  async changePassword(udpayload: passwordPayload) {
    const userToUpdate = await this.userRepository.findOne({
      where: { email: udpayload.email },
    });

    if (!userToUpdate) {
      throw new Error("User not found after update");
    }
    userToUpdate.password = udpayload.newPassword;

    console.log("User updated successfully!");
    const update = await userRepository.save(userToUpdate);
    console.log(update);
    return update;
  }
}
