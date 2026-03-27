"use client";

import { useState } from "react";
import NintendoDSIntro from "./NintendoDSIntro";
import ClubPenguinHome from "./ClubPenguinHome";

export default function AppShell() {
  const [introGone, setIntroGone] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("introSeen") === "1"
  );

  function handleIntroDone() {
    sessionStorage.setItem("introSeen", "1");
    setIntroGone(true);
  }

  return (
    <>
      {!introGone && <NintendoDSIntro onDone={handleIntroDone} />}
      {introGone && <ClubPenguinHome />}
    </>
  );
}
