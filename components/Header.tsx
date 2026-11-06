"use client";
import Link from "next/link";
import { trapDialogTab } from "@/lib/dialog-focus";
import Wordmark from "./Wordmark";
import brand from "@/config/brand.json";
import { useEffect, useState, useRef } from "react";
import { readPreviewQuantity } from "@/lib/browser-bag";
export default function Header({ preview = false }: { preview?: boolean }) {
  const [quantity, setQuantity] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!preview) return;
    let active = true;
    const refresh = async () => {
      try {
        const count = readPreviewQuantity();
        if (active) setQuantity(count);
      } catch {
        /* Bag page provides recovery. */
      }
    };
    void refresh();
    window.addEventListener("morrow-bag-updated", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("morrow-bag-updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [preview]);
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [open]);
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  return (
    <header className="header">
      <Link className="wordmark" href="/" aria-label={`${brand.name} home`}>
        <Wordmark tagline />
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/shop">Shop the collection</Link>
        <Link href="/gifting">The gifting edit</Link>
        <Link href="/about">Our story</Link>
      </nav>
      <div className="header-actions">
        <Link href="/bag">
          Bag {quantity > 0 && <span className="bag-count">({quantity})</span>}{" "}
          <span aria-hidden="true">→</span>
        </Link>
        <button
          className="menu-button"
          ref={button}
          onClick={() => {
            dialog.current?.showModal();
            setOpen(true);
          }}
          aria-label="Open menu"
        >
          Menu
        </button>
      </div>
      <dialog
        className="menu-dialog"
        ref={dialog}
        aria-label="Main menu"
        onKeyDown={trapDialogTab}
        onClose={() => {
          setOpen(false);
          button.current?.focus();
        }}
      >
        <button
          className="close"
          onClick={() => dialog.current?.close()}
          aria-label="Close menu"
        >
          Close ×
        </button>
        <p className="eyebrow">{brand.name}</p>
        <nav aria-label="Mobile navigation">
          {[
            ["/", "Home"],
            ["/shop", "Shop the collection"],
            ["/gifting", "The gifting edit"],
            ["/about", "Our story"],
            ["/faq", "Your questions"],
            ["/bag", "Your bag"],
          ].map(([href, title]) => (
            <Link
              key={href}
              href={href}
              onClick={() => dialog.current?.close()}
            >
              {title}
            </Link>
          ))}
        </nav>
      </dialog>
    </header>
  );
}
