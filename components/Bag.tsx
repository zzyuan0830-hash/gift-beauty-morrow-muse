"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import type { PublicCart } from "@/lib/types";
import { readBag, changeBag } from "@/lib/browser-bag";
import { formatMoney } from "@/lib/rules";
export default function Bag({ preview = false }: { preview?: boolean }) {
  const [cart, setCart] = useState<PublicCart | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function load() {
    try {
      const data = await readBag(preview);
      if (data.ok && data.cart) {
        setCart(data.cart);
        setMessage(data.message || "");
      } else {
        setCart(null);
        setMessage(data.message || "Your bag could not be loaded.");
      }
    } catch {
      setMessage("Your bag could not be loaded. Please try again.");
    }
  }
  useEffect(() => {
    void load();
    const focus = () => {
      if (!lock.current) void load();
    };
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, []);
  async function change(data: Record<string, unknown>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const result = await changeBag(preview, data);
      if (result.cart) setCart(result.cart);
      setMessage(result.message || "");
      if (!preview && result.ok && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      if (!result.ok && !result.cart) {
        const fresh = await readBag(preview);
        if (fresh.ok && fresh.cart) setCart(fresh.cart);
      }
    } catch {
      setMessage(
        "We could not confirm this change. Refresh your bag before trying again.",
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  return (
    <>
      <div role="status" className={message ? "notice" : ""}>
        {message}
      </div>
      {!cart ? (
        <div className="empty">
          <h2>Let’s check your bag.</h2>
          <p>
            {preview
              ? "Your design selections are saved on this browser."
              : "Your items are retrieved securely from the store."}
          </p>
          <button className="button" onClick={load}>
            Reload bag
          </button>
        </div>
      ) : cart.lines.length === 0 ? (
        <div className="empty">
          <p className="eyebrow">A little room for something lovely</p>
          <h2>Your bag is empty.</h2>
          <Link className="button" href="/shop">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="bag-layout">
          <div>
            {cart.lines.map((l) => (
              <article className="bag-line" key={l.id}>
                {l.image && (
                  <img
                    src={l.image.url}
                    alt={l.image.altText || l.title}
                    width="180"
                    height="220"
                  />
                )}
                <div>
                  <h2>
                    <Link href={`/products/${l.handle}`}>{l.title}</Link>
                  </h2>
                  {l.variant !== "Default Title" && <p>{l.variant}</p>}
                  <p>{formatMoney(l.unit)} each</p>
                  {!l.available && (
                    <p className="notice">
                      This item needs review before checkout.
                    </p>
                  )}
                  <div className="quantity-control">
                    <button
                      aria-label={`Decrease ${l.title}`}
                      disabled={busy || l.quantity <= 1}
                      onClick={() =>
                        change({
                          action: "update",
                          lineId: l.id,
                          quantity: l.quantity - 1,
                        })
                      }
                    >
                      −
                    </button>
                    <span aria-label="Quantity">{l.quantity}</span>
                    <button
                      aria-label={`Increase ${l.title}`}
                      disabled={busy || l.quantity >= 20}
                      onClick={() =>
                        change({
                          action: "update",
                          lineId: l.id,
                          quantity: l.quantity + 1,
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => change({ action: "remove", lineId: l.id })}
                  >
                    Remove <span className="sr-only">{l.title}</span>
                  </button>
                </div>
                <p>{formatMoney(l.total)}</p>
              </article>
            ))}
          </div>
          <aside className="bag-summary">
            <p className="eyebrow">Your selection</p>
            <h2>A thoughtful choice.</h2>
            <div className="totals">
              <span>Subtotal</span>
              <strong>{formatMoney(cart.subtotal)}</strong>
            </div>
            <p>
              {preview
                ? "Illustrative product total. This is a design selection, not a quotation or an order."
                : "Shipping, any applicable taxes and final discounts are confirmed at checkout."}
            </p>
            {cart.blocked && (
              <p className="notice">
                Review unavailable items before continuing.
              </p>
            )}
            <button
              className="button"
              disabled={busy || cart.blocked}
              onClick={() =>
                change({ action: "checkout", digest: cart.digest })
              }
            >
              {busy
                ? "Checking your bag…"
                : preview
                  ? "About this preview"
                  : "Continue to checkout →"}
            </button>
            <p className="quiet">
              {preview
                ? "Checkout is not connected. No payment is collected and no order will be created."
                : "You’ll continue to our Shopify checkout. An order is confirmed there only after payment is processed."}
            </p>
            <Link href="/policies/shipping">Delivery information</Link>
          </aside>
        </div>
      )}
      <p className="storage-note">
        {preview
          ? "This preview bag is stored only in this browser. It is separate from a real Shopify bag. Clearing browser storage removes it; no address or payment information is collected."
          : "A necessary, secure cookie remembers this bag on this browser for up to 30 days. Clearing cookies may remove access to it. Addresses and payment details are entered at checkout."}
      </p>
    </>
  );
}
