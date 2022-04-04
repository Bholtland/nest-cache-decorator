import { DynamicModule, Global, Module } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { CryptoModule } from "../crypto/crypto.module";
import Redis from "ioredis";
import { CacheProviderName } from "./cache.provider";
import { CryptoProviderName } from "../crypto/crypto.provider";
import { CacheDecoratorModuleConfig } from "../config/cache-module.config";

@Global()
@Module({})
export class CacheDecoratorModule {
    static forRoot(config: CacheDecoratorModuleConfig): DynamicModule {
        return {
            global: config.isGlobal || false,
            imports: [CryptoModule],
            providers: [
                {
                    provide: CacheProviderName,
                    useFactory: () => {
                        return new Redis(config.redis);
                    },
                },
                {
                    provide: CacheService,
                    useFactory: (cache, crypto) =>
                        new CacheService(cache, crypto, config),
                    inject: [CacheProviderName, CryptoProviderName],
                },
            ],
            exports: [CacheService],
            module: CacheDecoratorModule,
        };
    }
}
