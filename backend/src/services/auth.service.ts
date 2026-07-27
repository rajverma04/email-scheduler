import { userRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
}

export const authService = new AuthService();
