import { NextResponse } from "next/server";
import { storeState } from "@/lib/config";
export function GET() {
  const state = storeState();
  return NextResponse.json(
    { status: "ok", store: state.mode },
    { headers: { "Cache-Control": "no-store" } },
  );
}
