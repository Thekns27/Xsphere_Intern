import { LoginPayload, TokenPayload } from "./auth.type";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      loginTime?: number;
    }
  }
}
