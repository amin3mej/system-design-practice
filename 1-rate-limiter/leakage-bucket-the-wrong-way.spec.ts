import { describe, expect, mock, test } from "bun:test";

import { createThrottleBasedLeakageBucketRateLimiter } from "./leakage-bucket-the-wrong-way.ts";

const mockedSetInterval = mock();
mock.module("node:timers", () => ({
  setInterval: mockedSetInterval,
}));

describe("Leakage Bucket Rate limiter - the wrong way", () => {
  test("it creates a rate limiter", () => {
    const rateLimiter = createThrottleBasedLeakageBucketRateLimiter({
      capacity: 5,
      outflowRatePerSecond: 1,
    });
    expect(rateLimiter).not.toBeNil();
  });
});
