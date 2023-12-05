import { defineConfig } from "vite";
//@ts-ignore
import tsconfigPaths from "vite-tsconfig-paths";


// @see https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
});
