"use client";

export function MessageItemLoading() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl border border-white/30 bg-white/20 p-2 shadow-lg backdrop-blur-sm">
        <div className="flex gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-mint-400 [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-mint-400 [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-mint-400" />
        </div>
      </div>
    </div>
  );
}
