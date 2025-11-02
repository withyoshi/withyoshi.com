"use client";

export function TipPill({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="whitespace-nowrap cursor-pointer rounded-md border border-mint-700/50 px-2 py-1.5 text-mint-700 text-xs hover:border-mint-600/75 hover:bg-mint-600/10"
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-1.5">{children}</span>
    </button>
  );
}
