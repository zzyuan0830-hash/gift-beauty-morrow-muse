"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import type { Variant } from "@/lib/types";
import { readBag, changeBag } from "@/lib/browser-bag";
import { formatMoney } from "@/lib/rules";
export default function Purchase({
  variants,
  preview = false,
}: {
  variants: Variant[];
  preview?: boolean;
}) {
  const [id, setId] = useState(variants[0].id),
    [quantity, setQuantity] = useState(1),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [added, setAdded] = useState(false);
  const lock = useRef(false);
  const v = variants.find((v) => v.id === id)!;
  return (
    <form
      id="purchase"
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        setAdded(false);
        setMessage("");
        try {
          const data = await changeBag(preview, {
            action: "add",
            variantId: id,
            quantity,
          });
          if (data.ok) {
            const verified = await readBag(preview);
            if (!verified.ok || !verified.cart?.quantity)
              setMessage(
                "Your bag could not be remembered. Allow necessary browser storage and reload your bag before trying again.",
              );
            else {
              setMessage(data.message || "Bag updated.");
              setAdded(true);
            }
          } else setMessage(data.message || "Please review your selection.");
        } catch {
          setMessage(
            "We could not confirm the update. Check your bag before trying again.",
          );
        } finally {
          setBusy(false);
          lock.current = false;
        }
      }}
    >
      <p className="price">
        {formatMoney(v.price)}
        {preview && <span className="price-context">Illustrative price</span>}
      </p>
      {variants.length > 1 && (
        <label>
          Choose an option
          <select
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setAdded(false);
              setMessage("");
            }}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
                {preview || v.availableForSale ? "" : " — unavailable"}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="purchase-row">
        <label>
          Quantity
          <input
            type="number"
            min="1"
            max="20"
            step="1"
            required
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value));
              setAdded(false);
              setMessage("");
            }}
          />
        </label>
        <button
          className="button"
          disabled={busy || (!preview && !v.availableForSale)}
        >
          {busy
            ? "Updating bag…"
            : preview
              ? "Add to preview bag"
              : v.availableForSale
                ? "Add to bag"
                : "Currently unavailable"}
        </button>
      </div>
      <p className="quiet">
        {preview
          ? "Design concept. No stock, delivery or payment is offered in this preview."
          : "Shipping and any applicable taxes are calculated at checkout."}
      </p>
      <p role="status" className={added ? "added-feedback" : ""}>
        {message} {added && <Link href="/bag">View your bag →</Link>}
      </p>
    </form>
  );
}
