import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressPhoto } from "@/lib/photo";
import { ROLE_LABEL, ROLES, type Role } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

export type PlayerDraft = {
  name: string;
  number: string;
  prefRole: Role;
  photo: string | null;
};

export function PlayerForm({
  initial,
  submitLabel,
  pending,
  onSubmit,
}: {
  initial?: Partial<PlayerDraft>;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (draft: PlayerDraft) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [number, setNumber] = useState(initial?.number ?? "");
  const [prefRole, setPrefRole] = useState<Role>(initial?.prefRole ?? "CM");
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      setError(null);
      const data = await compressPhoto(file);
      setPhoto(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片处理失败");
    }
  }

  return (
    <form
      className="mt-4 flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
          setError("请填写姓名");
          return;
        }
        onSubmit({ name: trimmed, number, prefRole, photo });
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-elevated text-sm font-medium"
        >
          {photo ? (
            <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span>{name ? initials(name) : <Camera className="size-5 text-muted" />}</span>
          )}
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium">头像</p>
          <p className="text-xs text-muted">点击圆形上传照片，会自动裁成方形。</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="player-name">姓名</Label>
        <Input
          id="player-name"
          value={name}
          maxLength={24}
          placeholder="例如：陈浩"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="player-num">号码</Label>
          <Input
            id="player-num"
            inputMode="numeric"
            value={number}
            placeholder="10"
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="player-role">位置</Label>
          <select
            id="player-role"
            value={prefRole}
            onChange={(e) => setPrefRole(e.target.value as Role)}
            className="h-11 rounded-sm border border-border bg-elevated px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r} · {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" disabled={pending} className={cn("mt-1")}>
        {pending ? "保存中…" : submitLabel}
      </Button>
    </form>
  );
}
