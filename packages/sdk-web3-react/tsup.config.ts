import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/**/*.ts?(x)"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  external: ["react"],
  ...options,
}));
