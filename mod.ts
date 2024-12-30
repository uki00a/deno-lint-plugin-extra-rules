import { createPlugin } from "./plugin.ts";
// deno-lint-ignore no-console
const plugin = createPlugin({
  onError: console.error,
});
export default plugin;
