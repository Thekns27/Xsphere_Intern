import { TypeORMError } from "typeorm";
import { EmailService, UserService } from "../services/user.service.js";
import { ApiError } from "../utils/errors.js";
import { apiSuccess } from "../utils/response.js";

const userService = new UserService();
const emailService = new EmailService();

export async function createUser(req, res, next) {
  // console.log(req.req)
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw ApiError.badRequest("Please provide require fields");
    }

    const user = await userService.create(name, email, password);
    if (user) {
      emailService.sendEmail(user.email);
    }
    return apiSuccess(res, 201, "user sucessfully created!", user);
    // user class's create methods calling -> user entity (name,email,password)
    // util class's sendEmail emthods calling ->
  } catch (error) {
    next(error);
  }
}
