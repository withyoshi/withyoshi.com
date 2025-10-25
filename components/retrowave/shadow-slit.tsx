interface ShadowSlitProps {
  fill?: string;
  className?: string;
  direction?: "top" | "bottom";
}

export default function ShadowSlit({
  fill = "#00afb9",
  className = "",
  direction = "bottom",
}: ShadowSlitProps) {
  const topClasses = "-top-4 -scale-y-100";
  const bottomClasses = "top-4";
  const directionClasses = direction === "top" ? topClasses : bottomClasses;

  return (
    <div
      className={`overflow-hidden pointer-events-none [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] ${className}`}
    >
      <svg
        aria-hidden="true"
        className={`w-full h-full blur-md relative opacity-75 ${directionClasses}`}
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        <path d="M0,40 Q50,10 100,40 Z" fill={fill} />
      </svg>
    </div>
  );
}
