import "server-only";
import { settings, CommerceError } from "./config";
import { eligible } from "./rules";
import { CATALOG, DETAIL, VARIANT, GET_CART } from "./queries";
import type { Product, Variant, Cart } from "./types";
export async function request<T>(
  query: string,
  variables: Record<string, unknown> = {},
  buyerIp?: string,
): Promise<T> {
  const c = settings();
  const id = crypto.randomUUID();
  try {
    const response = await fetch(c.endpoint, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
      headers: {
        "Content-Type": "application/json",
        "Shopify-Storefront-Private-Token": c.token,
        ...(buyerIp ? { "Shopify-Storefront-Buyer-IP": buyerIp } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) throw new CommerceError("SHOPIFY_UNAVAILABLE");
    const body = await response.json();
    if (body.errors?.length || !body.data)
      throw new CommerceError("SHOPIFY_RESPONSE_ERROR");
    return body.data as T;
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "commerce_request_failed",
        id,
        code: error instanceof CommerceError ? error.code : "NETWORK_ERROR",
      }),
    );
    throw new CommerceError("SHOPIFY_UNAVAILABLE");
  }
}
export async function catalog() {
  const result: Product[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const data: {
      products: {
        nodes: Product[];
        pageInfo: { hasNextPage: boolean; endCursor: string };
      };
    } = await request(CATALOG, { after });
    result.push(...data.products.nodes.filter(eligible));
    if (!data.products.pageInfo.hasNextPage) return result;
    after = data.products.pageInfo.endCursor;
  }
  throw new CommerceError("CATALOG_LIMIT");
}
export async function product(handle: string) {
  const data = await request<{ product: Product | null }>(DETAIL, { handle });
  return data.product && eligible(data.product) ? data.product : null;
}
export async function variant(id: string) {
  return (
    await request<{ node: (Variant & { product: Product }) | null }>(VARIANT, {
      id,
    })
  ).node;
}
export async function getCart(id: string, buyerIp?: string) {
  return (await request<{ cart: Cart | null }>(GET_CART, { id }, buyerIp)).cart;
}
export async function shopInfo() {
  return (
    await request<{
      shop: {
        name: string;
        privacyPolicy: { body: string; title: string } | null;
        refundPolicy: { body: string; title: string } | null;
        shippingPolicy: { body: string; title: string } | null;
        termsOfService: { body: string; title: string } | null;
      };
    }>(
      `query Policies{shop{name privacyPolicy{title body} refundPolicy{title body} shippingPolicy{title body} termsOfService{title body}}}`,
    )
  ).shop;
}
