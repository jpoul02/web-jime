import { Figtree } from "next/font/google";
import SpotifyArtistPage from "@/components/SpotifyArtistPage";

export const metadata = {
  title: "Jimena Sings — Música",
  description: "La página musical de Jime.",
};

// Figtree — geométrica redondeada, la alternativa libre más fiel a Circular de Spotify
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-spotify",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function MusicaPage() {
  return (
    <div className={figtree.variable} style={{ height: "100vh" }}>
      <SpotifyArtistPage />
    </div>
  );
}
