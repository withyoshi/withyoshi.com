type ShadowSlitProps = {
  fill?: string;
  className?: string;
  direction?: "top" | "bottom";
};

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
      className={`pointer-events-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] ${className}`}
    >
      <svg
        aria-hidden="true"
        className={`relative h-full w-full opacity-75 blur-md ${directionClasses}`}
        preserveAspectRatio="none"
        viewBox="0 0 100 40"
      >
        <path d="M0,40 Q50,10 100,40 Z" fill={fill} />
      </svg>
    </div>
  );
}
