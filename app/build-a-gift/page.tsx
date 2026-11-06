import Link from "next/link";
export const metadata = { title: "Custom gifts", robots: { index: false } };
export default function Custom() {
  return (
    <section className="empty">
      <p className="eyebrow">A future chapter</p>
      <h1>Custom gifting isn’t open yet.</h1>
      <p>
        Explore single items and fixed gift sets. Their exact contents and
        packaging are listed on each product page.
      </p>
      <Link className="button" href="/shop?category=gift-sets">
        Explore fixed gift sets
      </Link>
    </section>
  );
}
