import { defineConfig, loadEnv } from "vite";
import package_json from "./package.json";
//@ts-ignore
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const { dependencies } = package_json;

  function renderChunks(deps: Record<string, string>) {
    const chunks = {};
    Object.keys(deps).forEach((key) => {
      chunks[key] = [key];
    });
    return chunks;
  }

  return {
    plugins: [tsconfigPaths()],
    define: {
      "process.env": JSON.stringify(env),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            ...renderChunks(dependencies),
          },
        },
      },
    },
  };
});
