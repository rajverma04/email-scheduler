import { redisConnection } from "../config/redis";

const RESERVE_SEND_PERMISSION = `
  local counterKey = KEYS[1]
  local throttleKey = KEYS[2]
  local limit = tonumber(ARGV[1])
  local now = tonumber(ARGV[2])
  local hourTtlMs = tonumber(ARGV[3])
  local hourEndMs = tonumber(ARGV[4])
  local minimumDelayMs = tonumber(ARGV[5])

  local current = tonumber(redis.call('get', counterKey) or '0')
  if current >= limit then
    return {0, hourEndMs}
  end

  local nextAllowedAt = tonumber(redis.call('get', throttleKey) or '0')
  if nextAllowedAt > now then
    return {0, nextAllowedAt}
  end

  local nextCount = redis.call('incr', counterKey)
  if nextCount == 1 then
    redis.call('pexpire', counterKey, hourTtlMs)
  end

  redis.call('set', throttleKey, now + minimumDelayMs, 'PX', minimumDelayMs + hourTtlMs)
  return {1, now}
`;

export type SendPermission =
  | { allowed: true }
  | { allowed: false; nextAvailableAt: number };

export class RateLimiterService {
  async reserveSendPermission(
    senderEmail: string,
    hourlyLimit: number,
    delayBetweenEmailsSeconds: number,
  ): Promise<SendPermission> {
    const now = Date.now();
    const hour = new Date(now);
    const hourKey = hour.toISOString().slice(0, 13);
    const hourEnd = Date.UTC(
      hour.getUTCFullYear(),
      hour.getUTCMonth(),
      hour.getUTCDate(),
      hour.getUTCHours() + 1,
      0,
      0,
      0,
    );
    const hourTtlMs = Math.max(1_000, hourEnd - now + 1_000);
    const senderKey = encodeURIComponent(senderEmail.toLowerCase());
    const result = (await redisConnection.eval(
      RESERVE_SEND_PERMISSION,
      2,
      `rate-limit:${senderKey}:${hourKey}`,
      `send-throttle:${senderKey}`,
      String(hourlyLimit),
      String(now),
      String(hourTtlMs),
      String(hourEnd),
      String(Math.max(1, delayBetweenEmailsSeconds) * 1_000),
    )) as [number, number | string];

    if (Number(result[0]) === 1) return { allowed: true };
    return { allowed: false, nextAvailableAt: Number(result[1]) };
  }
}

export const rateLimiterService = new RateLimiterService();
