import "server-only";
import * as shopify from "./shopify";
import { designProducts } from "./design-catalog";
import { isDesignPreview } from "./config";
// Explicit selection only. Upstream errors NEVER fall back to concepts.
export const catalog = () =>
  isDesignPreview() ? Promise.resolve(designProducts) : shopify.catalog();
export const product = (handle: string) =>
  isDesignPreview()
    ? Promise.resolve(designProducts.find((p) => p.handle === handle) || null)
    : shopify.product(handle);
