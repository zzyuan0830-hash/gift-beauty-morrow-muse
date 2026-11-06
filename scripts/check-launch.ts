import launch from "../config/launch.json";
import { settings } from "../lib/config";
const missing: string[] = [];
for (const [key, value] of Object.entries(launch)) {
  if (typeof value === "boolean" && !value)
    missing.push(`Business verification: ${key}`);
  if (typeof value === "string" && !value.trim())
    missing.push(`Business field: ${key}`);
}
if (process.env.STORE_MODE !== "live")
  missing.push("STORE_MODE must be live for release verification");
try {
  settings();
} catch {
  missing.push("Server configuration is incomplete or launch is not approved");
}
console.log(
  JSON.stringify(
    {
      ready: missing.length === 0,
      scope:
        "Configuration checks only; not payment or operational certification",
      missing,
    },
    null,
    2,
  ),
);
process.exitCode = missing.length ? 1 : 0;
