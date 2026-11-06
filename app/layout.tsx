import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Wordmark from "@/components/Wordmark";
import brand from "@/config/brand.json";
import { storeState, fixtureMode } from "@/lib/config";
import launch from "@/config/launch.json";
import "./globals.css";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: `${brand.name} — ${brand.pageTitle}`,
      template: `%s | ${brand.name}`,
    },
    description: brand.description,
    robots: {
      index: storeState().mode === "live",
      follow: storeState().mode === "live",
    },
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = storeState();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <div className="announcement">
          {fixtureMode()
            ? "LOCAL TEST FIXTURES · NOT REAL PRODUCTS · NO PAYMENTS"
            : state.mode === "design"
              ? "Design preview · concept products · no payments"
              : state.mode === "test"
                ? "TEST STORE · TEST PAYMENTS ONLY"
                : !state.connected
                  ? "Our first chapter is coming · Shopping is not open yet"
                  : "Thoughtful gifts. Everyday rituals."}
        </div>
        <Header preview={state.mode === "design"} />
        <main id="main">{children}</main>
        <footer>
          <div className="footer-brand">
            <Link className="wordmark" href="/">
              <Wordmark />
            </Link>
            <p>
              For the people who make
              <br />
              the everyday feel special.
            </p>
          </div>
          <nav aria-label="Footer">
            <Link href="/shop">The collection</Link>
            <Link href="/gifting">Gifting information</Link>
            <Link href="/about">Our story</Link>
            <Link href="/faq">Your questions</Link>
          </nav>
          <nav aria-label="Policies">
            <Link href="/policies/shipping">Shipping</Link>
            <Link href="/policies/returns">Returns</Link>
            <Link href="/policies/privacy">Privacy</Link>
            <Link href="/policies/terms">Terms</Link>
          </nav>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {brand.name}
            </span>
            <span>United States · USD</span>
            {state.mode === "live" && (
              <>
                <span>{launch.businessName}</span>
                <a href={`mailto:${launch.supportEmail}`}>
                  {launch.supportEmail}
                </a>
              </>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
