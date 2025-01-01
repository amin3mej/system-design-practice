import type { RateLimiter } from "./rate-limiter.ts";

type Bucket = {
  lastRefillTime: number;
  tokens: number;
};

export const createRateLimiter = ({
  capacity,
  refillRatePerSecond,
}: {
  capacity: number;
  refillRatePerSecond: number;
}): RateLimiter => {
  const tokenBuckets: Record<string, Bucket> = {};

  const refill = (key: string) => {
    const now = Math.floor(Date.now() / 1000);

    const bucket = tokenBuckets[key] ?? { lastRefillTime: 0, tokens: 0 };
    const elapsedTimeInS = now - bucket?.lastRefillTime;
    const refill = Math.min(
      bucket?.tokens + elapsedTimeInS * refillRatePerSecond,
      capacity,
    );

    const newBucket: Bucket = {
      lastRefillTime: now,
      tokens: refill,
    };
    tokenBuckets[key] = newBucket;

    return newBucket;
  };

  return {
    isAllowed: (key: string, tokenCost: number = 1) => {
      const bucket = refill(key);

      if (bucket.tokens >= tokenCost) {
        tokenBuckets[key].tokens -= tokenCost;
        return true;
      } else {
        return false;
      }
    },
  };
};
