import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: "src",
      tsconfigPath: "./tsconfig.app.json",
      outDir: "dist",
      insertTypesEntry: true,
      copyDtsFiles: true
    })
  ],
  // Disable copying of the public/ folder for library distribution
  publicDir: false,
  build: {
  sourcemap: true,
  cssCodeSplit: false, // ship a single CSS bundle for library consumers
  minify: 'esbuild',
    lib: {
      entry: "src/index.ts",
      name: "UlContextInspector",
      fileName: (format) => `ul-context-inspector.${format}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime"
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
