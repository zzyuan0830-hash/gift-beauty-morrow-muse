import Link from "next/link";
import { conceptInfo } from "@/lib/design-catalog";
import { giftStory } from "@/lib/gift-stories";

export default function GiftSetStory({ handle }: { handle: string }) {
  const p = conceptInfo(handle),
    story = giftStory(handle);
  if (!p || !story) return null;
  return (
    <div className="gift-story">
      <section className="gift-contents" aria-labelledby="contents-heading">
        <header>
          <p className="eyebrow">01 / THE LITTLE THINGS INSIDE</p>
          <h2 id="contents-heading">
            {story.heading}
            <br />
            <em>{story.subheading}</em>
          </h2>
          <p>{story.intro}</p>
        </header>
        <div className="gift-contents-layout">
          <figure>
            <img
              src={`/concepts/${story.asset}.webp`}
              srcSet={`/concepts/${story.asset}-640.webp 640w, /concepts/${story.asset}.webp 1254w`}
              sizes="(max-width: 700px) 88vw, 50vw"
              width="1254"
              height="1254"
              loading="lazy"
              alt={`${p.name}: AI concept of the closed presentation box beside its ${p.contents.length} contents`}
            />
            <figcaption>
              The collection, unboxed · AI concept artwork
            </figcaption>
          </figure>
          <div className="gift-item-list">
            {p.contents.map(([title], i) => (
              <article key={title}>
                <span className="gift-item-number">0{i + 1}</span>
                <div>
                  <p className="eyebrow">
                    {story.items[i].size} / PROPOSED SIZE
                  </p>
                  <h3>{title.replace(" concept", "")}</h3>
                  <p>{story.items[i].text}</p>
                </div>
              </article>
            ))}
            <p className="quiet">
              Contents and sizes are illustrative. These are design concepts,
              not products offered for sale.
            </p>
          </div>
        </div>
      </section>
      <section className="gift-packaging" aria-labelledby="packaging-heading">
        <div>
          <p className="eyebrow">02 / BEFORE THE FIRST RITUAL</p>
          <h2 id="packaging-heading">
            {story.packHeading}
            <br />
            <em>{story.packAccent}</em>
          </h2>
          <p>{p.presentation}</p>
          <dl className="packaging-notes">
            <div>
              <dt>The palette</dt>
              <dd>{story.palette}</dd>
            </div>
            <div>
              <dt>The opening</dt>
              <dd>{story.opening}</dd>
            </div>
            <div>
              <dt>The occasion</dt>
              <dd>{p.occasion.replace(/^For /, "")}</dd>
            </div>
          </dl>
          <p className="quiet">
            A packaging direction, with final materials and construction still
            to be developed.
          </p>
        </div>
        <figure>
          <div className="gift-detail-crop">
            <img
              src={`/concepts/${p.asset}.webp`}
              width="1254"
              height="1254"
              loading="lazy"
              alt={`${p.name}: close view of the tissue, vessels and box finish within the original AI opening concept`}
            />
          </div>
          <figcaption>
            A closer look · detail from the opening concept
          </figcaption>
        </figure>
      </section>
      <aside className="gift-occasion">
        <p className="eyebrow">03 / A GESTURE THAT FEELS LIKE THEM</p>
        <h2>{story.gesture}</h2>
        <p>{story.occasion}</p>
        <Link className="underlink" href="/gifting">
          Explore the gifting edit ›
        </Link>
      </aside>
    </div>
  );
}
