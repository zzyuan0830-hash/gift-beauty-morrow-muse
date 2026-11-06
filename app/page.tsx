import Link from "next/link";
import brand from "@/config/brand.json";
import { catalog } from "@/lib/storefront";
import { storeState } from "@/lib/config";
import ProductCard from "@/components/ProductCard";
import Unavailable from "@/components/Unavailable";
import { meta } from "@/lib/rules";
import type { Product } from "@/lib/types";
export default async function Home() {
  const state = storeState(),
    preview = state.mode === "design";
  let products: Product[] = [];
  let error = false;
  if (state.connected)
    try {
      products = await catalog();
    } catch {
      error = true;
    }
  const gifts = products
      .filter((p) => meta(p, "category") === "gift-sets")
      .slice(0, 3),
    care = products
      .filter((p) => meta(p, "category") === "body-care")
      .slice(0, 3),
    fragrance =
      products.find((p) => p.handle === "fig-and-paper") ||
      products.find((p) => meta(p, "category") === "fragrance");
  const hero = preview
    ? "/concepts/hero-editorial.webp"
    : products[0]?.images.nodes[0].url || "/art/paper-study.svg";
  const giftPhoto = preview
    ? "/concepts/gift-open.webp"
    : gifts[0]?.images.nodes[0].url || "/art/ribbon-study.svg";
  return (
    <>
      <section className="hero restored-hero">
        <div className="hero-copy">
          <p className="eyebrow">THE JOY IS IN THE GIVING</p>
          <h1>
            Some gifts say
            <br />
            <em>you get me.</em>
          </h1>
          <p>
            Little rituals. Beautifully brought together.
            <br />
            For your favorite people, and their everyday moments.
          </p>
          <div className="hero-buttons">
            <Link className="button" href="/shop?category=gift-sets">
              Find their gift ›
            </Link>
            <Link className="underlink" href="/gifting">
              Find your inspiration
            </Link>
          </div>
          <span className="hero-footnote">
            THE {brand.name.toUpperCase()} GIFT COLLECTION
          </span>
        </div>
        <div className="hero-art">
          <img
            src={hero}
            alt={
              preview
                ? "AI-created design concept of a gift box, bath soak, cream and candle on linen"
                : products[0]?.images.nodes[0].altText ||
                  "Decorative paper and ribbon study"
            }
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <span className="art-caption">
            {preview
              ? "The slow Sunday mood · concept imagery"
              : products[0]?.title || "A study in thoughtful giving"}
          </span>
        </div>
      </section>
      <div className="ribbon-line">
        <span>Good things, thoughtfully given.</span>
        <Link href="/shop?category=gift-sets">Beauty gift sets</Link>
        <Link href="/shop?category=fragrance">Fragrance</Link>
        <Link href="/shop?category=body-care">Body care</Link>
      </div>
      <section className="section gift-edit">
        <div className="section-heading">
          <div>
            <p className="eyebrow">READY TO MAKE THEIR DAY</p>
            <h2>
              A gesture for <em>every kind of person.</em>
            </h2>
          </div>
          <Link className="underlink" href="/shop">
            Discover the collection ›
          </Link>
        </div>
        {gifts.length ? (
          <div className="product-grid">
            {gifts.map((p) => (
              <ProductCard key={p.id} product={p} preview={preview} />
            ))}
          </div>
        ) : (
          <Unavailable error={error} />
        )}
      </section>
      {fragrance && (
        <section className="editorial-split">
          <div className="editorial-photo">
            <img
              src={fragrance.images.nodes[0].url}
              alt={fragrance.images.nodes[0].altText || fragrance.title}
              width="1122"
              height="1402"
              loading="lazy"
            />
            <span className="art-caption">
              {fragrance.title}
              {preview ? " / A FRAGRANCE STUDY" : ""}
            </span>
          </div>
          <div className="editorial-copy">
            <p className="eyebrow">FOR THE QUIETLY CURIOUS</p>
            <h2>
              A scent.
              <br />A memory.
              <br />
              <em>A little of them.</em>
            </h2>
            <p>
              {preview
                ? "Green fig, pale wood, an open notebook. A fragrance idea for the person who finds beauty in the unexpected."
                : fragrance.description}
            </p>
            {preview && (
              <p className="scent-line">GREEN · WOODY · SOFTLY ATMOSPHERIC</p>
            )}
            <Link className="underlink" href={`/products/${fragrance.handle}`}>
              Meet {fragrance.title} ›
            </Link>
          </div>
        </section>
      )}
      <section className="section occasion-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">START WITH SOMEONE IN MIND</p>
            <h2>
              What would you like to <em>say?</em>
            </h2>
          </div>
        </div>
        <div className="occasion-grid">
          {[
            [
              "01 / APPRECIATION",
              "You made my day.",
              "A small gesture with a big thank you.",
              preview
                ? "/products/the-little-thank-you"
                : "/shop?category=gift-sets",
              "Discover a little thank you",
            ],
            [
              "02 / A LITTLE CARE",
              "Take a moment for yourself.",
              "For the one who always gives so much.",
              preview
                ? "/products/the-slow-sunday"
                : "/shop?category=body-care",
              "Explore a slower Sunday",
            ],
            [
              "03 / JUST BECAUSE",
              "This reminded me of you.",
              "A thoughtful choice, for no particular occasion.",
              "/gifting",
              "Find your gifting inspiration",
            ],
          ].map(([n, title, text, url, cta]) => (
            <Link key={n} href={url}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <b>{cta} ›</b>
            </Link>
          ))}
        </div>
      </section>
      <section className="packaging-story">
        <div>
          <p className="eyebrow">THOUGHTFUL, DOWN TO THE DETAILS</p>
          <h2>
            Lovely on the outside.
            <br />
            <em>Considered on the inside.</em>
          </h2>
          <p>
            {preview
              ? "Cream paper. A deep berry ribbon. A place for each little ritual. Our packaging direction starts with the pleasure of opening a gift."
              : "Explore the contents and packaging listed on each fixed gift set, and choose the one that feels like them."}
          </p>
          <div className="packaging-spec">
            <span>THE PACKAGING DIRECTION</span>
            <p>
              Soft textures.
              <br />A beautiful first impression.
            </p>
            <small>
              {preview
                ? "Concept packaging · illustrative materials and finish"
                : "Exact packaging is described on each product page."}
            </small>
          </div>
          <Link className="button" href="/shop?category=gift-sets">
            Explore the gift collection ›
          </Link>
        </div>
        <div className="packaging-photo">
          <img
            src={giftPhoto}
            alt={
              preview
                ? "AI-created open gift-box concept showing proposed soak, cream and candle arrangement"
                : gifts[0]?.images.nodes[0].altText || "Decorative folded paper"
            }
            width="1254"
            height="1254"
            loading="lazy"
          />
        </div>
      </section>
      {care.length > 0 && (
        <section className="section care-edit">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SOMETHING FOR THE EVERYDAY</p>
              <h2>
                Little rituals. <em>Lovely possibilities.</em>
              </h2>
            </div>
            <Link className="underlink" href="/shop?category=body-care">
              Explore body care ›
            </Link>
          </div>
          <div className="product-grid">
            {care.map((p) => (
              <ProductCard key={p.id} product={p} preview={preview} />
            ))}
          </div>
        </section>
      )}
      <section className="closing-story">
        <p className="eyebrow">{brand.name}</p>
        <h2>
          The best gifts say:
          <br />
          <em>I thought of you.</em>
        </h2>
        <p>
          A boutique idea for the joy of noticing what makes someone, someone.
        </p>
        <Link className="underlink" href="/about">
          A little about the idea ›
        </Link>
      </section>
    </>
  );
}
