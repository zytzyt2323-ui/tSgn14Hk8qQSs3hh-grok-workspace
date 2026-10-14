import type { PointerEvent as ReactPointerEvent } from "react";
import { cn, initials } from "@/lib/utils";
import type { KitId, Player } from "@/lib/types";

const KIT_CLASS: Record<KitId, string> = {
  home: "token-kit-home",
  away: "token-kit-away",
  third: "token-kit-third",
  keeper: "token-kit-keeper",
};

export function PlayerToken({
  player,
  kit,
  selected,
  dragging,
  compact,
  ghost,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  player: Player;
  kit: KitId;
  selected?: boolean;
  dragging?: boolean;
  compact?: boolean;
  ghost?: boolean;
  onPointerDown?: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove?: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (e: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  const kitClass = player.prefRole === "GK" ? KIT_CLASS.keeper : KIT_CLASS[kit];
  const size = compact ? "size-9" : "size-11 sm:size-12";

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        "flex flex-col items-center gap-0.5 touch-none select-none",
        dragging && "scale-110 z-20",
        selected && "z-10",
        ghost && "pointer-events-none opacity-40",
      )}
      style={{ touchAction: "none" }}
    >
      <span
        className={cn(
          "relative grid place-items-center overflow-hidden rounded-full border-2 font-display font-semibold tabular-nums shadow-[0_4px_12px_rgba(0,0,0,0.35)]",
          size,
          kitClass,
          ghost
            ? "border-dashed border-primary/70"
            : selected
              ? "border-primary ring-2 ring-primary/40"
              : "border-line/70",
        )}
      >
        {player.photo ? (
          <img
            src={player.photo}
            alt=""
            className="absolute inset-0 size-full object-cover"
            draggable={false}
          />
        ) : (
          <span className={cn("leading-none", compact ? "text-sm" : "text-base")}>
            {player.number ?? initials(player.name)}
          </span>
        )}
        {player.photo && player.number != null ? (
          <span className="absolute inset-x-0 bottom-0 bg-bg/55 text-[10px] leading-4 text-fg">
            {player.number}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "max-w-16 truncate rounded-sm bg-bg/70 px-1 text-center font-medium text-fg backdrop-blur-sm",
          compact ? "text-[10px]" : "text-[11px] sm:text-xs",
        )}
      >
        {player.name}
      </span>
    </button>
  );
}
