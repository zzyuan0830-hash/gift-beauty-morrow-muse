import GiftingView from "@/components/GiftingView";
import { storeState } from "@/lib/config";
import { catalog } from "@/lib/storefront";
import type { Product } from "@/lib/types";
export const metadata = {
  title: "The gifting edit",
  description:
    "Find a thoughtful gift by their favorite rituals and your budget.",
};
export default async function Gifting({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = storeState(),
    preview = state.mode === "design";
  let all: Product[] = [],
    failed = false;
  if (state.connected)
    try {
      all = await catalog();
    } catch {
      failed = true;
    }
  return (
    <GiftingView
      all={all}
      params={await searchParams}
      preview={preview}
      failed={failed}
    />
  );
}
