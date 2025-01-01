import { setInterval } from "node:timers";

import type { RateLimiter } from "./rate-limiter.ts";

type Bucket = {
  queue: (() => void)[];
};

export const createThrottleBasedLeakageBucketRateLimiter = ({
  capacity,
  outflowRatePerSecond,
}: {
  capacity: number;
  outflowRatePerSecond: number;
}): RateLimiter => {
  const buckets: Record<string, Bucket> = {};

  const leak = async () => {
    for (const key in buckets) {
      const bucket = buckets[key];

      const items = bucket.queue.slice(0, outflowRatePerSecond);
      items.map((item) => item());

      buckets[key].queue = bucket.queue.slice(outflowRatePerSecond);
      if (buckets[key].queue.length === 0) {
        delete buckets[key];
      }
    }
  };

  const pushToQueue = (key: string, resolve: (_: unknown) => void) => {
    const queue = [...(buckets[key]?.queue ?? []), () => resolve(true)];
    buckets[key] = {
      queue,
    };
  };

  setInterval(async () => {
    await leak();
  }, 1000);

  return {
    isAllowed: async (key: string, requestSize: number = 1) => {
      if (requestSize > 1) throw new Error("Not implemented");

      if ((buckets[key]?.queue.length ?? 0) + requestSize <= capacity) {
        await new Promise((resolve) => {
          pushToQueue(key, resolve);
        });

        return true;
      } else {
        return false;
      }
    },
  };
};
