export type RateLimiter = {
  isAllowed: (key: string, tokenCost?: number) => boolean;
};
