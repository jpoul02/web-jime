import AskFmDesktop from "@/components/AskFmDesktop";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

export const metadata = {
  title: "Jimena — Ask.fm",
};

export default async function AskPage() {
  const [answersRes, statsRes] = await Promise.all([
    fetch(`${API}/postales/answers-feed?skip=0&limit=10`, { cache: "no-store" }).catch(() => null),
    fetch(`${API}/postales/stats`, { cache: "no-store" }).catch(() => null),
  ]);

  const initialAnswers = answersRes?.ok ? await answersRes.json() : [];
  const initialStats = statsRes?.ok ? await statsRes.json() : null;

  return <AskFmDesktop initialAnswers={initialAnswers} initialStats={initialStats} />;
}
