"use client"

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

const Schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});

type FormData = z.infer<typeof Schema>;

export default function LoginPage() {
  const search = useSearchParams();
  const authError = search.get("error"); // e.g. CredentialsSignin
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({ resolver: zodResolver(Schema), defaultValues: {
    email: "admin@example.com",
    password: "admin123",
  }});

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await signIn("credentials", {
        redirect: true,
        callbackUrl: "/",
        ...data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] grid place-items-center p-4">
      <div className="w-full max-w-xl grid md:grid-cols-2 overflow-hidden rounded-2xl shadow-soft border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {/* Brand / side panel */}
        <div className="hidden md:flex flex-col justify-center gap-4 p-8 bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <div>
            <div className="text-2xl font-semibold">Retail Backoffice</div>
            <div className="text-white/80 text-sm">Sign in to manage retailers, stores, items & pricing.</div>
          </div>
          <ul className="text-sm space-y-2 text-white/90">
            <li>• Secure role-based access</li>
            <li>• Audit logs & data isolation</li>
            <li>• Promotions & loyalty (roadmap)</li>
          </ul>
        </div>

        {/* Form */}
        <div className="p-6 md:p-8">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <h1 className="text-xl font-semibold">Welcome back</h1>
              <p className="text-sm text-neutral-500">Sign in to your account</p>
            </div>

            {authError && (
              <div className="text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2">
                Sign in failed. Check your email & password.
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  autoComplete="username"
                  className="input pl-10"
                  placeholder="you@company.com"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <button
              className="btn btn-primary w-full disabled:opacity-60"
              disabled={loading}
            >
              <LogIn size={18} className="mr-2" />
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="underline text-neutral-600 dark:text-neutral-300"
                onClick={() => {
                  setValue("email", "admin@example.com");
                  setValue("password", "admin123");
                }}
              >
                Use demo credentials
              </button>
              <a className="underline text-neutral-600 dark:text-neutral-300" href="/forgot-password">
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}