import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty">
      <p className="eyebrow">A different direction</p>
      <h1>We couldn’t find that page.</h1>
      <p>This item or page may no longer be available.</p>
      <Link className="button" href="/shop">
        Back to the collection
      </Link>
    </section>
  );
}
