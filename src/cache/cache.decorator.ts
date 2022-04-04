import { Inject } from "@nestjs/common";
import { CacheService } from "./cache.service";
/**
 * Usage:
 * Simply add the "@Cache" decorator above the method of your choice and if the response of the method is an object/array, it will be cached for future use.
 */

function toKebabCase(input: string) {
    return input
        .match(/([A-Z0-9]+[a-z]*)/g)
        .join("-")
        .toLowerCase();
}

export function Cache(options?: { ttl?: number }) {
    const redisInjection = Inject(CacheService);

    return function (
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        redisInjection(target, "cacheService");
        const method = descriptor.value;

        descriptor.value = async function (...args) {
            const { cacheService }: { cacheService: CacheService } = this;

            // Class name of the invoked method
            const origin = toKebabCase(target.constructor.name);
            // Name of the invoked method
            const action = toKebabCase(propertyKey);

            // Combines all arguments with type string and number to a unique string. If for instance you have a method 'getByPostalcodeHouseNumber(postalcode: string, houseNumber: number) the unique key would become for instance: 1054XZ-26'. This is used to cache that specific request.

            // If no arguments are provided in the method. For instance 'getAll()'. The response for that method should always be the same. Therefore the value of 'key' will be '*'.

            const key: string = args.length
                ? args.reduce((acc, val) => {
                      if (["string", "number"].includes(typeof val)) {
                          acc += `-${val}`;
                      }
                      return acc;
                  })
                : "*";

            const existingCache = await cacheService.get(origin, action, key);
            if (existingCache) {
                return JSON.parse(existingCache);
            }

            const methodResponse = await method.call(this, ...args);

            if (typeof methodResponse === "object") {
                await cacheService.set(
                    key,
                    action,
                    origin,
                    JSON.stringify(methodResponse),
                    options.ttl
                );
            }

            return methodResponse;
        };
    };
}

//
