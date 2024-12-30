import { createPlugin } from "./plugin.ts";

const plugin = createPlugin({
  // deno-lint-ignore no-console
  onError: console.error,
});
export default plugin;
