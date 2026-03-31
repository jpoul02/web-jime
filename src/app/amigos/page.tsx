import InstaFeed from "@/components/InstaFeed";
import type { InstaPost } from "@/types/feed";

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

    return details.filter((p) => p.photos && p.photos.length > 0);
  } catch {
    return [];
  }
}

export default async function AmigosPage() {
  const posts = await getFeedPosts();
  return <InstaFeed posts={posts} />;
}
