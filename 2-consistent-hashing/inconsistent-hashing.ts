import { createHash } from "crypto";

const hash = (str: string): number => {
  const hash = createHash("sha1").update(str).digest("hex");
  return parseInt(hash.slice(0, 8), 16);
};

export const createHashingFunction = (initialServers: string[]) => {
  let servers = initialServers;
  return {
    addServer: (server: string) => {
      servers.push(server);
    },
    removeServer: (server: string) => {
      servers = servers.filter((k) => k !== server);
    },
    findServer: (id: string) => {
      const index = Math.abs(hash(id) % servers.length);
      return servers[index];
    },
  };
};
