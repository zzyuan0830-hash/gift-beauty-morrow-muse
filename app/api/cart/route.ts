import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isIP } from "node:net";
import {
  settings,
  CommerceError,
  checkoutAllowed,
  isDesignPreview,
} from "@/lib/config";
import { request, getCart, variant, shopInfo } from "@/lib/shopify";
import { seal, unseal, publicCart, emptyCart } from "@/lib/cart";
import { validQuantity, eligible } from "@/lib/rules";
import { CREATE, ADD, UPDATE, REMOVE } from "@/lib/queries";
import type { Cart } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cookieName = "mm_cart";
const response = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
function failure(e: unknown) {
  const code = e instanceof CommerceError ? e.code : "UNAVAILABLE";
  return response(
    {
      error: code,
      message:
        code === "ORIGIN_REJECTED"
          ? "Please reload this page and try again."
          : code === "INVALID_INPUT"
            ? "Please check your selection and quantity."
            : code === "ITEM_UNAVAILABLE"
              ? "This item is no longer available in the requested quantity. Please review your bag."
              : code === "CART_CHANGED"
                ? "Your bag has changed. Review the latest items and prices before continuing."
                : code === "MUTATION_REJECTED"
                  ? "Shopify could not apply this change. Refresh your bag and review availability."
                  : "Shopping is temporarily unavailable. If you were updating your bag, refresh it before trying again.",
    },
    e instanceof CommerceError ? e.status : 503,
  );
}
function buyerIp(req: NextRequest) {
  const raw =
    process.env.VERCEL === "1"
      ? req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim()
      : undefined;
  return raw && isIP(raw) ? raw : undefined;
}
async function current(ip?: string) {
  const jar = await cookies(),
    id = unseal(jar.get(cookieName)?.value);
  return id ? getCart(id, ip) : null;
}
function remember(res: NextResponse, id: string) {
  res.cookies.set(cookieName, seal(id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
export async function GET(req: NextRequest) {
  if (isDesignPreview())
    return response(
      {
        error: "DESIGN_ONLY",
        message: "Design preview has no Shopify cart or checkout.",
      },
      403,
    );
  try {
    settings();
    const cart = await current(buyerIp(req));
    const res = response({ cart: cart ? publicCart(cart) : emptyCart });
    if (!cart) res.cookies.delete(cookieName);
    return res;
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  if (isDesignPreview())
    return response(
      {
        error: "DESIGN_ONLY",
        message: "Design preview cannot create an order or collect a payment.",
      },
      403,
    );
  try {
    const config = settings();
    if (
      req.headers.get("origin") !== config.origin ||
      req.headers.get("sec-fetch-site") === "cross-site"
    )
      throw new CommerceError("ORIGIN_REJECTED", 403);
    if (!req.headers.get("content-type")?.startsWith("application/json"))
      throw new CommerceError("INVALID_INPUT", 400);
    if (Number(req.headers.get("content-length") || 0) > 8192)
      throw new CommerceError("INVALID_INPUT", 413);
    const reader = req.body?.getReader();
    let raw = "",
      bytes = 0;
    if (!reader) throw new CommerceError("INVALID_INPUT", 400);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        throw new CommerceError("INVALID_INPUT", 413);
      }
      raw += new TextDecoder().decode(value);
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new CommerceError("INVALID_INPUT", 400);
    }
    if (
      !data ||
      typeof data !== "object" ||
      !["add", "update", "remove", "checkout"].includes(data.action)
    )
      throw new CommerceError("INVALID_INPUT", 400);
    const ip = buyerIp(req);
    let cart = await current(ip);
    if (data.action === "checkout") {
      if (!cart || !cart.totalQuantity)
        throw new CommerceError("EMPTY_CART", 409);
      const view = publicCart(cart);
      if (view.blocked) throw new CommerceError("ITEM_UNAVAILABLE", 409);
      if (view.digest !== data.digest)
        return response(
          {
            error: "CART_CHANGED",
            message:
              "Your bag changed. Review the latest items and prices, then continue.",
            cart: view,
          },
          409,
        );
      const policies = await shopInfo();
      if (
        !policies.privacyPolicy?.body ||
        !policies.refundPolicy?.body ||
        !policies.shippingPolicy?.body ||
        !policies.termsOfService?.body
      )
        throw new CommerceError("POLICIES_UNAVAILABLE");
      if (!checkoutAllowed(cart.checkoutUrl))
        throw new CommerceError("CHECKOUT_UNAVAILABLE");
      return response({ checkoutUrl: cart.checkoutUrl });
    }
    let query = "",
      variables: Record<string, unknown> = {},
      field = "";
    if (data.action === "add") {
      if (
        typeof data.variantId !== "string" ||
        !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(data.variantId) ||
        !validQuantity(data.quantity)
      )
        throw new CommerceError("INVALID_INPUT", 400);
      const item = await variant(data.variantId);
      const existing =
        cart?.lines.nodes.find((l) => l.merchandise.id === data.variantId)
          ?.quantity || 0;
      if (
        !item ||
        !eligible(item.product) ||
        !item.availableForSale ||
        existing + data.quantity > 20 ||
        (item.quantityAvailable != null &&
          existing + data.quantity > item.quantityAvailable)
      )
        throw new CommerceError("ITEM_UNAVAILABLE", 409);
      if (
        cart?.lines.pageInfo.hasNextPage ||
        (cart && cart.lines.nodes.length >= 100 && !existing)
      )
        throw new CommerceError("BAG_LIMIT", 409);
      const lines = [
        { merchandiseId: data.variantId, quantity: data.quantity },
      ];
      if (cart) {
        query = ADD;
        field = "cartLinesAdd";
        variables = { cartId: cart.id, lines };
      } else {
        query = CREATE;
        field = "cartCreate";
        variables = { input: { lines, buyerIdentity: { countryCode: "US" } } };
      }
    } else {
      if (!cart)
        return response(
          {
            error: "CART_EXPIRED",
            message: "Your previous bag expired. Please add your items again.",
            cart: emptyCart,
          },
          409,
        );
      const line = cart.lines.nodes.find((l) => l.id === data.lineId);
      if (!line) throw new CommerceError("INVALID_INPUT", 400);
      if (data.action === "update") {
        if (!validQuantity(data.quantity))
          throw new CommerceError("INVALID_INPUT", 400);
        const item = await variant(line.merchandise.id);
        if (
          !item ||
          !eligible(item.product) ||
          !item.availableForSale ||
          (item.quantityAvailable != null &&
            data.quantity > item.quantityAvailable)
        )
          throw new CommerceError("ITEM_UNAVAILABLE", 409);
        query = UPDATE;
        field = "cartLinesUpdate";
        variables = {
          cartId: cart.id,
          lines: [{ id: line.id, quantity: data.quantity }],
        };
      } else {
        query = REMOVE;
        field = "cartLinesRemove";
        variables = { cartId: cart.id, lineIds: [line.id] };
      }
    }
    const result = await request<
      Record<string, { cart: Cart | null; userErrors: { code: string }[] }>
    >(query, variables, ip);
    const payload = result[field];
    if (!payload || payload.userErrors?.length || !payload.cart)
      throw new CommerceError("MUTATION_REJECTED", 409);
    cart = payload.cart;
    const res = response({
      cart: publicCart(cart),
      message: "Bag updated. Please review quantities and prices.",
    });
    remember(res, cart.id);
    return res;
  } catch (e) {
    return failure(e);
  }
}
