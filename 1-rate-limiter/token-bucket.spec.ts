import { describe, expect, setSystemTime, test } from "bun:test";

import { createRateLimiter } from "./token-bucket.ts";

describe("Token Bucket Rate limiter", () => {
  test("it creates a rate limiter", () => {
    const rateLimiter = createRateLimiter({
      capacity: 5,
      refillRatePerSecond: 1,
    });
    expect(rateLimiter).not.toBeNil();
  });

  test("it limits the request", () => {
    const date = new Date();
    setSystemTime(date);

    const rateLimiter = createRateLimiter({
      capacity: 3,
      refillRatePerSecond: 1,
    });

    const key = "personalisedKey";

    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeFalse();
  });

  test("it handles different keys properly", () => {
    const date = new Date();
    setSystemTime(date);

    const rateLimiter = createRateLimiter({
      capacity: 3,
      refillRatePerSecond: 1,
    });

    const firstKey = "personalisedKey";
    const secondKey = "anotherPersonalisedKey";

    rateLimiter.isAllowed(firstKey);
    rateLimiter.isAllowed(firstKey);
    rateLimiter.isAllowed(firstKey);
    rateLimiter.isAllowed(firstKey);
    rateLimiter.isAllowed(firstKey);
    rateLimiter.isAllowed(firstKey);

    expect(rateLimiter.isAllowed(secondKey)).toBeTrue();
  });
});
