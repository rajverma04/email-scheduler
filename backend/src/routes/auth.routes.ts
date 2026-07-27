import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import { googleAuthSchema } from "../validators/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/google", authController.googleAuthRedirect);
router.get("/google/callback", authController.googleAuthCallback);
router.post("/google", validate(googleAuthSchema), authController.googleAuth);
router.get("/profile", requireAuth, authController.profile);
router.post("/logout", requireAuth, authController.logout);

export default router;
