import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ status: "OK", service: "api", timestamp: new Date().toISOString() });
});

router.get("/worker", (req: Request, res: Response) => {
  res.json({ status: "OK", service: "worker_metrics", timestamp: new Date().toISOString() });
});

export default router;
