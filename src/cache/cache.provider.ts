import Redis from "ioredis";

export const CacheProviderName = "lib:ioredis";
export type CacheProvider = typeof Redis;
