import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check Bearer header first, then fallback to cookie
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      (req as any).user = user;
      next();
    } catch (dbErr) {
      console.warn("Database lookup failed in requireAuth, attaching decoded JWT payload fallback:", dbErr);
      (req as any).user = { id: decoded.userId };
      next();
    }
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
