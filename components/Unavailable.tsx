import Link from "next/link";
export default function Unavailable({ error = false }: { error?: boolean }) {
  return (
    <section className="empty">
      <p className="eyebrow">
        {error ? "A brief pause" : "A considered beginning"}
      </p>
      <h2>
        {error
          ? "The collection is temporarily unavailable."
          : "Good things take a little care."}
      </h2>
      <p>
        {error
          ? "Please try again shortly. We could not retrieve the latest collection."
          : "We’re preparing our first collection. Shopping is not open yet, and no payments are being accepted."}
      </p>
      <Link className="button outline" href="/gifting">
        Discover our gifting approach
      </Link>
    </section>
  );
}
