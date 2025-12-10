import { UserService } from "./../service/user.service";
import { body } from "express-validator";
import { Request, Response } from "express";
import { userRepository } from "../repositories/user.repository";
import { AuthService, IAuthService } from "../service/auth.service";
import { ApiResponse, LoginPayload } from "../types/auth.type";
import { User } from "../model/user";

export interface IAuthController {
  login: (
    req: Request,
    res: Response<ApiResponse<string>>
  ) => Promise<
    Response<
      ApiResponse<{
        token: string;
        user: User;
      }>
    >
  >;
  profile: (
    req: Request,
    res: Response
  ) => Promise<
    Response<
      ApiResponse<{
        message: string;
        user: User;
      }>
    >
  >;
}

export class AuthController implements IAuthController {
  private authService: IAuthService;

  constructor() {
    this.authService = new AuthService(new UserService(userRepository));
  }
  login = async (req: Request, res: Response) => {
    const payload: LoginPayload = req.body;
    const loginData = await this.authService.login(payload);

    return res.status(200).json({
      data: {
        user: loginData.user,
        token: loginData.token,
      },
      message: "login success",
      success: true,
    });
  };

  profile = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userService = new UserService(userRepository);
    const user = await userService.userFindById(userId!);
    if (!user) return res.status(404).json({ Messsage: "user not found" });
    return res.status(200).json({
      message: "fetch success",
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
      },
    });
  };

  register = async (req: Request, res: Response) => {
    const userService = new UserService(userRepository);

    const userExist = await userService.userFindByEmail(req.body.email);
    if (userExist)
      return res.status(400).json({ message: `user already exist` });

    const newUser = await userService.createUser(req.body);
    return res.status(201).json({
      message: `user create success`,
      user: newUser,
    });
  };
  changePassword = async (req: Request, res: Response) => {
    try {
      const { email, oldPassword, newPassword } = req.body;

      if (!email || !oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "email, oldPassword and newPassword are required" });
      }

      const userService = new UserService(userRepository);

      const userExist = await userService.userFindByEmail(req.body.email);
      if (!userExist)
        return res.status(400).json({ message: `user not found!` });

      const equalpassword = await userService.comparePassword(
        oldPassword,
        userExist.password
      );
      if (!equalpassword) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      await userService.changePassword({ email, newPassword, oldPassword });

      return res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
