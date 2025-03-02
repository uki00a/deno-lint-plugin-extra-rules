import { createPlugin } from "./plugin.ts";

const plugin: Deno.lint.Plugin = createPlugin();
export default plugin;
export type { LintRules } from "./plugin.ts";
