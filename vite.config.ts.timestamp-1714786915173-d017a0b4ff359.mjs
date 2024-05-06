// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/pj/Minecraft/node_modules/vite/dist/node/index.js";

// package.json
var package_default = {
  name: "threejs_boilerplate",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: {
    dev: "vite",
    build: "tsc && vite build",
    preview: "vite preview"
  },
  dependencies: {
    "dat.gui": "^0.7.9",
    "date-fns": "^3.0.6",
    "fastnoise-lite": "^1.1.1",
    "stats.js": "^0.17.0",
    uuid: "^9.0.1"
  },
  devDependencies: {
    "@types/dat.gui": "^0.7.7",
    "@types/node": "^20.9.3",
    "@types/three": "^0.158.3",
    "@types/uuid": "^9.0.8",
    autoprefixer: "^10.4.16",
    path: "^0.12.7",
    postcss: "^8.4.31",
    tailwindcss: "^3.3.5",
    three: "^0.158.0",
    typescript: "^4.6.4",
    vite: "5.0.5",
    "vite-tsconfig-paths": "^4.2.1"
  }
};

// vite.config.ts
import tsconfigPaths from "file:///D:/pj/Minecraft/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const { dependencies } = package_default;
  function renderChunks(deps) {
    const chunks = {};
    Object.keys(deps).forEach((key) => {
      chunks[key] = [key];
    });
    return chunks;
  }
  return {
    plugins: [tsconfigPaths()],
    define: {
      "process.env": JSON.stringify(env)
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            ...renderChunks(dependencies)
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxccGpcXFxcTWluZWNyYWZ0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxwalxcXFxNaW5lY3JhZnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3BqL01pbmVjcmFmdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCBwYWNrYWdlX2pzb24gZnJvbSBcIi4vcGFja2FnZS5qc29uXCI7XHJcbi8vQHRzLWlnbm9yZVxyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSk7XHJcblxyXG4gIGNvbnN0IHsgZGVwZW5kZW5jaWVzIH0gPSBwYWNrYWdlX2pzb247XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlckNodW5rcyhkZXBzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XHJcbiAgICBjb25zdCBjaHVua3MgPSB7fTtcclxuICAgIE9iamVjdC5rZXlzKGRlcHMpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICBjaHVua3Nba2V5XSA9IFtrZXldO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY2h1bmtzO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHBsdWdpbnM6IFt0c2NvbmZpZ1BhdGhzKCldLFxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgIFwicHJvY2Vzcy5lbnZcIjogSlNPTi5zdHJpbmdpZnkoZW52KSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgICAgLi4ucmVuZGVyQ2h1bmtzKGRlcGVuZGVuY2llcyksXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG4iLCAie1xyXG4gIFwibmFtZVwiOiBcInRocmVlanNfYm9pbGVycGxhdGVcIixcclxuICBcInByaXZhdGVcIjogdHJ1ZSxcclxuICBcInZlcnNpb25cIjogXCIwLjAuMFwiLFxyXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxyXG4gIFwic2NyaXB0c1wiOiB7XHJcbiAgICBcImRldlwiOiBcInZpdGVcIixcclxuICAgIFwiYnVpbGRcIjogXCJ0c2MgJiYgdml0ZSBidWlsZFwiLFxyXG4gICAgXCJwcmV2aWV3XCI6IFwidml0ZSBwcmV2aWV3XCJcclxuICB9LFxyXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiZGF0Lmd1aVwiOiBcIl4wLjcuOVwiLFxyXG4gICAgXCJkYXRlLWZuc1wiOiBcIl4zLjAuNlwiLFxyXG4gICAgXCJmYXN0bm9pc2UtbGl0ZVwiOiBcIl4xLjEuMVwiLFxyXG4gICAgXCJzdGF0cy5qc1wiOiBcIl4wLjE3LjBcIixcclxuICAgIFwidXVpZFwiOiBcIl45LjAuMVwiXHJcbiAgfSxcclxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XHJcbiAgICBcIkB0eXBlcy9kYXQuZ3VpXCI6IFwiXjAuNy43XCIsXHJcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwiXjIwLjkuM1wiLFxyXG4gICAgXCJAdHlwZXMvdGhyZWVcIjogXCJeMC4xNTguM1wiLFxyXG4gICAgXCJAdHlwZXMvdXVpZFwiOiBcIl45LjAuOFwiLFxyXG4gICAgXCJhdXRvcHJlZml4ZXJcIjogXCJeMTAuNC4xNlwiLFxyXG4gICAgXCJwYXRoXCI6IFwiXjAuMTIuN1wiLFxyXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC4zMVwiLFxyXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl4zLjMuNVwiLFxyXG4gICAgXCJ0aHJlZVwiOiBcIl4wLjE1OC4wXCIsXHJcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNC42LjRcIixcclxuICAgIFwidml0ZVwiOiBcIjUuMC41XCIsXHJcbiAgICBcInZpdGUtdHNjb25maWctcGF0aHNcIjogXCJeNC4yLjFcIlxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFPLFNBQVMsY0FBYyxlQUFlOzs7QUNBM1E7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLFNBQVc7QUFBQSxFQUNYLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxJQUNULEtBQU87QUFBQSxJQUNQLE9BQVM7QUFBQSxJQUNULFNBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQSxjQUFnQjtBQUFBLElBQ2QsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osa0JBQWtCO0FBQUEsSUFDbEIsWUFBWTtBQUFBLElBQ1osTUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLGlCQUFtQjtBQUFBLElBQ2pCLGtCQUFrQjtBQUFBLElBQ2xCLGVBQWU7QUFBQSxJQUNmLGdCQUFnQjtBQUFBLElBQ2hCLGVBQWU7QUFBQSxJQUNmLGNBQWdCO0FBQUEsSUFDaEIsTUFBUTtBQUFBLElBQ1IsU0FBVztBQUFBLElBQ1gsYUFBZTtBQUFBLElBQ2YsT0FBUztBQUFBLElBQ1QsWUFBYztBQUFBLElBQ2QsTUFBUTtBQUFBLElBQ1IsdUJBQXVCO0FBQUEsRUFDekI7QUFDRjs7O0FENUJBLE9BQU8sbUJBQW1CO0FBRzFCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFFdkMsUUFBTSxFQUFFLGFBQWEsSUFBSTtBQUV6QixXQUFTLGFBQWEsTUFBOEI7QUFDbEQsVUFBTSxTQUFTLENBQUM7QUFDaEIsV0FBTyxLQUFLLElBQUksRUFBRSxRQUFRLENBQUMsUUFBUTtBQUNqQyxhQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUc7QUFBQSxJQUNwQixDQUFDO0FBQ0QsV0FBTztBQUFBLEVBQ1Q7QUFFQSxTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsY0FBYyxDQUFDO0FBQUEsSUFDekIsUUFBUTtBQUFBLE1BQ04sZUFBZSxLQUFLLFVBQVUsR0FBRztBQUFBLElBQ25DO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixjQUFjO0FBQUEsWUFDWixHQUFHLGFBQWEsWUFBWTtBQUFBLFVBQzlCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
