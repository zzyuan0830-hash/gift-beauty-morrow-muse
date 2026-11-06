import brand from "@/config/brand.json";
export default function Wordmark({ tagline = false }: { tagline?: boolean }) {
  return (
    <>
      {brand.wordmarkFirst} <i>{brand.wordmarkJoiner}</i> {brand.wordmarkLast}
      {tagline && <span>{brand.tagline}</span>}
    </>
  );
}
