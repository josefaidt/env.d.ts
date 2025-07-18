# env.d.ts

Getting tired of looking up how to strongly type environment variables you know will exist just so you can get rid of `string | undefined`? Tired of visiting https://www.totaltypescript.com/how-to-strongly-type-process-env for the thousandth time?

Run this handy little tool to quickly generate a declaration file for your env vars!

```bash
npx env.d.ts
```

When your `.env` file looks like this

```ini
HELLO=world
```

You'll get this `env.d.ts` file

```ts
/**
 * This file was autogenerated with "npx env.d.ts"
 * Manual edits are okay, but will be overwritten when you run this command.
 * Be sure to _include_ this file in your tsconfig.json
 */
namespace NodeJS {
  interface ProcessEnv {
    HELLO: string
  }
}
```

The tool will look for `.env` and `.env.local` by default, but you can give it other files

```bash
npx env.d.ts .env.development
```

`env.d.ts` gets generated in your current working directory, however you can specify an out directory

```bash
npx env.d.ts --out-dir src
# or
npx env.d.ts -o src
```

## Disclaimer

This tool doesn't do much and isn't intended to become a replacement for other dotenv tools. It is simply a means to an end when working in a new project. You may want to omit certain environment variables you have in your dotenv files that you know you won't be explicitly using in code, like `AWS_PROFILE`, or you may want to decorate keys with descriptions of when/how to use them. Use this tool to generate it the first time and clean it up or maintain how you see fit.
