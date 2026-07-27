import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export class DashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const stats = await dashboardService.getStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRecent(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const recent = await dashboardService.getRecent(userId);
      res.json(recent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getFailed(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const failed = await dashboardService.getFailed(userId);
      res.json(failed);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getScheduled(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const scheduled = await dashboardService.getScheduled(userId);
      res.json(scheduled);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const dashboardController = new DashboardController();
