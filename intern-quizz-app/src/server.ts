import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import { authenticate, authorize } from "./middleware/auth";
import { AppDataSource } from "./config/database";
import { userRepository } from "./repositories/user.repository";
import "./types/global-type";
import { UserService } from "./service/user.service";
import authRouter from "./routes/auth.route";
import { AppError } from "./error-codes/app.error";

// Initialize Express app
const app = express();
const PORT = 5002;

// Middleware
app.use(json());

app.get("/api/users", async (req, res) => {
  const users = await userRepository.findOneBy({ id: 12 });
  return res.json(users);
});
app.use("/api/auth", authRouter);

app.get(
  "/api/profile",
  authenticate,
  authorize(["user"]),
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userService = new UserService(userRepository);
    const user = await userService.userFindById(userId!);
    if (!user) return res.json({ message: `user not found` }).status(404);
    return res.json({ message: `fetch success`, user }).status(200);
  }
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
});

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("DB init error", err);
    process.exit(1);
  });
