import { Router } from "express";
import { emailController } from "../controllers/email.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { scheduleEmailSchema } from "../validators/email.validator";

const router = Router();

router.use(requireAuth);

router.get("/", emailController.getEmails);
router.get("/:id", emailController.getEmailById);
router.post("/schedule", validate(scheduleEmailSchema), emailController.scheduleEmail);
router.post("/:id/retry", emailController.retryEmail);
router.post("/:id/cancel", emailController.cancelEmail);

export default router;
