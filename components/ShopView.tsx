import Link from "next/link";
import type { Product } from "@/lib/types";
import { categories, filterProducts } from "@/lib/rules";
import ProductCard from "./ProductCard";
import Unavailable from "./Unavailable";
export default function ShopView({
  all,
  params,
  preview,
}: {
  all: Product[] | null;
  params: Record<string, string>;
  preview: boolean;
}) {
  const products = all ? filterProducts(all, params) : [];
  return (
    <div className="page">
      <div className="page-heading">
        <p className="eyebrow">A considered collection</p>
        <h1>Find their kind of lovely.</h1>
        <p>Beauty gifts, fragrance and little rituals of care.</p>
      </div>
      <form className="filters" action="/shop">
        <label className="search-label">
          Search
          <input
            type="search"
            name="q"
            placeholder="Find something thoughtful"
            maxLength={100}
            defaultValue={params.q}
          />
        </label>
        <label>
          Category
          <select name="category" defaultValue={params.category || ""}>
            <option value="">All categories</option>
            {Object.entries(categories).map(([k, v]) => (
              <option value={k} key={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Min price ($)
          <input
            type="number"
            min="0"
            step="0.01"
            name="min"
            defaultValue={params.min}
          />
        </label>
        <label>
          Max price ($)
          <input
            type="number"
            min="0"
            step="0.01"
            name="max"
            defaultValue={params.max}
          />
        </label>
        <label>
          Sort by
          <select name="sort" defaultValue={params.sort || "newest"}>
            <option value="newest">Recently updated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>
        <button className="button">Apply filters</button>
        <Link href="/shop">Reset</Link>
      </form>
      {all === null || all.length === 0 ? (
        <Unavailable />
      ) : (
        <>
          <p className="result-count">
            {products.length} {products.length === 1 ? "item" : "items"}
          </p>
          {products.length ? (
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} preview={preview} />
              ))}
            </div>
          ) : (
            <section className="empty">
              <h2>No matching finds.</h2>
              <p>Try a different search or a wider price range.</p>
              <Link className="button outline" href="/shop">
                Reset filters
              </Link>
            </section>
          )}
        </>
      )}
    </div>
  );
}
