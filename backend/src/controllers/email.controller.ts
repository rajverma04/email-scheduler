import { Request, Response } from "express";
import { emailService } from "../services/email.service";

export class EmailController {
  async scheduleEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await emailService.scheduleEmails(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEmails(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await emailService.getEmails(userId, { page, limit, search, status });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEmailById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await emailService.getEmailById(userId, req.params.id as string);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async retryEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await emailService.retryEmail(userId, req.params.id as string);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await emailService.cancelEmail(userId, req.params.id as string);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const emailController = new EmailController();
