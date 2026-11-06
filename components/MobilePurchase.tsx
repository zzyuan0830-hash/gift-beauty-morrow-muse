"use client";
import { useEffect, useState } from "react";

export default function MobilePurchase({ preview }: { preview: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const purchase = document.getElementById("purchase");
    const footer = document.querySelector("footer");
    if (!purchase || !footer) return;
    let purchaseVisible = true,
      footerVisible = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === purchase) purchaseVisible = entry.isIntersecting;
        if (entry.target === footer) footerVisible = entry.isIntersecting;
      }
      setVisible(!purchaseVisible && !footerVisible);
    });
    observer.observe(purchase);
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  return visible ? (
    <a
      className="mobile-purchase"
      href="#purchase"
      onClick={(event) => {
        event.preventDefault();
        const purchase = document.getElementById("purchase");
        purchase?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
        purchase
          ?.querySelector<HTMLInputElement>("input")
          ?.focus({ preventScroll: true });
      }}
    >
      {preview
        ? "Choose quantity · add to preview bag"
        : "Choose options · add to bag"}{" "}
      ↑
    </a>
  ) : null;
}
