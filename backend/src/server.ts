import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import senderRoutes from "./routes/sender.routes";
import emailRoutes from "./routes/email.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import healthRoutes from "./routes/health.routes";
import prisma from "./config/database";
import { redisConnection } from "./config/redis";
import { emailWorker } from "./workers/email.worker";
import { outboxService } from "./services/outbox.service";

export const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(helmet());

app.use("/api/auth", authRoutes);
app.use("/api/senders", senderRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/health", healthRoutes);

// Global Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API Error:", err?.stack || err?.message || err);
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

if (require.main === module) {
  const server = app.listen(port, async () => {
    console.log(`API server listening on port ${port}`);
    try {
      await outboxService.recoverAndPublish();
      console.log("Queue worker active and outbox recovered.");
    } catch (err) {
      console.error("Failed to boot outbox recovery", err);
    }
  });

  const shutdown = async () => {
    server.close();
    await Promise.allSettled([emailWorker.close(), prisma.$disconnect(), redisConnection.quit()]);
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
