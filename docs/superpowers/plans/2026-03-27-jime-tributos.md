# jime-postales Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 14 birthday postal app where people submit a profile photo, name, answers to random questions, a video, and extra photos — then view all tributes in a polaroid gallery.

**Architecture:** Next.js 14 App Router. `/form` is a client-side multi-step wizard managing all state locally, uploading to `jime-api` on final submit. `/galeria` fetches all postales server-side and renders a polaroid wall; clicking a card loads the full postal detail.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Google Fonts (Press Start 2P, VT323, Nunito, Caveat), fetch API

---

## File Map

```
jime-postales/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: fonts, global styles
│   │   ├── globals.css             # Tailwind base + CP color vars
│   │   ├── page.tsx                # / — landing page
│   │   ├── form/
│   │   │   └── page.tsx            # /form — multi-step form (client)
│   │   └── galeria/
│   │       ├── page.tsx            # /galeria — polaroid wall (server)
│   │       └── [id]/
│   │           └── page.tsx        # /galeria/[id] — postal detail (server)
│   ├── components/
│   │   ├── CPCard.tsx              # Reusable Club Penguin-style card wrapper
│   │   ├── AskQuestion.tsx         # Question bubble + textarea
│   │   ├── StepProfile.tsx         # Step 1: photo upload + name
│   │   ├── StepQuestions.tsx       # Step 2: random questions + "otra pregunta" btn
│   │   ├── StepVideo.tsx           # Step 3: video upload
│   │   ├── StepPhotos.tsx          # Step 4: photo grid upload
│   │   ├── PolaroidCard.tsx        # Single polaroid (gallery)
│   │   └── PostalDetail.tsx       # Full postal view
│   ├── lib/
│   │   └── api.ts                  # Typed fetch wrappers for jime-api
│   └── types/
│       └── index.ts                # Shared TS types
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## Task 1: Scaffold Next.js project

**Files:**
- Create all scaffold files

- [ ] **Step 1: Create the project**

```bash
npx create-next-app@14 jime-postales \
  --typescript --tailwind --app --src-dir \
  --no-eslint --import-alias "@/*"
cd jime-postales
```

- [ ] **Step 2: Install Google Fonts in next.config.mjs (already included via next/font)**

No extra packages needed — `next/font/google` is built-in.

- [ ] **Step 3: Create .env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 4: Replace src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --cp-blue: #2896e0;
  --cp-dark-blue: #1a6fb5;
  --cp-navy: #0d4a8a;
  --cp-sky: #c8eeff;
  --cp-sky-light: #e8f7ff;
}

body {
  background: linear-gradient(180deg, #c8eeff 0%, #e8f7ff 40%, #f5faff 100%);
  min-height: 100vh;
}
```

- [ ] **Step 5: Update tailwind.config.ts to include CP colors and fonts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cp: {
          blue: "#2896e0",
          "dark-blue": "#1a6fb5",
          navy: "#0d4a8a",
          sky: "#c8eeff",
          "sky-light": "#e8f7ff",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        vt: ["VT323", "monospace"],
        nunito: ["Nunito", "sans-serif"],
        caveat: ["Caveat", "cursive"],
      },
      boxShadow: {
        cp: "0 4px 0 #0d4a8a",
        "cp-hover": "0 6px 0 #0d4a8a",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Update src/app/layout.tsx with Google Fonts**

```typescript
import type { Metadata } from "next";
import { Press_Start_2P, VT323, Nunito, Caveat } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });
const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--font-vt" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export const metadata: Metadata = { title: "Feliz Cumple Jime ❄" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${pressStart2P.variable} ${vt323.variable} ${nunito.variable} ${caveat.variable} font-nunito`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verify dev server runs**

```bash
npm run dev
# Expected: ready on http://localhost:3000
```

---

## Task 2: Types + API client

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create src/types/index.ts**

```typescript
export interface Question {
  id: number;
  text: string;
}

export interface AnswerIn {
  question_id: number;
  answer_text: string;
}

export interface PhotoOut {
  id: number;
  photo_url: string;
  order: number;
}

export interface AnswerOut {
  id: number;
  question_id: number;
  answer_text: string;
  question: Question;
}

export interface PostalListItem {
  id: number;
  name: string;
  profile_photo_url: string | null;
  created_at: string;
}

export interface PostalDetail {
  id: number;
  name: string;
  profile_photo_url: string | null;
  video_url: string | null;
  created_at: string;
  answers: AnswerOut[];
  photos: PhotoOut[];
}

export interface FormState {
  name: string;
  profilePhotoFile: File | null;
  answers: AnswerIn[];
  videoFile: File | null;
  photoFiles: File[];
  shownQuestionIds: number[];
}
```

- [ ] **Step 2: Create src/lib/api.ts**

```typescript
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getRandomQuestions(count: number, exclude: number[]): Promise<Question[]> {
  const params = new URLSearchParams({ count: String(count) });
  if (exclude.length) params.set("exclude", exclude.join(","));
  const res = await fetch(`${API}/questions/random?${params}`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}

export async function getPostales(): Promise<PostalListItem[]> {
  const res = await fetch(`${API}/postales`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch postales");
  return res.json();
}

export async function getPostal(id: number): Promise<PostalDetail> {
  const res = await fetch(`${API}/postales/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Postal not found");
  return res.json();
}

export async function submitPostal(state: FormState): Promise<PostalDetail> {
  const form = new FormData();
  form.append("name", state.name);
  form.append("answers", JSON.stringify(state.answers));
  if (state.profilePhotoFile) form.append("profile_photo", state.profilePhotoFile);
  if (state.videoFile) form.append("video", state.videoFile);
  state.photoFiles.forEach((f) => form.append("photos", f));
  const res = await fetch(`${API}/postales`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Failed to submit postal");
  return res.json();
}

// re-export types so consumers can import from one place
export type { Question, PostalListItem, PostalDetail, FormState, AnswerIn } from "@/types";
```

---

## Task 3: Base UI components

**Files:**
- Create: `src/components/CPCard.tsx`
- Create: `src/components/AskQuestion.tsx`

- [ ] **Step 1: Create src/components/CPCard.tsx**

```typescript
// Club Penguin-style card: blue gradient header + white body with solid shadow
interface CPCardProps {
  step?: string;
  title: string;
  children: React.ReactNode;
}

export default function CPCard({ step, title, children }: CPCardProps) {
  return (
    <div className="bg-white border-[3px] border-cp-blue rounded-2xl shadow-cp overflow-hidden mb-4">
      <div className="bg-gradient-to-r from-cp-dark-blue to-cp-blue px-4 py-2 flex items-center gap-2">
        {step && <span className="font-pixel text-[7px] text-blue-200">{step}</span>}
        <span className="font-pixel text-[7px] text-white">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/AskQuestion.tsx**

```typescript
interface AskQuestionProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
}

export default function AskQuestion({ question, value, onChange }: AskQuestionProps) {
  return (
    <div className="mb-3">
      <div className="bg-gradient-to-r from-cp-navy to-cp-dark-blue rounded-t-xl px-4 py-3">
        <p className="text-white text-sm font-bold leading-snug">💬 {question}</p>
      </div>
      <div className="border-2 border-cp-blue border-t-0 rounded-b-xl">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="responde aquí..."
          rows={3}
          className="w-full px-4 py-3 text-sm text-blue-900 placeholder-blue-300 resize-none outline-none rounded-b-xl font-nunito"
        />
      </div>
    </div>
  );
}
```

---

## Task 4: Landing page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace src/app/page.tsx**

```typescript
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* CP Header bar */}
      <div className="w-full max-w-md bg-gradient-to-r from-cp-dark-blue to-cp-blue rounded-2xl border-[3px] border-cp-blue shadow-cp p-6 text-center mb-6">
        <p className="font-pixel text-[10px] text-white leading-loose tracking-wide">★ FELIZ CUMPLE JIME ★</p>
        <p className="font-vt text-2xl text-blue-200 mt-1">❄ deja tu tributo para ella ❄</p>
      </div>

      <div className="text-6xl mb-6 animate-bounce">🐧</div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/form"
          className="block text-center bg-gradient-to-r from-cp-dark-blue to-cp-blue text-white font-pixel text-[8px] py-4 rounded-xl shadow-cp hover:-translate-y-1 hover:shadow-cp-hover transition-all border-[2px] border-cp-navy"
        >
          💌 dejar mi tributo
        </Link>
        <Link
          href="/galeria"
          className="block text-center bg-white text-cp-dark-blue font-pixel text-[8px] py-4 rounded-xl shadow-cp hover:-translate-y-1 transition-all border-[3px] border-cp-blue"
        >
          🖼️ ver tributos
        </Link>
      </div>

      <p className="font-vt text-lg text-blue-400 mt-8">hecho con ♡ · 2025</p>
    </main>
  );
}
```

---

## Task 5: StepProfile component

**Files:**
- Create: `src/components/StepProfile.tsx`

- [ ] **Step 1: Create src/components/StepProfile.tsx**

```typescript
"use client";
import { useRef } from "react";
import CPCard from "./CPCard";

interface StepProfileProps {
  name: string;
  profilePhotoFile: File | null;
  onNameChange: (v: string) => void;
  onPhotoChange: (f: File) => void;
}

export default function StepProfile({ name, profilePhotoFile, onNameChange, onPhotoChange }: StepProfileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = profilePhotoFile ? URL.createObjectURL(profilePhotoFile) : null;

  return (
    <CPCard step="01" title="tu perfil">
      <div className="flex flex-col items-center gap-4">
        {/* Avatar with IG gradient ring */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-lg hover:scale-105 transition-transform"
        >
          <div className="w-full h-full rounded-full border-[3px] border-white bg-cp-sky overflow-hidden flex items-center justify-center text-4xl">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : "🐧"}
          </div>
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onPhotoChange(e.target.files[0]); }} />
        <p className="font-vt text-lg text-blue-400">click para subir tu foto</p>

        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="tu nombre o nickname..."
          className="w-full border-b-2 border-cp-blue bg-transparent text-center font-nunito font-bold text-cp-navy text-base outline-none py-2 placeholder-blue-300"
        />
      </div>
    </CPCard>
  );
}
```

---

## Task 6: StepQuestions component

**Files:**
- Create: `src/components/StepQuestions.tsx`

- [ ] **Step 1: Create src/components/StepQuestions.tsx**

```typescript
"use client";
import { useState, useEffect } from "react";
import CPCard from "./CPCard";
import AskQuestion from "./AskQuestion";
import { getRandomQuestions } from "@/lib/api";
import type { Question, AnswerIn } from "@/types";

interface StepQuestionsProps {
  answers: AnswerIn[];
  onAnswersChange: (answers: AnswerIn[]) => void;
  shownQuestionIds: number[];
  onShownIdsChange: (ids: number[]) => void;
}

const TOTAL_QUESTIONS = 15;

export default function StepQuestions({ answers, onAnswersChange, shownQuestionIds, onShownIdsChange }: StepQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [allShown, setAllShown] = useState(false);

  // Load initial 5 questions
  useEffect(() => {
    if (questions.length === 0) loadMore(5);
  }, []);

  async function loadMore(count = 1) {
    setLoading(true);
    try {
      const newQs = await getRandomQuestions(count, shownQuestionIds);
      const updatedIds = [...shownQuestionIds, ...newQs.map((q) => q.id)];
      setQuestions((prev) => [...prev, ...newQs]);
      onShownIdsChange(updatedIds);
      if (updatedIds.length >= TOTAL_QUESTIONS) setAllShown(true);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(questionId: number, text: string) {
    const existing = answers.find((a) => a.question_id === questionId);
    if (existing) {
      onAnswersChange(answers.map((a) => a.question_id === questionId ? { ...a, answer_text: text } : a));
    } else {
      onAnswersChange([...answers, { question_id: questionId, answer_text: text }]);
    }
  }

  return (
    <CPCard step="02" title="cuéntale algo a jime">
      {questions.map((q) => (
        <AskQuestion
          key={q.id}
          question={q.text}
          value={answers.find((a) => a.question_id === q.id)?.answer_text ?? ""}
          onChange={(text) => handleAnswer(q.id, text)}
        />
      ))}

      {!allShown && (
        <button
          type="button"
          onClick={() => loadMore(1)}
          disabled={loading}
          className="w-full mt-2 py-3 border-2 border-cp-blue rounded-xl font-pixel text-[7px] text-cp-dark-blue hover:bg-cp-sky transition-colors disabled:opacity-50"
        >
          {loading ? "cargando..." : "💬 llenar otra pregunta"}
        </button>
      )}
    </CPCard>
  );
}
```

---

## Task 7: StepVideo component

**Files:**
- Create: `src/components/StepVideo.tsx`

- [ ] **Step 1: Create src/components/StepVideo.tsx**

```typescript
"use client";
import { useRef, useState } from "react";
import CPCard from "./CPCard";

const MAX_DURATION_S = 90;

interface StepVideoProps {
  videoFile: File | null;
  onVideoChange: (f: File | null) => void;
}

export default function StepVideo({ videoFile, onVideoChange }: StepVideoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function handleFile(file: File) {
    setError("");
    const url = URL.createObjectURL(file);
    const vid = document.createElement("video");
    vid.src = url;
    vid.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (vid.duration > MAX_DURATION_S) {
        setError(`El video no puede durar más de 1:30 (duración: ${Math.round(vid.duration)}s)`);
        onVideoChange(null);
      } else {
        onVideoChange(file);
      }
    };
  }

  return (
    <CPCard step="03" title="tu video para ella">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-[3px] border-dashed border-cp-blue rounded-xl p-8 text-center cursor-pointer hover:bg-cp-sky transition-colors"
      >
        {videoFile ? (
          <>
            <div className="text-4xl mb-2">🎬</div>
            <p className="font-vt text-xl text-cp-dark-blue">{videoFile.name}</p>
            <p className="text-sm text-blue-400 mt-1">click para cambiar</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-2">🎬</div>
            <p className="font-vt text-xl text-cp-dark-blue">subí un video corto</p>
            <p className="text-sm text-blue-400 mt-1">MP4 / MOV · máx 1:30 min</p>
          </>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-2 font-nunito">{error}</p>}
      <input ref={inputRef} type="file" accept="video/mp4,video/quicktime" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
    </CPCard>
  );
}
```

---

## Task 8: StepPhotos component

**Files:**
- Create: `src/components/StepPhotos.tsx`

- [ ] **Step 1: Create src/components/StepPhotos.tsx**

```typescript
"use client";
import { useRef } from "react";
import CPCard from "./CPCard";

const MAX_PHOTOS = 6;

interface StepPhotosProps {
  photoFiles: File[];
  onPhotosChange: (files: File[]) => void;
}

export default function StepPhotos({ photoFiles, onPhotosChange }: StepPhotosProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(newFiles: FileList) {
    const arr = Array.from(newFiles);
    const combined = [...photoFiles, ...arr].slice(0, MAX_PHOTOS);
    onPhotosChange(combined);
  }

  function removePhoto(index: number) {
    onPhotosChange(photoFiles.filter((_, i) => i !== index));
  }

  return (
    <CPCard step="04" title="fotos con jime">
      <div className="grid grid-cols-3 gap-1">
        {photoFiles.map((f, i) => (
          <div key={i} className="relative aspect-square">
            <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover rounded-lg border-2 border-cp-blue" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
            >✕</button>
          </div>
        ))}
        {photoFiles.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square border-[2px] border-dashed border-cp-blue rounded-lg flex items-center justify-center text-2xl text-cp-blue hover:bg-cp-sky transition-colors"
          >+</button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }} />
    </CPCard>
  );
}
```

---

## Task 9: /form page — multi-step orchestrator

**Files:**
- Create: `src/app/form/page.tsx`

- [ ] **Step 1: Create src/app/form/page.tsx**

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import StepProfile from "@/components/StepProfile";
import StepQuestions from "@/components/StepQuestions";
import StepVideo from "@/components/StepVideo";
import StepPhotos from "@/components/StepPhotos";
import { submitPostal } from "@/lib/api";
import type { FormState } from "@/types";

const TOTAL_STEPS = 4;

export default function FormPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<FormState>({
    name: "",
    profilePhotoFile: null,
    answers: [],
    videoFile: null,
    photoFiles: [],
    shownQuestionIds: [],
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance() {
    if (step === 1) return state.name.trim().length > 0;
    if (step === 2) return state.answers.some((a) => a.answer_text.trim().length > 0);
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const postal = await submitPostal(state);
      router.push(`/galeria/${postal.id}`);
    } catch {
      alert("Hubo un error al enviar. Intentá de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < step ? "bg-cp-blue" : "bg-blue-100"}`} />
        ))}
      </div>

      {step === 1 && (
        <StepProfile
          name={state.name}
          profilePhotoFile={state.profilePhotoFile}
          onNameChange={(v) => update("name", v)}
          onPhotoChange={(f) => update("profilePhotoFile", f)}
        />
      )}
      {step === 2 && (
        <StepQuestions
          answers={state.answers}
          onAnswersChange={(a) => update("answers", a)}
          shownQuestionIds={state.shownQuestionIds}
          onShownIdsChange={(ids) => update("shownQuestionIds", ids)}
        />
      )}
      {step === 3 && (
        <StepVideo
          videoFile={state.videoFile}
          onVideoChange={(f) => update("videoFile", f)}
        />
      )}
      {step === 4 && (
        <StepPhotos
          photoFiles={state.photoFiles}
          onPhotosChange={(files) => update("photoFiles", files)}
        />
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-4">
        {step > 1 && (
          <button onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 border-[3px] border-cp-blue rounded-xl font-pixel text-[7px] text-cp-dark-blue hover:bg-cp-sky transition-colors">
            ← atrás
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="flex-1 py-3 bg-gradient-to-r from-cp-dark-blue to-cp-blue text-white rounded-xl font-pixel text-[7px] shadow-cp disabled:opacity-40 hover:-translate-y-0.5 transition-all"
          >
            siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-gradient-to-r from-cp-dark-blue to-cp-blue text-white rounded-xl font-pixel text-[7px] shadow-cp disabled:opacity-40 hover:-translate-y-0.5 transition-all"
          >
            {submitting ? "enviando..." : "🐧 enviar tributo"}
          </button>
        )}
      </div>
    </main>
  );
}
```

---

## Task 10: Gallery — polaroid wall

**Files:**
- Create: `src/components/PolaroidCard.tsx`
- Create: `src/app/galeria/page.tsx`

- [ ] **Step 1: Create src/components/PolaroidCard.tsx**

```typescript
import Link from "next/link";
import type { PostalListItem } from "@/types";

const ROTATIONS = ["rotate-[-3deg]", "rotate-[2deg]", "rotate-[-1deg]", "rotate-[3deg]", "rotate-[-2deg]"];

interface PolaroidCardProps {
  postal: PostalListItem;
  index: number;
}

export default function PolaroidCard({ postal, index }: PolaroidCardProps) {
  const rot = ROTATIONS[index % ROTATIONS.length];
  return (
    <Link href={`/galeria/${postal.id}`} className={`block ${rot} hover:rotate-0 hover:scale-105 transition-transform duration-200`}>
      <div className="bg-white p-2 pb-8 shadow-md border border-gray-200" style={{ width: 130 }}>
        <div className="w-full aspect-square bg-gradient-to-br from-cp-sky to-blue-200 overflow-hidden flex items-center justify-center">
          {postal.profile_photo_url ? (
            <img src={postal.profile_photo_url} alt={postal.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">🐧</span>
          )}
        </div>
        <p className="font-caveat text-center text-gray-600 text-sm mt-2 truncate">{postal.name} ♡</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create src/app/galeria/page.tsx**

```typescript
import { getPostales } from "@/lib/api";
import PolaroidCard from "@/components/PolaroidCard";
import Link from "next/link";

export default async function GaleriaPage() {
  const tributes = await getPostales();

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-cp-dark-blue to-cp-blue rounded-2xl border-[3px] border-cp-blue shadow-cp p-5 text-center mb-8">
          <p className="font-pixel text-[9px] text-white leading-loose">tributos para jime ❄</p>
          <p className="font-vt text-xl text-blue-200">{tributes.length} persona{tributes.length !== 1 ? "s" : ""} la quieren 💙</p>
        </div>

        {tributes.length === 0 ? (
          <p className="text-center font-vt text-2xl text-blue-400">aún no hay tributos · sé el primero 🐧</p>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {postales.map((t, i) => <PolaroidCard key={t.id} postal={t} index={i} />)}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/form" className="inline-block bg-cp-blue text-white font-pixel text-[7px] px-6 py-3 rounded-xl shadow-cp hover:-translate-y-0.5 transition-all">
            + dejar mi tributo
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

## Task 11: Gallery — postal detail page

**Files:**
- Create: `src/components/PostalDetail.tsx`
- Create: `src/app/galeria/[id]/page.tsx`

- [ ] **Step 1: Create src/components/PostalDetail.tsx**

```typescript
import type { PostalDetail } from "@/types";

export default function PostalDetailView({ postal }: { postal: PostalDetail }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Profile header (IG style) */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex-shrink-0">
          <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-cp-sky flex items-center justify-center text-4xl">
            {postal.profile_photo_url ? (
              <img src={postal.profile_photo_url} alt="" className="w-full h-full object-cover" />
            ) : "🐧"}
          </div>
        </div>
        <div>
          <p className="font-nunito font-black text-cp-navy text-xl">{postal.name}</p>
          <p className="font-vt text-lg text-blue-400">
            {new Date(postal.created_at).toLocaleDateString("es", { day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Answers (ask.fm style) */}
      {postal.answers.length > 0 && (
        <div className="bg-white border-[3px] border-cp-blue rounded-2xl shadow-cp overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-cp-dark-blue to-cp-blue px-4 py-2">
            <span className="font-pixel text-[7px] text-white">respuestas</span>
          </div>
          <div className="p-4">
            {postal.answers.map((a) => (
              <div key={a.id} className="mb-4">
                <div className="bg-gradient-to-r from-cp-navy to-cp-dark-blue rounded-t-xl px-4 py-3">
                  <p className="text-white text-sm font-bold leading-snug">💬 {a.question.text}</p>
                </div>
                <div className="border-2 border-cp-blue border-t-0 rounded-b-xl px-4 py-3">
                  <p className="font-nunito text-sm text-blue-900 whitespace-pre-wrap">{a.answer_text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos (IG grid) */}
      {postal.photos.length > 0 && (
        <div className="bg-white border-[3px] border-cp-blue rounded-2xl shadow-cp overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-cp-dark-blue to-cp-blue px-4 py-2">
            <span className="font-pixel text-[7px] text-white">fotos</span>
          </div>
          <div className="grid grid-cols-3 gap-[2px] p-[2px]">
            {postal.photos.map((p) => (
              <div key={p.id} className="aspect-square">
                <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video */}
      {postal.video_url && (
        <div className="bg-white border-[3px] border-cp-blue rounded-2xl shadow-cp overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-cp-dark-blue to-cp-blue px-4 py-2">
            <span className="font-pixel text-[7px] text-white">video</span>
          </div>
          <div className="p-3">
            <video src={postal.video_url} controls className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create src/app/galeria/[id]/page.tsx**

```typescript
import { getPostal } from "@/lib/api";
import PostalDetailView from "@/components/PostalDetail";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PostalPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  let postal;
  try {
    postal = await getPostal(id);
  } catch {
    notFound();
  }

  return (
    <main>
      <div className="max-w-lg mx-auto px-4 pt-4">
        <Link href="/galeria" className="font-pixel text-[7px] text-cp-dark-blue hover:underline">← galería</Link>
      </div>
      <PostalDetailView postal={postal} />
    </main>
  );
}
```

---

## Task 12: Link from web-jime

**Files:**
- Modify: `web-jime/src/components/MainMenu.tsx` (or wherever the main menu links are)

- [ ] **Step 1: Add link to jime-postales in web-jime's main menu**

In `web-jime/src/components/MainMenu.tsx`, locate the navigation buttons/links and add:

```typescript
// Add this link alongside the existing ones
// Replace YOUR_TRIBUTOS_URL with the deployed URL of jime-postales
<a
  href={process.env.NEXT_PUBLIC_TRIBUTOS_URL ?? "http://localhost:3001"}
  target="_blank"
  rel="noopener noreferrer"
  className="/* match existing button styles */"
>
  💌 Tributos para Jime
</a>
```

- [ ] **Step 2: Add env var to web-jime**

In `web-jime/.env.local`:
```
NEXT_PUBLIC_TRIBUTOS_URL=https://jime-postales.up.railway.app
```

- [ ] **Step 3: Commit**

```bash
cd web-jime
git add src/components/MainMenu.tsx .env.local
git commit -m "feat: add link to jime-postales from main menu"
```
