"use client";
import clsx from "clsx";
import React from "react";

type Variant = "primary" | "secondary" | "success" | "warning" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ComponentProps<any> & { as?: any; variant?: Variant; size?: Size }) {
  const base = "inline-flex items-center justify-center rounded-2xl font-medium transition focus:outline-none focus:ring disabled:opacity-60 disabled:pointer-events-none";
  const sizes: Record<Size, string> = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-3.5 py-2",
    lg: "text-base px-4.5 py-2.5",
  };
  const variants: Record<Variant, string> = {
    primary:  "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300",
    secondary:"bg-sky-600 text-white hover:bg-sky-700 focus:ring-2 focus:ring-sky-300",
    success:  "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300",
    warning:  "bg-amber-500 text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-300",
    danger:   "bg-rose-600 text-white hover:bg-rose-700 focus:ring-2 focus:ring-rose-300",
    ghost:    "bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
  };
  return <Tag className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
}
