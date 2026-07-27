import dotenv from "dotenv";
dotenv.config();

import { emailWorker } from "./workers/email.worker";
import { outboxService } from "./services/outbox.service";

async function bootstrap() {
  await outboxService.recoverAndPublish();
  console.log("Worker process started...");
}

bootstrap().catch(async (error) => {
  console.error("Worker startup failed", error);
  await emailWorker.close();
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("Closing worker...");
  await emailWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Closing worker...");
  await emailWorker.close();
  process.exit(0);
});
