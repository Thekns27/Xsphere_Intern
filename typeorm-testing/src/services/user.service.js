import userRepository from "../repositories/user.repository.js";
import { ApiError } from "../utils/errors.js";

export class UserService {
  async create(name, email, password) {
    const exist = await userRepository.findOneBy({
      email,
    });

    if (exist) {
      throw ApiError.badRequest("Email already exit");
    }

    const user = userRepository.create({
      name,
      email,
      password,
    });
    const savedUser = await userRepository.save(user);
    return savedUser;
  }
}

export class EmailService {
  sendEmail(email) {
    console.log("email is sending to ", email);
  }
}
