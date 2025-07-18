#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs"
import { resolve, dirname, join } from "node:path"
import { parseArgs } from "node:util"
import { config, ls } from "@dotenvx/dotenvx"
import ts from "typescript"

export function generateDeclaration(envVars: Record<string, string>): string {
  const factory = ts.factory

  const properties = Object.keys(envVars).map((key) =>
    factory.createPropertySignature(
      undefined,
      factory.createIdentifier(key),
      undefined,
      factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
    )
  )

  const processEnvInterface = factory.createInterfaceDeclaration(
    undefined,
    factory.createIdentifier("ProcessEnv"),
    undefined,
    undefined,
    properties
  )

  const nodeJSNamespace = factory.createModuleDeclaration(
    undefined,
    factory.createIdentifier("NodeJS"),
    factory.createModuleBlock([processEnvInterface]),
    ts.NodeFlags.Namespace
  )

  ts.addSyntheticLeadingComment(
    nodeJSNamespace,
    ts.SyntaxKind.MultiLineCommentTrivia,
    `*
 * This file was autogenerated with "npx env.d.ts"
 * Manual edits are okay, but will be overwritten when you run this command.
 * Be sure to _include_ this file in your tsconfig.json
 `,
    true
  )

  const sourceFile = factory.createSourceFile(
    [nodeJSNamespace],
    factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  )

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  })

  const result = printer.printFile(sourceFile)

  // Convert 4-space indentation to 2-space
  return result.replace(/^( {4})+/gm, (match) => "  ".repeat(match.length / 4))
}

function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "out-dir": {
        type: "string",
        short: "o",
        default: ".",
      },
    },
    allowPositionals: true,
  })

  const outDir = (values["out-dir"] as string) || process.cwd()

  const files = positionals.length
    ? positionals
    : ls(process.cwd(), [".env.local", ".env"], [])

  if (files.length === 0) {
    console.error(
      "No environment files found. Please ensure .env or .env.local exists, or specify a file path."
    )
    process.exit(1)
  }

  const { parsed } = config({
    path: files,
    processEnv: {},
    quiet: true,
    ignore: ["MISSING_ENV_FILE"],
  })

  if (!parsed) {
    console.error("Unable to parse environment files")
    process.exit(1)
  }

  const declaration = generateDeclaration(parsed)
  const outputPath = resolve(join(outDir, "env.d.ts"))

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, declaration, "utf-8")
}

main()
