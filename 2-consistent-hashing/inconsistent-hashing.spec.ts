import { describe, expect, test } from "bun:test";

import { createHashingFunction } from "./inconsistent-hashing.ts";

describe("Inconsistent Hashing", () => {
  const servers = Array.from({ length: 10 }, (_, i) => `server${i + 1}`);
  const requests = Array.from({ length: 1000 }, (_, i) => `request${i}`);

  const calculateServerUsage = (pool: string[]) =>
    pool.reduce(
      (acc, server) => {
        acc[server] = (acc[server] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  test("it distributes the requests fairly good", () => {
    const hashingFunction = createHashingFunction(servers);

    const pool = requests.map((request) => hashingFunction.findServer(request));

    const serverUsage = calculateServerUsage(pool);
    console.log({ serverUsage });

    expect(Object.values(serverUsage).every((v) => v > 60)).toBe(true);
  });

  test("it adds a server and most of the data will redistribute", () => {
    const hashingFunction = createHashingFunction(servers);

    const poolBeforeAddingNewServer = requests.reduce(
      (acc, request) => {
        acc[request] = hashingFunction.findServer(request);
        return acc;
      },
      <Record<string, string>>{},
    );

    const serverUsageBeforeAddingNewServer = calculateServerUsage(
      Object.values(poolBeforeAddingNewServer),
    );
    console.log({ serverUsageBeforeAddingNewServer });

    hashingFunction.addServer("servernew");
    const poolAfterAddingNewServer = requests.reduce(
      (acc, request) => {
        acc[request] = hashingFunction.findServer(request);
        return acc;
      },
      <Record<string, string>>{},
    );

    const serverUsageAfterAddingNewServer = calculateServerUsage(
      Object.values(poolBeforeAddingNewServer),
    );
    console.log({ serverUsageAfterAddingNewServer });

    let redistributedRequestsCount = 0;
    for (const request of requests) {
      if (
        poolBeforeAddingNewServer[request] !== poolAfterAddingNewServer[request]
      ) {
        redistributedRequestsCount++;
      }
    }

    expect(redistributedRequestsCount).toBeGreaterThan(800);
  });

  test("it removes a server and most of the data will redistribute", () => {
    const hashingFunction = createHashingFunction(servers);

    const poolBeforeRemovingNewServer = requests.reduce(
      (acc, request) => {
        acc[request] = hashingFunction.findServer(request);
        return acc;
      },
      <Record<string, string>>{},
    );

    const serverUsageBeforeRemovingNewServer = calculateServerUsage(
      Object.values(poolBeforeRemovingNewServer),
    );
    console.log({ serverUsageBeforeRemovingNewServer });

    hashingFunction.removeServer(servers[0]);
    const poolAfterRemovingNewServer = requests.reduce(
      (acc, request) => {
        acc[request] = hashingFunction.findServer(request);
        return acc;
      },
      <Record<string, string>>{},
    );

    const serverUsageAfterRemovingNewServer = calculateServerUsage(
      Object.values(poolBeforeRemovingNewServer),
    );
    console.log({ serverUsageAfterRemovingNewServer });

    let redistributedRequestsCount = 0;
    for (const request of requests) {
      if (
        poolBeforeRemovingNewServer[request] !==
        poolAfterRemovingNewServer[request]
      ) {
        redistributedRequestsCount++;
      }
    }

    expect(redistributedRequestsCount).toBeGreaterThan(800);
  });
});
