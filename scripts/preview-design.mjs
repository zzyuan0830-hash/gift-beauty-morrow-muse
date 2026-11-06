import { spawn } from "node:child_process";
// Uses the production build with a deliberate design source, never a Shopify token.
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    STORE_MODE: "design",
    E2E_FIXTURE: "",
    PORT: process.env.PORT || "4400",
    HOSTNAME: process.env.HOSTNAME || "127.0.0.1",
  },
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
