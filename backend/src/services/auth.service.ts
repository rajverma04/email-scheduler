import { userRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import prisma from "../config/database";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export class AuthService {
  async authenticateGoogle(token: string) {
    let googleId: string;
    let email: string;
    let name: string;
    let avatar: string | null | undefined;
    if (!process.env.GOOGLE_CLIENT_ID) throw new Error("Google OAuth is not configured");

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) throw new Error("Google did not return a valid user profile");
    googleId = payload.sub;
    email = payload.email;
    name = payload.name || email;
    avatar = payload.picture;

    const user = await userRepository.upsertGoogleUser({ googleId, email, name, avatar });

    const sessionToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return { user, sessionToken };
  }

  async loginOrSignupWithEmail(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    let user = await userRepository.findByEmail(normalizedEmail);

    if (user) {
      if (user.password) {
        const isValid = verifyPassword(password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }
      } else {
        const hashedPassword = hashPassword(password);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
      }
    } else {
      const name = normalizedEmail.split("@")[0] || "User";
      const hashedPassword = hashPassword(password);
      user = await userRepository.create({
        email: normalizedEmail,
        name,
        password: hashedPassword,
      });
    }

    const sessionToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return { user, sessionToken };
  }
}

export const authService = new AuthService();
