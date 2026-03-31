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

function normalizePostMedia(post: InstaPost, apiBase: string): InstaPost {
  return {
    ...post,
    profile_photo_url: normalizeMediaUrl(post.profile_photo_url, apiBase),
    photos: (post.photos ?? []).map((photo) => ({
      ...photo,
      photo_url: normalizeMediaUrl(photo.photo_url, apiBase) ?? "",
    })),
  };
}

async function getFeedPosts(): Promise<InstaPost[]> {
  const api =
    process.env.NEXT_PUBLIC_API_URL ??
    "https://api-web-jime-production.up.railway.app";

  try {
    const listRes = await fetch(`${api}/postales`, { next: { revalidate: 60 } });
    if (!listRes.ok) return [];
    const list: { id: number }[] = await listRes.json();

    const details = await Promise.all(
      list.map((p) =>
        fetch(`${api}/postales/${p.id}`, { next: { revalidate: 60 } }).then(
          (r) => r.json() as Promise<InstaPost>
        )
      )
    );

    return details
      .map((post) => normalizePostMedia(post, api))
      .filter((p) => p.photos && p.photos.some((photo) => photo.photo_url));
  } catch {
    return [];
  }
}

export default async function AmigosPage() {
  const posts = await getFeedPosts();
  return <InstaFeed posts={posts} />;
}
