import { AppDataSource } from "../config/database.js";
import User from "../entities/User.js";

const userRepository = AppDataSource.getRepository(User);
export default userRepository;
