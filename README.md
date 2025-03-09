# deno-lint-plugin-extra-rules

[![JSR](https://jsr.io/badges/@uki00a/deno-lint-plugin-extra-rules)](https://jsr.io/@uki00a/deno-lint-plugin-extra-rules)
[![Build Status](https://github.com/uki00a/deno-lint-plugin-extra-rules/workflows/CI/badge.svg)](https://github.com/uki00a/deno-lint-plugin-extra-rules/actions)

An experimental `deno lint` plugin inspired by
[eslint-plugin-n](https://github.com/eslint-community/eslint-plugin-n) and
[eslint-plugin-jest](https://github.com/jest-community/eslint-plugin-jest).

## Usage

Add the following to `deno.json`:

```jsonc
{
  "lint": {
    // NOTE: Replace `$VERSION` with the latest version
    "plugins": ["jsr:@uki00a/deno-lint-plugin-extra-rules@$VERSION"]
  }
}
```

## Rules

|            Name             |                             Description                              |
| :-------------------------: | :------------------------------------------------------------------: |
|     `no-env-to-object`      |              Disallows the use of `Deno.env.toObject()`              |
|          `no-exit`          |                  Disallows the use of `Deno.exit()`                  |
|  `require-test-sanitizers`  |                 Disallows disabling test sanitiziers                 |
| `prefer-node-assert-strict` | Encourages the use of `node:assert/strict` rather than `node:assert` |
|       `valid-expect`        |               Disallows the use of invalid `expect()`                |
