import InstaFeed from "@/components/InstaFeed";
import type { InstaPost } from "@/types/feed";

function normalizeMediaUrl(rawUrl: string | null | undefined, apiBase: string): string | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  const normalizedBase = apiBase.replace(/\/$/, "");
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function getInitialFeed(): Promise<InstaPost[]> {
  const api =
    process.env.NEXT_PUBLIC_API_URL ??
    "https://api-web-jime-jime.up.railway.app";

  try {
    const res = await fetch(`${api}/postales/feed?skip=0&limit=10`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: InstaPost[] = await res.json();
    return data.map((post) => ({
      ...post,
      profile_photo_url: normalizeMediaUrl(post.profile_photo_url, api),
      photos: (post.photos ?? []).map((photo) => ({
        ...photo,
        photo_url: normalizeMediaUrl(photo.photo_url, api) ?? "",
      })),
    }));
  } catch {
    return [];
  }
}

export default async function AmigosPage() {
  const initialPosts = await getInitialFeed();
  return <InstaFeed initialPosts={initialPosts} />;
}
