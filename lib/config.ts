import launch from "@/config/launch.json";
export class CommerceError extends Error {
  constructor(
    public code: string,
    public status = 503,
  ) {
    super(code);
  }
}
export const fixtureMode = () =>
  process.env.NODE_ENV === "development" && process.env.E2E_FIXTURE === "1";
export function settings() {
  const mode = process.env.STORE_MODE || "maintenance";
  const domain = process.env.SHOPIFY_STORE_DOMAIN || "";
  const origin = process.env.SITE_URL || "http://localhost:3000";
  const secret = process.env.CART_COOKIE_SECRET || "";
  if (fixtureMode())
    return {
      mode: "test",
      domain: "fixture.myshopify.com",
      origin,
      secret,
      endpoint: "http://127.0.0.1:4399/graphql",
      token: "fixture-only",
    };
  if (process.env.E2E_FIXTURE)
    throw new CommerceError("INVALID_TEST_CONFIGURATION");
  if (!["test", "live"].includes(mode)) throw new CommerceError("STORE_CLOSED");
  if (
    process.env.STORE_INDEPENDENT_CONFIRMED !== "true" ||
    !/^[-a-z0-9]+\.myshopify\.com$/.test(domain) ||
    !process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ||
    Buffer.from(secret, "base64").length !== 32
  )
    throw new CommerceError("STORE_NOT_CONFIGURED");
  if (!/^\d{4}-(01|04|07|10)$/.test(process.env.SHOPIFY_API_VERSION || ""))
    throw new CommerceError("API_VERSION_REQUIRED");
  const u = new URL(origin);
  if (u.username || u.password || u.pathname !== "/" || u.search || u.hash)
    throw new CommerceError("INVALID_SITE_ORIGIN");
  if (process.env.NODE_ENV === "production" && u.protocol !== "https:")
    throw new CommerceError("HTTPS_REQUIRED");
  if (mode === "test" && process.env.SHOPIFY_TEST_PAYMENTS_CONFIRMED !== "true")
    throw new CommerceError("TEST_PAYMENTS_UNCONFIRMED");
  if (
    mode === "live" &&
    (process.env.LAUNCH_APPROVED !== "true" ||
      Object.entries(launch).some(([k, v]) => typeof v === "boolean" && !v) ||
      !launch.businessName ||
      !/^\S+@\S+\.\S+$/.test(launch.supportEmail) ||
      launch.publicOrigin !== u.origin)
  )
    throw new CommerceError("LAUNCH_NOT_APPROVED");
  return {
    mode,
    domain,
    origin: u.origin,
    secret,
    endpoint: `https://${domain}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`,
    token: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
  };
}
export const isDesignPreview = () =>
  !fixtureMode() && process.env.STORE_MODE === "design";
export function storeState() {
  if (isDesignPreview()) return { connected: true, mode: "design" };
  try {
    return { connected: true, mode: settings().mode };
  } catch {
    return { connected: false, mode: "maintenance" };
  }
}
export function checkoutAllowed(url: string) {
  try {
    const c = settings(),
      u = new URL(url);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      (u.hostname === c.domain ||
        u.hostname === process.env.SHOPIFY_CHECKOUT_HOST)
    );
  } catch {
    return false;
  }
}
