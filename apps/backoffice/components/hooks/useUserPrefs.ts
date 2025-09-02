"use client"
import { useEffect, useMemo, useRef, useState } from "react";

export type Prefs = {
  favorites: string[];
  emoji: Record<string, string>;
  mode: "compact" | "expanded";
};

const LOCAL_KEY = "sidebar.dbprefs.fallback";

export default function useUserPrefs() {
  const [prefs, setPrefs] = useState<Prefs>({ favorites: [], emoji: {}, mode: "compact" });
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load from server; if fails, try local fallback
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/me/prefs", { cache: "no-store" });
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json();
        if (!cancelled) {
          setPrefs(data);
          setLoaded(true);
          try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
        }
      } catch {
        try {
          const raw = localStorage.getItem(LOCAL_KEY);
          if (raw && !cancelled) {
            const data = JSON.parse(raw);
            setPrefs(data);
            setLoaded(true);
          }
        } catch {}
      }
    })();
    return () => { cancelled = true; }
  }, []);

  const save = useMemo(() => (next: Prefs) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await fetch("/api/me/prefs", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(next),
        });
        try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); } catch {}
      } catch {}
    }, 400);
  }, []);

  // setters (optimistic)
  const setMode = (mode: Prefs["mode"]) => setPrefs((p) => { const n = { ...p, mode }; save(n); return n; });
  const toggleFav = (href: string) => setPrefs((p) => {
    const exists = p.favorites.includes(href);
    const favorites = exists ? p.favorites.filter(h => h !== href) : [...p.favorites, href];
    const n = { ...p, favorites }; save(n); return n;
  });
  const setEmoji = (key: string, emoji?: string) => setPrefs((p) => {
    const emojiMap = { ...p.emoji };
    if (!emoji) delete emojiMap[key]; else emojiMap[key] = emoji;
    const n = { ...p, emoji: emojiMap }; save(n); return n;
  });

  return { prefs, loaded, setMode, toggleFav, setEmoji };
}