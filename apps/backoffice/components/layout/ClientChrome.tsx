"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";

export default function ClientChrome({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const isAuth = pathname === "/login" || pathname === "/forgot-password" || pathname.startsWith("/auth/");

  if (isAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
        <CommandPalette />
        {children}
      </main>
    );
  }

  return (
    <>
      {/* <Topbar onMenu={() => setOpen((v) => !v)} /> */}
      <div className="flex">
        <Sidebar show={open} />
        <main className="flex-1 p-4 md:p-6">
          <CommandPalette />
          {children}
        </main>
      </div>
    </>
  );
}
