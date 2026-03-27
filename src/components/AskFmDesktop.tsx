"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, Bell, Mail, Search, MessageCircle, Heart, Share2, User, Users, BookOpen, Gamepad2, Video } from "lucide-react";

type QACard = { id: number; question: string; answer: string; time: string; likes: number; image: string | null };
type PendingQ = { id: number; text: string; time: string };

const qaCards: QACard[] = [
  { id: 1, question: "Si alguien hiciera una estatua tuya, ¿qué pose elegirías?",    answer: "La pose de Arnold Schwarzenegger viajando en el tiempo obvio 😎",                                                         time: "hace 5 minutos",  likes: 12, image: null },
  { id: 2, question: "Si fueras un helado, ¿de qué sabor serías?",                   answer: "Premium Churned Reduced Fat No Sugar Added Tin Roof Sundae. Sí, ese es un sabor real.",                                    time: "hace 15 minutos", likes: 8,  image: null },
  { id: 3, question: "¿Cuál es tu serie de TV favorita?",                             answer: "Batman: The Animated Series. No acepto debate.",                                                                            time: "hace 47 minutos", likes: 24, image: "/askfm-card-img.png" },
];

const pendingQuestions: PendingQ[] = [
  { id: 1, text: "¿Hay algo que veas que nadie más nota?",               time: "hace menos de un minuto" },
  { id: 2, text: "¿Cuál fue la decisión más inteligente que has tomado?", time: "hace 15 minutos" },
  { id: 3, text: "¿Qué está de moda hoy?",                               time: "hace 47 minutos" },
];

const stats = [
  { num: "142", label: "Respuestas" },
  { num: "89",  label: "Likes" },
  { num: "56",  label: "Amigos" },
];

export default function AskFmDesktop() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EAEDF2] font-[family-name:var(--font-geist-sans)]">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="w-full shrink-0 h-14 flex items-center justify-between px-6 bg-[#3B5998]">
        {/* Logo */}
        <Image src="/ask-jime-logo.png" quality={100} alt="Ask.fm Jime" width={120} height={40} className="object-contain" />

        {/* Nav icons */}
        <nav className="flex items-center gap-5">
          <Link href="/"     title="Inicio"    className="opacity-80 hover:opacity-100 transition-opacity"><Home     size={20} color="#FFFFFF" /></Link>
          <Link href="#"     title="Sobre Mi"  className="opacity-80 hover:opacity-100 transition-opacity"><User     size={20} color="#FFFFFF" /></Link>
          <Link href="#"     title="Amigos"    className="opacity-80 hover:opacity-100 transition-opacity"><Users    size={20} color="#FFFFFF" /></Link>
          <Link href="#"     title="Historia"  className="opacity-80 hover:opacity-100 transition-opacity"><BookOpen size={20} color="#FFFFFF" /></Link>
          <Link href="#"     title="Juegos"    className="opacity-80 hover:opacity-100 transition-opacity"><Gamepad2 size={20} color="#FFFFFF" /></Link>
          <Link href="/skype" title="Skype"   className="opacity-80 hover:opacity-100 transition-opacity"><Video    size={20} color="#FFFFFF" /></Link>
          <div className="w-px h-5 bg-white/30 mx-1" />
          <button className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"><Bell size={20} color="#FFFFFF" /></button>
          <button className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"><Mail size={20} color="#FFFFFF" /></button>
        </nav>

        {/* Search */}
        <div className="flex items-center gap-2 w-[280px] h-[34px] rounded-[17px] bg-[#2E4A80] px-[14px]">
          <Search size={16} color="#8899BB" />
          <span className="text-[#8899BB] text-[13px]">Buscar personas...</span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#6B8CC7]" />
          <span className="text-white text-[13px] font-semibold">jimepenguin</span>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex justify-center gap-6 py-6 px-20">

        {/* ── Feed ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 w-[580px]">

          {/* Ask box */}
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A76A8] shrink-0" />
            <div className="flex-1 h-[38px] rounded-[19px] bg-[#F0F2F5] flex items-center px-4">
              <span className="text-[#999999] text-sm">Hazme una pregunta...</span>
            </div>
            <button className="h-9 rounded-[18px] bg-[#3B5998] px-5 flex items-center justify-center shrink-0 hover:bg-[#2d4a80] transition-colors">
              <span className="text-white text-[13px] font-semibold">Preguntar</span>
            </button>
          </div>

          {/* QA Cards */}
          {qaCards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg flex flex-col">
              {/* Question */}
              <div className="flex items-center gap-[10px] px-4 py-3">
                <MessageCircle size={18} color="#3B5998" className="shrink-0" />
                <span className="text-[#333333] text-sm font-semibold">{card.question}</span>
              </div>

              {/* Image */}
              {card.image && (
                <div className="relative w-full h-[220px]">
                  <Image src={card.image} alt="" fill className="object-cover" />
                </div>
              )}

              {/* Answer */}
              <div className="flex mt-4 gap-3 px-4 pb-3">
                <div className="w-9 h-9 rounded-full bg-[#4A76A8] shrink-0" />
                <div className="flex flex-col flex-1 gap-1">
                  <span className="text-[#3B5998] text-[13px] font-bold">jimepenguin</span>
                  <span className="text-[#333333] text-sm">{card.answer}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 px-4 pb-3">
                <span className="text-[#999999] text-[11px]">{card.time}</span>
                <div className="flex items-center gap-4">
                  <button className="cursor-pointer"><Heart size={16} color="#CC4455" /></button>
                  <span className="text-[#999999] text-xs">{card.likes}</span>
                  <button className="cursor-pointer"><Share2 size={16} color="#999999" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Sidebar ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 w-[340px]">

          {/* Profile card */}
          <div className="bg-white rounded-lg flex flex-col items-center gap-3 py-5 px-4">
            <div className="w-20 h-20 rounded-full bg-[#4A76A8] flex items-center justify-center">
              <User size={40} color="#FFFFFF" />
            </div>
            <span className="text-[#333333] text-lg font-bold">jimepenguin</span>
            <span className="text-[#777777] text-[13px] text-center">
              Pingüino gamer, fan de Club Penguin y la nostalgia 2000s
            </span>
            <div className="flex w-full justify-around pt-2">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-0.5">
                  <span className="text-[#3B5998] text-base font-bold">{s.num}</span>
                  <span className="text-[#999999] text-[11px]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending questions */}
          <div className="bg-white rounded-lg flex flex-col">
            <div className="flex items-center justify-between pt-[14px] px-4 pb-[10px]">
              <span className="text-[#333333] text-sm font-bold">Preguntas sin responder</span>
              <div className="h-[22px] rounded-[11px] bg-[#3B5998] px-[10px] flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">7</span>
              </div>
            </div>
            {pendingQuestions.map((q) => (
              <div key={q.id}>
                <div className="h-px bg-[#EAEDF2]" />
                <div className="flex flex-col gap-1 py-3 px-4">
                  <span className="text-[#333333] text-[13px] font-semibold">{q.text}</span>
                  <span className="text-[#999999] text-[11px]">{q.time}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
