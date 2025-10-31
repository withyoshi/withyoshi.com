"use client";

export function MessageItemError({ error }: { error: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm shadow-lg backdrop-blur-sm">
        <div className="font-medium text-red-800">Error occurred:</div>
        <div className="mt-1 text-red-700">{error}</div>
      </div>
    </div>
  );
}
