"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Video, HelpCircle, Music } from "lucide-react";

const NAV = [
  { href: "/",       label: "Inicio",  Icon: Home        },
  { href: "/amigos", label: "Amigos",  Icon: Users       },
  { href: "/skype",  label: "Skype",   Icon: Video       },
  { href: "/ask",    label: "Ask.fm",  Icon: HelpCircle  },
  { href: "/musica", label: "Música",  Icon: Music       },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] flex items-stretch"
      style={{
        height: 60,
        background: "#0B1D42",
        borderTop: "2px solid #1a3a6e",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-opacity"
            style={{ textDecoration: "none", opacity: active ? 1 : 0.5 }}
          >
            <Icon size={22} color={active ? "#00DDFF" : "#FFFFFF"} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{
              fontSize: 9,
              fontWeight: active ? 700 : 400,
              color: active ? "#00DDFF" : "#FFFFFF",
              letterSpacing: 0.3,
              fontFamily: "var(--font-geist-sans)",
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
