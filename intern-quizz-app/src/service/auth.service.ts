//import { otpRepository, userRepository } from './../repositories/user.repository';
import { AppError } from "../error-codes/app.error";
import { User } from "../model/user";
import {
  LoginPayload,
  resetPasswordPayload,
  TokenPayload,
} from "../types/auth.type";
import { IUserService } from "./user.service";
import jwt from "jsonwebtoken";

export interface IAuthService {
  login: (payload: LoginPayload) => Promise<{
    token: string;
    user: User;
  }>;
  generateToken: (payload: TokenPayload) => string;
}

export class AuthService implements IAuthService {
  constructor(private userService: IUserService) {}

  async login(payload: LoginPayload) {
    const user = await this.userService.userFindByEmail(payload.email);

    if (!user) throw new AppError("user not found", "AUTH_INVALID_USER", 404);

    if (user.password !== payload.password) {
      throw new AppError("incorrect ", "AUTH_INVALID_USER", 400);
    }
    const token = this.generateToken({
      email: user.email,
      id: user.id,
    });
    return {
      token,
      user: user,
    };
  }

  generateToken = (user: TokenPayload): string => {
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      "123"
    );
    return token;
  };
}
