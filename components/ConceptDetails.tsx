import GiftSetStory from "./GiftSetStory";
import { giftStory } from "@/lib/gift-stories";
import Link from "next/link";
import { conceptInfo } from "@/lib/design-catalog";
export default function ConceptDetails({ handle }: { handle: string }) {
  const p = conceptInfo(handle);
  if (!p) return null;
  if (giftStory(handle)) return <GiftSetStory handle={handle} />;
  return (
    <>
      <section className="concept-direction">
        <div>
          <p className="eyebrow">THE IDEA, IN A LITTLE MORE DETAIL</p>
          <h2>
            Made for
            <br />
            <em>{p.occasion.replace(/^For /, "").toLowerCase()}.</em>
          </h2>
          <p>{p.target.size}</p>
          <small>Illustrative sizes for the concept collection.</small>
        </div>
        <div className="detail-notes">
          {p.contents.map(([title, text], i) => (
            <article key={title}>
              <span>0{i + 1}</span>
              <h3>{title.replace(" concept", "")}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="sampling-panel">
        <img
          src="/concepts/wrap-ribbon.svg"
          alt="Original packaging illustration; proposed construction, not a manufactured product"
          width="800"
          height="600"
        />
        <div>
          <p className="eyebrow">THE PLEASURE OF OPENING</p>
          <h2>
            The shape of
            <br />
            <em>something thoughtful.</em>
          </h2>
          <p>{p.presentation}</p>
          <p className="quiet">
            This is a product and packaging design direction. Final materials,
            dimensions, formula and delivery details are not yet confirmed.
          </p>
          <Link className="underlink" href="/gifting">
            Find their kind of gift ›
          </Link>
        </div>
      </section>
    </>
  );
}
