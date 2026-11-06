import Bag from "@/components/Bag";
import Unavailable from "@/components/Unavailable";
import { storeState } from "@/lib/config";
export const metadata = {
  title: "Your bag",
  robots: { index: false, follow: false },
};
export default function BagPage() {
  return (
    <div className="page">
      <div className="page-heading">
        <p className="eyebrow">Thoughtfully chosen</p>
        <h1>Your bag.</h1>
      </div>
      {storeState().connected ? (
        <Bag preview={storeState().mode === "design"} />
      ) : (
        <Unavailable />
      )}
    </div>
  );
}
