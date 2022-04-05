import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import Crypto from "crypto";
import { CacheProviderName } from "./cache.provider";
import { CryptoProviderName } from "../crypto/crypto.provider";
import { CacheDecoratorModuleConfig } from "../config/cache-module.config";

@Injectable()
export class CacheService {
    protected defaultTtl = 60 * 60 * 24; // Cache for 24 hours

    constructor(
        @Inject(CacheProviderName) protected cache: Redis,
        @Inject(CryptoProviderName) protected crypto: typeof Crypto,
        protected config: CacheDecoratorModuleConfig
    ) {}

    public async deleteByAction(origin: string, action: string) {
        const key = this.makeRedisKey(origin, action);

        const keys = await this.cache.keys(key);
        if (keys.length > 0) {
            await this.cache.del(...keys);
        }
        return true;
    }

    public async delete(origin: string, action: string, identifier: string) {
        const hash = this.makeRedisKey(origin, action, identifier);
        await this.cache.del(hash);
        return true;
    }

    protected hashIdentifier(identifier: string) {
        return this.crypto
            .createHash("sha1")
            .update(identifier)
            .digest("base64");
    }

    protected makeRedisKey(
        origin: string,
        action: string,
        identifier?: string
    ) {
        return `${this.config.application.name}-${
            this.config.application.version
        }|${origin}|${action}:${
            identifier
                ? this.hashIdentifier(identifier)
                : this.hashIdentifier("*")
        }`;
    }

    public async get(origin: string, action: string, identifier: string) {
        const hash = this.makeRedisKey(origin, action, identifier);
        const data = await this.cache.get(hash);
        // tslint:disable-next-line:strict-type-predicates
        return data !== null && data.length > 2 ? data : false;
    }

    public async set(
        identifier: string,
        action: string,
        origin: string,
        data: Buffer | string,
        exp?: number
    ) {
        const hash = this.makeRedisKey(origin, action, identifier);
        const setData = await this.cache.set(
            hash,
            data,
            "EX",
            exp || this.config.redis.ttl || this.defaultTtl
        );
        return setData?.length && setData.length > 0;
    }
}
