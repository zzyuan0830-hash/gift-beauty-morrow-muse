export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { storeState, settings } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  if (storeState().mode !== "live")
    return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/bag", "/api/", "/build-a-gift", "/design-notes"],
    },
    sitemap: `${settings().origin}/sitemap.xml`,
  };
}
