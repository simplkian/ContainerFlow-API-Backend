import { build } from "esbuild";
import { rmSync } from "node:fs";
import path from "node:path";

rmSync("server_dist", { recursive: true, force: true });

await build({
  entryPoints: ["server/index.ts"],
  outfile: "server_dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  sourcemap: true,
  minify: false,
  alias: {
    "@shared": path.resolve("shared"),
  },
  external: ["pg-native"],
});
