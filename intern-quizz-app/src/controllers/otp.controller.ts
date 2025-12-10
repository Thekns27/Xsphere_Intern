import { User } from "./../model/user";
import { UserService } from "./../service/user.service";
import { userRepository } from "./../repositories/user.repository";
import { resetPasswordPayload } from "./../types/auth.type";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/auth.type";
import {
  Email,
  IOTPService,
  OTPPayload,
  OTPService,
} from "../service/otp.service";
import { OTP } from "../model/otp";
import { otpRepository } from "../repositories/otp.repository";

export interface IOtpController {
  createOTP: (
    req: Request,
    res: Response
  ) => Promise<
    Response<
      ApiResponse<{
        message: string;
        data: OTP;
      }>
    >
  >;
  resetpassword: (
    req: Request,
    res: Response
  ) => Promise<
    Response<
      ApiResponse<{
        message: string;
        data: User;
      }>
    >
  >;
}

export class OtpController implements IOtpController {
  private otpService: IOTPService;
  private userService: UserService = new UserService(userRepository);
  constructor() {
    this.otpService = new OTPService(userRepository, otpRepository);
  }

  createOTP = async (req: Request, res: Response) => {
    const payload: Email = req.body;
    const existOtp = await this.otpService.checkOTPStatus(payload.email);
    if (existOtp?.isUsed === false) {
      return res.status(200).json({
        message: "OTP created",
        data: existOtp,
      });
    }
    const otpCreated = await this.otpService.createOTP(payload);
    return res.status(200).json({
      message: "OTP created",
      data: otpCreated,
    });
  };

  resetpassword = async (req: Request, res: Response) => {
    const payload: resetPasswordPayload = req.body;
    console.log(payload);
    const OTP = await this.otpService.checkOTPStatus(payload.email);
    console.log("OTP record:", OTP);
    if (!OTP) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    if (OTP.isUsed === true) {
      return res.status(400).json({
        message: "OTP already used",
      });
    }
    const now = new Date();
    console.log(now.getTime());
    console.log(OTP.expiresAt.getTime());

    if (OTP.expiresAt.getTime() < now.getTime()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const user = await this.userService.changePassword({
      email: payload.email,
      newPassword: payload.newPassword,
    });

    await otpRepository.save(OTP);
    const isUsedUpdate = await otpRepository.update(
      { email: payload.email },
      { isUsed: true }
    );
    return res.status(200).json({
      message: "Password reset successfully",
      data: user,
    });
  };
}
