import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// @see https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  
});
