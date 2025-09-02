"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { groups, IconMap } from "@/components/nav/catalog";
import {
  Home, Shield, Boxes, Factory, Tags, ClipboardList, Package,
  Monitor, Users2, ShoppingCart, Percent, Server, BarChart2,
  Activity, ChevronRight, Circle
} from "lucide-react";
import useUserPrefs from "@/components/hooks/useUserPrefs";

type GroupKey = string;

const GroupIcon: Record<GroupKey, any> = {
  overview: Home,
  admin: Shield,
  master: Boxes,
  suppliers: Factory,
  pricing: Tags,
  po: ClipboardList,
  inventory: Package,
  pos: Monitor,
  crm: Users2,
  orders: ShoppingCart,
  finance: Percent,
  integrations: Server,
  reports: BarChart2,
  ops: Activity,
};

const DEFAULT_EMOJIS: Record<string, string> = {
  overview: "📊", admin: "🔐", master: "🗂️", suppliers: "🏭", pricing: "🏷️",
  po: "🧾", inventory: "📦", pos: "🖥️", crm: "👥", orders: "🛒",
  finance: "💷", integrations: "🔌", reports: "📈", ops: "🛠️",
};

export default function Sidebar({ show }: { show: boolean }) {
  const pathname = usePathname() || "/";
  const [hovered, setHovered] = useState<GroupKey | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { prefs, setEmoji } = useUserPrefs();

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setHovered(null); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={clsx(
        "fixed md:static inset-y-0 left-0 z-30 flex",
        show ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "transition-transform"
      )}
      onMouseLeave={() => setHovered(null)}
    >
      {/* Icon rail */}
      <aside className="w-16 bg-white dark:bg-neutral-900 border-r border-neutral-200/60 dark:border-neutral-800 flex flex-col items-center py-3 gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700" title="Retail Backoffice" />
        <div className="h-px w-8 bg-neutral-200 dark:bg-neutral-800 my-2" />
        <nav className="flex flex-col gap-2">
          {groups.map((g) => {
            const Icon = GroupIcon[g.key] ?? Circle;
            const active = g.items.some(i => pathname === i.href || pathname.startsWith(i.href + "/"));
            const emoji = prefs.emoji[g.key] ?? DEFAULT_EMOJIS[g.key];
            return (
              <button
                key={g.key}
                className={clsx(
                  "relative group w-12 h-12 rounded-xl flex items-center justify-center",
                  "hover:bg-brand-50 dark:hover:bg-neutral-800",
                  active && "bg-brand-50 dark:bg-neutral-800 text-brand-700 dark:text-brand-400"
                )}
                onMouseEnter={() => setHovered(g.key)}
                onFocus={() => setHovered(g.key)}
                title={`${g.title}${emoji ? " " + emoji : ""}`}
              >
                <span
                  className={clsx(
                    "absolute left-1 w-1 h-6 rounded-full bg-brand-500 transition-opacity",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-30"
                  )}
                />
                {emoji
                  ? <span className="text-xl leading-none">{emoji}</span>
                  : Icon
                    ? <Icon size={20}/>
                    : <span className="text-sm font-semibold">{g.title?.[0] ?? "•"}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Flyout panel */}
      <div className="relative">
        {hovered && (
          <div
            className="absolute left-0 top-0 bottom-0 translate-x-0 md:-translate-x-px w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200/60 dark:border-neutral-800 shadow-xl"
            onMouseEnter={() => setHovered(hovered)}
          >
            <FlyoutContent
              groupKey={hovered}
              pathname={pathname}
              onPickEmoji={(e) => { setEmoji(hovered, e); }}
              onClearEmoji={() => { setEmoji(hovered, undefined); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FlyoutContent({
  groupKey, pathname, onPickEmoji, onClearEmoji
}:{groupKey:GroupKey, pathname:string, onPickEmoji:(e:string)=>void, onClearEmoji:()=>void}) {
  const g = groups.find(x => x.key === groupKey);
  const [showPicker, setShowPicker] = useState(false);
  const [custom, setCustom] = useState("");

  if (!g) return null;

  const quick: string[] = ["📊","🏠","🧭","🛒","🏷️","📦","🏬","🧾","💳","👥","🧰","🚚","🎁","📈","🧮","⚙️","🔐","🧪","🗂️","💷","🔌","🛠️"];

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="font-medium">{g.title}</div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs underline text-neutral-600 dark:text-neutral-300"
            onClick={() => setShowPicker(v => !v)}
            title="Set icon"
          >
            Set icon
          </button>
          <ChevronRight size={16} className="text-neutral-400" />
        </div>
      </div>

      {showPicker && (
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="mb-2 text-xs text-neutral-500">Pick an emoji (no icon names needed):</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {quick.map(e => (
              <button key={e} onClick={()=>{ onPickEmoji(e); setShowPicker(false); }} className="text-xl p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                {e}
              </button>
            ))}
            <button onClick={()=>{ onClearEmoji(); setShowPicker(false); }} className="text-xs px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 ml-2">
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={custom}
              onChange={e=>setCustom(e.target.value)}
              placeholder="Or paste any emoji here…"
              className="input flex-1"
            />
            <button className="btn" onClick={()=>{ if(custom.trim()){ onPickEmoji(custom.trim()); setShowPicker(false); setCustom(""); } }}>
              Use
            </button>
          </div>
        </div>
      )}

      <div className="p-2 overflow-auto">
        <div className="grid grid-cols-1 gap-1">
          {g.items.map((it) => {
            // resolve icon safely for list rows
            // @ts-ignore
            const Icon = (IconMap as any)[(it as any).icon] ?? Circle;
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <Link
                key={it.href}
                href={it.href}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-neutral-800",
                  active && "bg-brand-50 dark:bg-neutral-800 text-brand-700 dark:text-brand-400"
                )}
              >
                <Icon size={18} />
                <span className="flex-1">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}