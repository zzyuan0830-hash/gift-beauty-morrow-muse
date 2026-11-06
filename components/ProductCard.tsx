import Link from "next/link";
import type { Product } from "@/lib/types";
import { categories, meta, formatMoney, lowPrice } from "@/lib/rules";
export default function ProductCard({
  product: p,
  preview = false,
}: {
  product: Product;
  preview?: boolean;
}) {
  const image = p.images.nodes[0];
  return (
    <article className="product-card">
      <Link href={`/products/${p.handle}`} className="product-photo">
        <img
          src={image.url}
          alt={image.altText || p.title}
          loading="lazy"
          width="640"
          height="800"
        />
        <span className="photo-link">Discover the details →</span>
      </Link>
      <div className="product-caption">
        <div>
          <p className="eyebrow">
            {categories[meta(p, "category") as keyof typeof categories]}
          </p>
          <h3>
            <Link href={`/products/${p.handle}`}>{p.title}</Link>
          </h3>
        </div>
        <p>
          {p.variants.nodes.length > 1 ? "From " : ""}
          {formatMoney({ amount: String(lowPrice(p)), currencyCode: "USD" })}
        </p>
      </div>
      {!preview && !p.variants.nodes.some((v) => v.availableForSale) && (
        <p className="quiet">Currently unavailable</p>
      )}
      {preview && (
        <p className="product-tag">Design concept · illustrative price</p>
      )}
    </article>
  );
}
