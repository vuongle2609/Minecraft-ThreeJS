import path from "path";
import { defineConfig } from "vite";
//@ts-ignore
import tsconfigPaths from "vite-tsconfig-paths";

import viteWasm from "vite-plugin-wasm";

// @see https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), viteWasm()],
});
