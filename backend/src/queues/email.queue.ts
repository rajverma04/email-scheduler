import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";
import { QUEUE_NAMES } from "./queue.constants";

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 1000,
    removeOnFail: 1000,
  },
});
