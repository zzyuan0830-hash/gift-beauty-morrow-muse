import { isDesignPreview } from "@/lib/config";
import Link from "next/link";
import brand from "@/config/brand.json";
export const metadata = { title: "Our story" };
export default function About() {
  return (
    <article className="story-page">
      <p className="eyebrow">The idea behind {brand.name}</p>
      <h1>
        Everyday things.
        <br />
        <em>A little more meaning.</em>
      </h1>
      <p className="intro">
        A gift doesn’t have to be grand to be remembered. Sometimes it simply
        says: I know you. I’m thinking of you. This moment matters.
      </p>
      <img
        src={
          isDesignPreview()
            ? "/concepts/gift-open.webp"
            : "/art/ribbon-study.svg"
        }
        alt={
          isDesignPreview()
            ? "AI-created open gift-box concept, not a manufactured product"
            : "Original decorative paper and ribbon study"
        }
        width="1000"
        height="700"
      />
      <div className="prose">
        <h2>Start with a person.</h2>
        <p>
          {brand.name} is built around the idea of thoughtful giving: beauty,
          fragrance and body-care rituals chosen with someone in mind. The
          everyday can be an occasion in its own right.
        </p>
        <h2>Let the details do the talking.</h2>
        <p>
          We want each product page to help you make an informed choice, with
          clear contents, specifications and care information. Choose the
          gesture that feels right for the person receiving it.
        </p>
        <h2>A collection taking shape.</h2>
        <p>
          Our range will grow as individual products are ready. Availability and
          the details of each offering are shown in the collection.
        </p>
        <Link className="button" href="/shop">
          Discover the collection →
        </Link>
      </div>
    </article>
  );
}
