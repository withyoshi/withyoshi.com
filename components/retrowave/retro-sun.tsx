import type React from "react";

type SunPreset = {
  sunColorPrimary: string;
  sunColorSecondary: string;
  glowColor: string;
  size: string;
  posX: string;
  posY: string;
};

type RetroSunProps = {
  className?: string;
  preset?: "white" | "pink" | "none";
};

// Preset configurations
const SUN_PRESETS: Record<string, SunPreset> = {
  white: {
    sunColorPrimary: "#8adcd3",
    sunColorSecondary: "#0f172a",
    glowColor: "#14b8a6",
    size: "1.1",
    posX: "-50%",
    posY: "50%",
  },
  pink: {
    sunColorPrimary: "#f472b6",
    sunColorSecondary: "#f97316",
    glowColor: "#f472b6",
    size: "1.5",
    posX: "5%",
    posY: "40%",
  },
  none: {
    sunColorPrimary: "transparent",
    sunColorSecondary: "transparent",
    glowColor: "transparent",
    size: "0.9",
    posX: "-50%",
    posY: "100%",
  },
};

const RetroSun: React.FC<RetroSunProps> = ({
  className = "",
  preset = "none",
}) => {
  const currentSunPreset = SUN_PRESETS[preset];

  const getSunStyles = (sunPreset: SunPreset) => {
    const shadow = `0 0 100px ${sunPreset.glowColor}`;

    return {
      backgroundColor: sunPreset.sunColorPrimary,
      boxShadow: shadow,
      height: "100%",
      bottom: 0,
      left: "50%",
      transform: `translate(${sunPreset.posX}, ${sunPreset.posY}) scale(${sunPreset.size})`,
      transformOrigin: "center",
      "--secondary-color": sunPreset.sunColorSecondary,
    };
  };

  const currentStyles = getSunStyles(currentSunPreset);

  return (
    <>
      <style jsx>{`
        .sun-container {
          position: relative;
        }

        .sun-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--secondary-color);
          mask: linear-gradient(to top, black 25%, transparent 100%);
          -webkit-mask: linear-gradient(to top, black 25%, transparent 100%);
          border-radius: inherit;
          transition: background-color 2000ms ease-in-out;
        }
      `}</style>
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div
          className="sun-container absolute aspect-square rounded-full opacity-90 transition-all duration-1000"
          style={{
            ...currentStyles,
            transitionTimingFunction: "ease-in-out",
          }}
        />
      </div>
    </>
  );
};

export default RetroSun;
