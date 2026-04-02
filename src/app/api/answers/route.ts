import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skip = searchParams.get("skip") ?? "0";
  const limit = searchParams.get("limit") ?? "10";

  try {
    const [answersRes, statsRes] = await Promise.all([
      fetch(`${API}/postales/answers-feed?skip=${skip}&limit=${limit}`, { cache: "no-store" }),
      skip === "0" ? fetch(`${API}/postales/stats`, { cache: "no-store" }) : Promise.resolve(null),
    ]);

    if (!answersRes.ok) return NextResponse.json({ answers: [], stats: null });
    const answers = await answersRes.json();
    const stats = statsRes?.ok ? await statsRes.json() : null;

    return NextResponse.json({ answers, stats });
  } catch {
    return NextResponse.json({ answers: [], stats: null });
  }
}
