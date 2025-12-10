import { resetPasswordPayload } from "./../types/auth.type";
import { Repository } from "typeorm";
import { OTP } from "../model/otp";
import { UserService } from "./user.service";
import { User } from "../model/user";
import { AppError } from "../error-codes/app.error";
import { ErrorCodes } from "../error-codes/auth.error";

export interface Email {
  email: string;
}

export interface OTPPayload {
  email: Email;
  otp: Number;
  expireAt: Date;
}

export interface IOTPService {
  createOTP: (payload: Email) => Promise<OTP>;
  checkOTPStatus: (email: string) => Promise<OTP | null>;
}

export class OTPService extends UserService implements IOTPService {
  constructor(
    userRepository: Repository<User>,
    private otpRepository: Repository<OTP>
  ) {
    super(userRepository);
  }

  async createOTP(payload: Email): Promise<OTP> {
    const emailExist = await this.userFindByEmail(payload.email);
    if (!emailExist) {
      throw new AppError("User not found", ErrorCodes.AUTH_INVALID_USER, 404);
    }
    function generateOTP() {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const min = Date.now() + 3 * 60 * 1000;
      const expireAt = new Date(min);
      return { otp, expireAt };
    }
    const otp = generateOTP();

    const OTPcreate = await this.otpRepository.upsert(
      {
        email: emailExist.email,
        otp: otp.otp,
        expiresAt: otp.expireAt,
        isUsed: false,
      },
      ["email"]
    );

    return await this.otpRepository.findOneByOrFail({ email: payload.email });
  }

  async checkOTPStatus(email: string) {
    return this.otpRepository.findOneBy({
      email,
    });
  }
}
