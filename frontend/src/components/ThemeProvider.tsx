"use client";
import React, { useEffect, useState } from "react";
import { useUIStore } from "@/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("amplizo-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("amplizo-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (!savedTheme && systemPrefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
