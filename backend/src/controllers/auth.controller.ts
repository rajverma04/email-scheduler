import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export class AuthController {
  async googleAuth(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const result = await authService.authenticateGoogle(token);

      res.cookie("token", result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async emailLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginOrSignupWithEmail(email, password);

      res.cookie("token", result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async googleAuthRedirect(req: Request, res: Response) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (clientId && clientSecret) {
        const { OAuth2Client } = await import("google-auth-library");
        const redirectUri = `${process.env.BACKEND_URL || "http://localhost:3000"}/api/auth/google/callback`;
        const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

        const googleAuthUrl = oauth2Client.generateAuthUrl({
          access_type: "offline",
          scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
          ],
          prompt: "select_account",
        });

        return res.redirect(googleAuthUrl);
      }
      return res.status(503).json({ error: "Google OAuth is not configured" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async googleAuthCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${process.env.BACKEND_URL || "http://localhost:3000"}/api/auth/google/callback`;

      if (!code || !clientId || !clientSecret) {
        throw new Error("Missing OAuth code or credentials");
      }

      const { OAuth2Client } = await import("google-auth-library");
      const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.id_token) throw new Error("No id_token received from Google");

      const result = await authService.authenticateGoogle(tokens.id_token);
      res.cookie("token", result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/auth/callback?token=${result.sessionToken}`);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async profile(req: Request, res: Response) {
    res.json({ user: (req as any).user });
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.json({ success: true });
  }
}

export const authController = new AuthController();
