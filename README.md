# deno-lint-plugin-extra-rules

[![JSR](https://jsr.io/badges/@uki00a/deno-lint-plugin-extra-rules)](https://jsr.io/@uki00a/deno-lint-plugin-extra-rules)
[![Build Status](https://github.com/uki00a/deno-lint-plugin-extra-rules/workflows/CI/badge.svg)](https://github.com/uki00a/deno-lint-plugin-extra-rules/actions)

An experimental `deno lint` plugin inspired by
[eslint-plugin-n](https://github.com/eslint-community/eslint-plugin-n).

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

|         Name         |                Description                |
| :------------------: | :---------------------------------------: |
|  `no-env-to-object`  | Disallow the use of `Deno.env.toObject()` |
| `no-test-sanitizers` |   Disallow the use of test sanitiziers    |
