import type { Metadata } from "next";
import ShopView from "@/components/ShopView";
import { catalog } from "@/lib/storefront";
import { storeState } from "@/lib/config";
import Unavailable from "@/components/Unavailable";
export const metadata: Metadata = { title: "The collection" };
export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, typeof v === "string" ? v : ""]),
  );
  let all;
  try {
    all = storeState().connected ? await catalog() : null;
  } catch {
    return (
      <div className="page">
        <h1>The collection</h1>
        <Unavailable error />
      </div>
    );
  }
  return (
    <ShopView
      all={all}
      params={params}
      preview={storeState().mode === "design"}
    />
  );
}
