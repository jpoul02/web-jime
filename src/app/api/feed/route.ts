import { NextRequest, NextResponse } from "next/server";
import type { InstaPost } from "@/types/feed";

const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api-web-jime-production.up.railway.app";

function normalizeMediaUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  const base = API.replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skip = searchParams.get("skip") ?? "0";
  const limit = searchParams.get("limit") ?? "10";

  try {
    const res = await fetch(
      `${API}/postales/feed?skip=${skip}&limit=${limit}`,
      { cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json([]);
    const data: InstaPost[] = await res.json();
    const normalized = data.map((post) => ({
      ...post,
      profile_photo_url: normalizeMediaUrl(post.profile_photo_url),
      photos: (post.photos ?? []).map((photo) => ({
        ...photo,
        photo_url: normalizeMediaUrl(photo.photo_url) ?? "",
      })),
    }));
    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json([]);
  }
}
