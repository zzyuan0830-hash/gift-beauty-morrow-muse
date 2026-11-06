import Link from "next/link";
import { giftSelection, giftPreferences, giftBudgets } from "@/lib/gifting";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import Unavailable from "./Unavailable";
export default function GiftingView({
  all,
  params,
  preview,
  failed = false,
}: {
  all: Product[];
  params: Record<string, string | string[] | undefined>;
  preview: boolean;
  failed?: boolean;
}) {
  const selection = giftSelection(all, params);
  const hero = preview
    ? {
        url: "/concepts/gift-open.webp",
        altText:
          "AI-created gift-box concept with bath soak, cream and candle; not physical merchandise",
      }
    : all[0]?.images.nodes[0];
  return (
    <>
      <section className="gift-guide-hero">
        <div className="guide-intro">
          <p className="eyebrow">
            THE GIFTING EDIT / A THOUGHTFUL PLACE TO START
          </p>
          <h1>
            Begin with them.
            <br />
            <em>The gift will follow.</em>
          </h1>
          <p>
            The friend who makes time for everyone. The one who notices the
            little things. A familiar ritual can be a lovely way to say: I see
            you.
          </p>
          <a className="button" href="#gift-finder">
            Find their kind of lovely ↓
          </a>
        </div>
        <figure>
          <img
            src={hero?.url || "/art/ribbon-study.svg"}
            alt={hero?.altText || "Original decorative ribbon illustration"}
            width="1000"
            height="1000"
            fetchPriority="high"
          />
          <figcaption>
            {preview
              ? "The art of opening · concept imagery"
              : "A considered collection"}
          </figcaption>
        </figure>
      </section>
      <section
        className="section gift-finder"
        id="gift-finder"
        aria-labelledby="finder-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">TWO LITTLE DETAILS</p>
            <h2 id="finder-heading">
              What feels <em>like them?</em>
            </h2>
          </div>
          <p className="quiet">
            Choose a ritual and a budget.
            <br />
            Selections are ordered by price.
          </p>
        </div>
        <form className="finder-form" action="/gifting#gift-finder">
          <label>
            Their kind of ritual
            <select name="preference" defaultValue={selection.preference}>
              {Object.entries(giftPreferences).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Your budget
            <select name="budget" defaultValue={selection.budget}>
              {Object.entries(giftBudgets).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className="button">Find a thoughtful gift</button>
          <Link className="underlink" href="/gifting#gift-finder">
            Reset choices
          </Link>
        </form>
        {failed || all.length === 0 ? (
          <Unavailable error={failed} />
        ) : (
          <>
            <p className="result-count">
              {selection.products.length}{" "}
              {selection.products.length === 1
                ? "thoughtful find"
                : "thoughtful finds"}
              {preview ? " · illustrative USD prices" : ""}
            </p>
            {selection.products.length ? (
              <div className="product-grid">
                {selection.products.map((p) => (
                  <ProductCard key={p.id} product={p} preview={preview} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>A little more room to explore.</h3>
                <p>Try a wider budget or a different ritual.</p>
                <Link className="button outline" href="/gifting#gift-finder">
                  Explore all gifts
                </Link>
              </div>
            )}
          </>
        )}
      </section>
      <section className="guide-notes section" aria-labelledby="giving-heading">
        <div>
          <p className="eyebrow">THE QUIET ART OF GIVING</p>
          <h2 id="giving-heading">
            A little thought.
            <br />
            <em>A lasting gesture.</em>
          </h2>
        </div>
        <div className="detail-notes">
          <article>
            <span>01 / NOTICE</span>
            <h3>Start with their everyday.</h3>
            <p>
              A favorite scent, a slow Sunday, a moment to themselves. Choose a
              direction that belongs in their world.
            </p>
          </article>
          <article>
            <span>02 / CONSIDER</span>
            <h3>Let the details guide you.</h3>
            <p>
              Explore the contents, sizes and packaging on each product page. A
              smaller, personal choice can feel just as thoughtful.
            </p>
          </article>
          <article>
            <span>03 / KEEP IT SIMPLE</span>
            <h3>One considered selection.</h3>
            <p>
              Our edit brings together individual rituals and fixed gift sets.
              Browse the complete collection if you would like a little more
              inspiration.
            </p>
          </article>
        </div>
      </section>
      <section className="closing-story">
        <p className="eyebrow">A NOTE ON THIS COLLECTION</p>
        <h2>
          Thoughtful, down to <em>the details.</em>
        </h2>
        <p>
          {preview
            ? "Explore complete gift concepts and individual rituals. Prices, contents and packaging are illustrative; no products are offered for sale."
            : "Fixed sets include the contents and packaging listed on their product pages. Custom assembly, personalized notes and extra wrapping are not offered."}
        </p>
        <Link className="underlink" href="/faq">
          A little clarity before you choose ›
        </Link>
      </section>
    </>
  );
}
