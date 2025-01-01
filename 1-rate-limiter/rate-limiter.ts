export type RateLimiter = {
  isAllowed: (key: string) => boolean;
};
