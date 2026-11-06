import type { Product } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { product, catalog } from "@/lib/storefront";
import { storeState, settings, isDesignPreview } from "@/lib/config";
import { meta, categories, lowPrice } from "@/lib/rules";
import { cleanHtml, jsonLd } from "@/lib/content";
import ConceptDetails from "@/components/ConceptDetails";
import { conceptInfo } from "@/lib/design-catalog";
import MobilePurchase from "@/components/MobilePurchase";
import Gallery from "@/components/Gallery";
import Purchase from "@/components/Purchase";
import ProductCard from "@/components/ProductCard";
import Unavailable from "@/components/Unavailable";
import { cache } from "react";
const getProduct = cache(product);
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  if (!storeState().connected)
    return { title: "Collection coming soon", robots: { index: false } };
  try {
    const p = await getProduct(handle);
    if (p && isDesignPreview())
      return {
        title: p.title,
        description: p.description.slice(0, 155),
        robots: { index: false, follow: false },
      };
    return p
      ? {
          title: p.title,
          description: p.description.slice(0, 155),
          alternates: {
            canonical: `${isDesignPreview() ? "" : settings().origin}/products/${p.handle}`,
          },
          openGraph: { title: p.title, images: [p.images.nodes[0].url] },
        }
      : { title: "Item not found", robots: { index: false } };
  } catch {
    return { title: "Collection unavailable", robots: { index: false } };
  }
}
export default async function Detail({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  if (!/^[a-z0-9-]{1,200}$/.test(handle)) notFound();
  if (!storeState().connected) return <Unavailable />;
  let p;
  try {
    p = await getProduct(handle);
  } catch {
    return <Unavailable error />;
  }
  if (!p) notFound();
  let related: Product[];
  try {
    related = (await catalog())
      .filter(
        (x) => x.id !== p.id && meta(x, "category") === meta(p, "category"),
      )
      .slice(0, 3);
  } catch {
    related = [];
  }
  return (
    <div className="page product-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/shop">Collection</Link>
        <span>/</span>
        <span>{p.title}</span>
      </nav>
      {storeState().mode === "live" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.title,
              image: p.images.nodes.map((i) => i.url),
              description: p.description,
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "USD",
                lowPrice: lowPrice(p),
                highPrice: Math.max(
                  ...p.variants.nodes.map((v) => Number(v.price.amount)),
                ),
                offerCount: p.variants.nodes.length,
                url: `${isDesignPreview() ? "" : settings().origin}/products/${p.handle}`,
              },
            }),
          }}
        />
      )}
      <section className="product-layout">
        <Gallery
          images={p.images.nodes}
          title={p.title}
          preview={isDesignPreview()}
        />
        <div className="product-details">
          <p className="eyebrow">
            {categories[meta(p, "category") as keyof typeof categories]}
          </p>
          <h1>{p.title}</h1>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: cleanHtml(p.descriptionHtml) }}
          />
          {isDesignPreview() && (
            <div className="mood-strip">
              <span>THE CREATIVE DIRECTION</span>
              <p>{conceptInfo(p.handle)?.mood}</p>
            </div>
          )}
          <Purchase variants={p.variants.nodes} preview={isDesignPreview()} />
          <div className="detail-accordions">
            {[
              ["specifications", "Size & specifications"],
              ["contents", "What’s included"],
              ["usage", "How to use"],
              ["ingredients", "Ingredients & care"],
            ].map(([key, label]) => (
              <details key={key} open={key === "contents"}>
                <summary>{label}</summary>
                <p className="plain-text">{meta(p, key)}</p>
              </details>
            ))}
            <details>
              <summary>Delivery & returns</summary>
              <p>
                Review the{" "}
                <Link href="/policies/shipping">shipping information</Link> and{" "}
                <Link href="/policies/returns">returns policy</Link> before
                ordering.{" "}
                {isDesignPreview()
                  ? "No delivery or returns service is offered in the design preview."
                  : "Available delivery options and charges are shown at checkout."}
              </p>
            </details>
          </div>
        </div>
      </section>
      {isDesignPreview() && <ConceptDetails handle={p.handle} />}
      {related.length > 0 && (
        <section className="section">
          <p className="eyebrow">Continue the thought</p>
          <h2>A little more to discover.</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard
                product={p}
                key={p.id}
                preview={storeState().mode === "design"}
              />
            ))}
          </div>
        </section>
      )}
      <MobilePurchase preview={isDesignPreview()} />
    </div>
  );
}
