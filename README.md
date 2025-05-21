# deno-lint-plugin-extra-rules

[![JSR](https://jsr.io/badges/@uki00a/deno-lint-plugin-extra-rules)](https://jsr.io/@uki00a/deno-lint-plugin-extra-rules)
[![Build Status](https://github.com/uki00a/deno-lint-plugin-extra-rules/workflows/CI/badge.svg)](https://github.com/uki00a/deno-lint-plugin-extra-rules/actions)

A `deno lint` plugin for Deno's built-in APIs and
[std](https://github.com/denoland/std). Heavily inspired by
[eslint-plugin-n](https://github.com/eslint-community/eslint-plugin-n),
[eslint-plugin-jest](https://github.com/jest-community/eslint-plugin-jest), and
[eslint-plugin-eslint-comments](https://github.com/eslint-community/eslint-plugin-eslint-comments).

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

See
[`LintRules`](https://jsr.io/@uki00a/deno-lint-plugin-extra-rules/doc/~/LintRules).
