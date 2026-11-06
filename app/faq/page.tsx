import { isDesignPreview } from "@/lib/config";
import Link from "next/link";
export const metadata = { title: "Your questions" };
export default function FAQ() {
  if (isDesignPreview())
    return (
      <article className="story-page">
        <p className="eyebrow">A LITTLE CLARITY</p>
        <h1>Your questions.</h1>
        <p className="intro">
          Everything you need to explore this concept collection.
        </p>
        <div className="detail-accordions">
          {[
            [
              "Can I buy these products?",
              "This is a concept store. You can browse the full collection and try the preview bag, but there is no payment, order or delivery. The prices shown are illustrative US dollar amounts.",
            ],
            [
              "Are the product images photographs?",
              "The product scenes are original AI-created concepts. Packaging illustrations are labeled separately. They express a creative direction and do not show manufactured or available merchandise.",
            ],
            [
              "What is included in each gift?",
              "Each product page describes its proposed contents, sizes and packaging. These are concept specifications, not confirmed formulas or physical products. Fixed gift sets are shown as complete selections.",
            ],
            [
              "How does the gifting edit work?",
              "Choose a preferred type of ritual and a budget. The guide filters the current collection and lists matching selections from lower to higher price. Change or reset your choices at any time.",
            ],
            [
              "Can I customize a box or add a note?",
              "This edition focuses on individual products and fixed gift sets. Custom boxes, personalized messages and additional wrapping are not offered.",
            ],
            [
              "Will my preview bag be saved?",
              "Only concept identifiers and quantities are saved in this browser. Clearing local storage removes them. If storage is unavailable, a visible message explains that the bag lasts only for the current page session.",
            ],
            [
              "Do I need an account or payment details?",
              "No account is needed. This preview does not ask for a shipping address, card number or gift recipient details. It does not create an order or send confirmation messages.",
            ],
          ].map(([question, answer], i) => (
            <details key={question} open={i === 0}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        <Link className="button" href="/gifting">
          Find a thoughtful gift →
        </Link>
      </article>
    );
  return (
    <article className="story-page">
      <p className="eyebrow">A little clarity</p>
      <h1>Your questions.</h1>
      <div className="detail-accordions">
        {isDesignPreview() && (
          <details open>
            <summary>Can I buy the products in this design preview?</summary>
            <p>
              No. These are product design concepts with illustrative prices.
              You can explore the collection and preview a bag, but there is no
              checkout, payment or order.
            </p>
          </details>
        )}
        <details open>
          <summary>When can I place an order?</summary>
          <p>
            Shopping is available only when the collection is open and an item
            is available to add to your bag. A “coming soon” or maintenance
            message means we are not accepting purchases.
          </p>
        </details>
        <details>
          <summary>What is included in a gift set?</summary>
          <p>
            Each fixed gift set has its own contents and packaging details on
            the product page. Check these before ordering; custom substitutions
            are not offered.
          </p>
        </details>
        <details>
          <summary>Can I add a message or custom wrapping?</summary>
          <p>
            Personalized messages, custom-built boxes and additional wrapping
            are not currently available.
          </p>
        </details>
        <details>
          <summary>What currency will I pay in?</summary>
          <p>
            This storefront is for the United States and uses US dollars. Review
            the final amount, delivery charges and any applicable taxes at
            checkout.
          </p>
        </details>
        <details>
          <summary>How do payment and order confirmation work?</summary>
          <p>
            Checkout is handled by Shopify. Available payment methods appear
            there. Adding something to your bag does not reserve it or create a
            paid order. Refer to the checkout confirmation and subsequent order
            notification for your order status.
          </p>
        </details>
        <details>
          <summary>Where can I check shipping or returns?</summary>
          <p>
            Read the <Link href="/policies/shipping">shipping information</Link>{" "}
            and <Link href="/policies/returns">returns policy</Link>. If either
            is unavailable, purchasing remains closed.
          </p>
        </details>
        <details>
          <summary>Will my bag be saved?</summary>
          <p>
            {isDesignPreview()
              ? "The preview bag saves concept identifiers and quantities in this browser only. Clearing local storage removes it. If storage is unavailable, the bag works only for the current page session. No address or payment details are collected."
              : "A necessary browser cookie links to your Shopify bag for up to 30 days. Shopify may expire it earlier. Clearing cookies or changing browsers can remove access; no payment details are stored in this storefront’s browser storage."}
          </p>
        </details>
      </div>
    </article>
  );
}
