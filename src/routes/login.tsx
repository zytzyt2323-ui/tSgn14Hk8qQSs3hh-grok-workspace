import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { PitchField } from "@/components/pitch-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
} from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { FORMATION_BY_ID, slotsForSide } from "@/lib/formations";
import { safePath } from "@/lib/share";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === "string" ? { redirect: search.redirect } : {},
  component: Login,
});

function Login() {
  const { redirect } = Route.useSearch();
  const next = safePath(redirect);
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return <div className="min-h-dvh bg-bg" />;
  }
  if (user) {
    const join = next.match(/^\/join\/([A-Za-z0-9]+)$/i);
    if (join) {
      return <Navigate to="/join/$code" params={{ code: join[1]! }} />;
    }
    return <Navigate to="/" />;
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "球员",
        });
        if (res.error) throw new Error(res.error.message || "注册失败");
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message || "登录失败");
      }
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
      setBusy(false);
    }
  }

  const home = slotsForSide(FORMATION_BY_ID["4-3-3"]!, "home");
  const away = slotsForSide(FORMATION_BY_ID["4-3-3"]!, "away");

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-bg lg:flex lg:items-center lg:justify-center lg:p-12">
        <div className="w-full max-w-sm">
          <PitchField>
            {home.map((s, i) => (
              <span
                key={`h-${s.role}-${i}`}
                className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/80 bg-kit-home/90 font-display text-[10px] font-semibold text-kit-home-ink grid place-items-center"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                {s.role}
              </span>
            ))}
            {away.map((s, i) => (
              <span
                key={`a-${s.role}-${i}`}
                className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/50 bg-kit-away font-display text-[10px] font-semibold text-kit-away-ink grid place-items-center"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                {s.role}
              </span>
            ))}
          </PitchField>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-2xl font-semibold tracking-wide text-fg no-underline">
            Pitchboard
          </Link>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
            {next.startsWith("/join/") ? "登录后加入战术板" : "登录后开始排阵"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            主客两队同场，拖站位、拉压迫圈、画跑位。把链接发给朋友就能一起改。
          </p>

          {authEnabled ? (
            <div className="mt-8 flex flex-col gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  onClick={() => signIn(p.providerId, { callbackURL: next })}
                >
                  使用 {p.label} 继续
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">登录暂未开启。</p>
          )}

          <div className="my-6 flex items-center gap-3 text-xs text-subtle">
            <span className="h-px flex-1 bg-border" />
            或使用邮箱
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="flex flex-col gap-3" onSubmit={(e) => void onEmail(e)}>
            {mode === "signup" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="name">名字</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的名字"
                />
              </div>
            ) : null}
            <div className="grid gap-1.5">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? "请稍候…" : mode === "signup" ? "创建账号" : "登录"}
            </Button>
          </form>

          <button
            type="button"
            className="mt-4 text-sm text-muted hover:text-fg"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
            }}
          >
            {mode === "signup" ? "已有账号？去登录" : "没有账号？注册一个"}
          </button>
        </div>
      </section>
    </main>
  );
}
