import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else {
      // Fallback to Bearer header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
