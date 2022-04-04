import { RedisOptions } from "ioredis";

interface RedisConfig extends RedisOptions {
    ttl?: number;
}

export interface CacheDecoratorModuleConfig {
    redis: RedisConfig;
    application: {
        name: string;
        version: string;
    };
    isGlobal?: boolean;
}
