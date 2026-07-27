import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/stats", dashboardController.getStats);
router.get("/recent", dashboardController.getRecent);
router.get("/failed", dashboardController.getFailed);
router.get("/scheduled", dashboardController.getScheduled);

export default router;
