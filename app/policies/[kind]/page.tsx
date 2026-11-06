import { notFound } from "next/navigation";
import Link from "next/link";
import { previewPolicies } from "@/lib/preview-policies";
import { shopInfo } from "@/lib/shopify";
import { storeState } from "@/lib/config";
import { cleanHtml } from "@/lib/content";
const policies = {
  shipping: ["Shipping", "shippingPolicy"],
  returns: ["Returns", "refundPolicy"],
  privacy: ["Privacy", "privacyPolicy"],
  terms: ["Terms", "termsOfService"],
} as const;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  return { title: policies[kind as keyof typeof policies]?.[0] || "Policy" };
}
export default async function Policy({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  const config = policies[kind as keyof typeof policies];
  if (!config) notFound();
  if (storeState().mode === "design") {
    const content = previewPolicies[kind as keyof typeof previewPolicies];
    return (
      <article className="story-page">
        <p className="eyebrow">CONCEPT STORE INFORMATION</p>
        <h1>{config[0]}.</h1>
        <p className="intro">{content.intro}</p>
        <div className="prose">
          {content.sections.map(([heading, text]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
        <Link className="underlink" href="/faq">
          More about the concept store ›
        </Link>
      </article>
    );
  }
  let policy = null;
  let error = false;
  if (storeState().connected)
    try {
      policy = (await shopInfo())[config[1]];
    } catch {
      error = true;
    }
  return (
    <article className="story-page">
      <p className="eyebrow">The details that matter</p>
      <h1>{config[0]}.</h1>
      {policy ? (
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: cleanHtml(policy.body) }}
        />
      ) : (
        <div className="notice">
          <h2>
            {error
              ? "This information is temporarily unavailable."
              : "We’re preparing this information."}
          </h2>
          <p>
            {error
              ? "Please try again shortly."
              : "Our policy will be published before shopping opens. We are not accepting orders yet."}
          </p>
        </div>
      )}
    </article>
  );
}
