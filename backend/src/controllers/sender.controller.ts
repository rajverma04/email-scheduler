import { Request, Response } from "express";
import { senderService } from "../services/sender.service";

export class SenderController {
  async createSender(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const sender = await senderService.createSender(userId, req.body);
      res.status(201).json(sender);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSenders(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const senders = await senderService.getSenders(userId);
      res.json(senders);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSenderById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const sender = await senderService.getSenderById(req.params.id as string, userId);
      res.json(sender);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateSender(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const sender = await senderService.updateSender(req.params.id as string, userId, req.body);
      res.json(sender);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteSender(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      await senderService.deleteSender(req.params.id as string, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const senderController = new SenderController();
