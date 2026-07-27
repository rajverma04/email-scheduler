import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import { googleAuthSchema, emailAuthSchema } from "../validators/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/google", authController.googleAuthRedirect);
router.get("/google/callback", authController.googleAuthCallback);
router.post("/google", validate(googleAuthSchema), authController.googleAuth);

router.post("/login", validate(emailAuthSchema), authController.emailLogin);
router.post("/signup", validate(emailAuthSchema), authController.emailLogin);

router.get("/profile", requireAuth, authController.profile);
router.post("/logout", requireAuth, authController.logout);

export default router;
