"use client";

type RetroSkyProps = {
  activePreset: string;
  className?: string;
};

// Default gradient presets - just 2 colors each
const defaultPresets: { [key: string]: [string, string] } = {
  "dark-space": ["#000", "#000"],
  "cyan-dream": ["#000", "#18a7be"],
  "purple-dawn": ["#6d28d9", "#3b82f6"],
};

export default function RetroSky({
  activePreset,
  className = "",
}: RetroSkyProps) {
  // Compute colors directly from preset
  const preset = defaultPresets[activePreset];
  const firstColor = preset?.[0] || "#000";
  const secondColor = preset?.[1] || "#000";

  return (
    <div
      className={`absolute inset-0 transition-colors duration-1000 ease-in-out ${className}`}
      style={{ backgroundColor: secondColor }}
    >
      {/* Pseudo-element with gradient mask */}
      <div
        className="absolute inset-0 transition-colors duration-1000 ease-in-out [mask:linear-gradient(to_bottom,black_0%,transparent_100%)]"
        style={{ backgroundColor: firstColor }}
      />
    </div>
  );
}
