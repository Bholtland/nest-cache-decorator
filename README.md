# nest-cache-decorator

A custom Cache decorator for NestJS and Redis to simplify the process of caching methods.
NestJS supports caching Controller routes out of the box, but not caching on service methods or integrated clients.

## Get started

Add the decorator as a dependency to your project

`npm install -S nest-cache-decorator` or `yarn add -S nest-cache-decorator`.

Add the `CacheDecoratorModule` from `nest-cache-decorator` to the "imports: []" key of a module you want to expose the Redis connection to.
The easiest way is to add the CacheDecoratorModule to your `app.module.ts` like this:

```
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CacheDecoratorModule } from "nest-cache-decorator";

@Module({
    imports: [
        CacheDecoratorModule.forRoot({
            application: {
                version: "1.0",
                name: "my-application"
            },
            redis: {
                host: // your redis host env variable,
                port:  // your redis port env variable
            }
            isGlobal: true,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

```

You can now import the `Cache` decorator from `nest-cache-decorator` and add it to the class method of your choice like so:

```
@Cache()
public myCachedMethod() {
    // Your logic...
}
```

The cache decorator will automatically cache any objects or arrays that are being returned by your method. If the data exists in Redis, it will be returned without invoking the actual method.

## Options

CacheDecoratorModule supports the following options:

-   application
    -   version: The version of your application
    -   name: The name of your application
-   redis
    -   ... any options that are native to ioredis, like hostname and port.
-   isGlobal: defaults to 'false'. If true the module will be scoped as global.

The Cache decorator supports the following options:

-   ttl: Allows you to set the time to live on a per-method basis. Overrides the global TTL defined in CacheDecoratorModule's options.redis for this method.

## Under the hood

The cache decorator will make a key based on the application name, the class name and the method name that it is being used for. If your method has arguments of type string or number, these arguments will be added to the key to make it as unique as possible.
