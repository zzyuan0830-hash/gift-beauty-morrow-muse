import { cp, mkdir, readdir, rm } from "node:fs/promises";
await mkdir(".next/standalone/.next", { recursive: true });
await cp("public", ".next/standalone/public", { recursive: true });
await cp(".next/static", ".next/standalone/.next/static", { recursive: true });
console.log(
  "Standalone Node bundle prepared with local assets. No environment secrets copied.",
);

for (const name of await readdir(".next/standalone")) {
  if (name.startsWith(".env"))
    await rm(`.next/standalone/${name}`, { force: true });
}
