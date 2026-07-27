import { Router } from "express";
import { senderController } from "../controllers/sender.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { createSenderSchema, updateSenderSchema } from "../validators/sender.validator";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createSenderSchema), senderController.createSender);
router.get("/", senderController.getSenders);
router.get("/:id", senderController.getSenderById);
router.put("/:id", validate(updateSenderSchema), senderController.updateSender);
router.delete("/:id", senderController.deleteSender);

export default router;
