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

  test("it handles requests with cost greater than 1", () => {
    const date = new Date();
    setSystemTime(date);

    const rateLimiter = createRateLimiter({
      capacity: 3,
      refillRatePerSecond: 1,
    });

    const key = "personalisedKey";

    expect(rateLimiter.isAllowed(key, 3)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeFalse();
  });

  test("refills the bucket slowly after a short period of time", () => {
    const date = new Date();
    setSystemTime(date);

    const rateLimiter = createRateLimiter({
      capacity: 3,
      refillRatePerSecond: 2,
    });

    const key = "personalisedKey";

    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeFalse();

    date.setSeconds(date.getSeconds() + 1);

    setSystemTime(date);
    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeFalse();
  });

  test("refills the bucket completely after a long period of time", () => {
    const date = new Date();
    setSystemTime(date);

    const rateLimiter = createRateLimiter({
      capacity: 3,
      refillRatePerSecond: 2,
    });

    const key = "personalisedKey";

    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeTrue();
    expect(rateLimiter.isAllowed(key)).toBeFalse();

    date.setMinutes(date.getMinutes() + 1);

    setSystemTime(date);
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
