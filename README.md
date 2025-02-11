# deno-lint-plugin-extra-rules

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
