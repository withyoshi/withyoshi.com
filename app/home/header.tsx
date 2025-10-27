"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ShadowSlit from "../../components/retrowave/shadow-slit";
import { useIsYoshiTheme } from "../../lib/site-context";

export default function Header() {
  const headerRef = useRef<HTMLElement | null>(null);
  const sentientRef = useRef<HTMLDivElement | null>(null);
  const cursorCircleRef = useRef<HTMLDivElement | null>(null);
  const sentientImageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isRunningFirstTimeAnimation, setIsRunningFirstTimeAnimation] =
    useState(true);
  const [imagesLoaded, setImagesLoaded] = useState({
    after: false,
    before: false,
  });
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  // const [showTitleAnimation, setShowTitleAnimation] = useState(false);
  const isYoshiTheme = useIsYoshiTheme();

  // Function to update circle size based on header height
  const updateCircleSize = useCallback(() => {
    if (headerRef.current && cursorCircleRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      const circleSize = headerHeight * 0.15;
      cursorCircleRef.current.style.width = `${circleSize}px`;
      cursorCircleRef.current.style.height = `${circleSize}px`;
    }
  }, []);

  // Handle individual image load events
  const handleImageLoad = (imageType: "after" | "before") => {
    setImagesLoaded((prev) => ({ ...prev, [imageType]: true }));
  };

  const updateMask = useCallback((x: number, y: number, alpha: number = 0) => {
    if (sentientImageRef.current) {
      const maskGradient = `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,1) 10%, rgba(0,0,0,${alpha}) 25%, rgba(0,0,0,1) 75%)`;
      sentientImageRef.current.style.mask = maskGradient;
    }
  }, []);

  const runFirstTimeAnimation = useCallback(() => {
    setIsRunningFirstTimeAnimation(true);

    const initialCssAnimationDuration = 1000;

    // Add is-loading to header to trigger CSS animations
    headerRef.current?.classList.add("is-loading");
    headerRef.current?.classList.remove("is-running");

    // Mask out everything on the sentient image
    if (sentientImageRef.current) {
      sentientImageRef.current.style.mask =
        "radial-gradient(circle, transparent 100%, transparent 100%)";
    }

    animationRef.current = requestAnimationFrame(() => {
      headerRef.current?.classList.remove("is-loading");
      headerRef.current?.classList.add("is-running");

      setTimeout(() => {
        const startTime = performance.now();
        const rect = sentientRef.current?.getBoundingClientRect() || {
          width: 0,
          height: 0,
        };
        const startY = 0; // Start from top
        const endY = rect.height; // End at bottom
        const centerX = rect.width / 2; // Center horizontally
        const sweepDuration = 1000; // 1 second for top-to-bottom sweep
        const fadeDuration = 1000; // 1 second for alpha fade
        const totalDuration = sweepDuration + fadeDuration;

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / totalDuration, 1);

          // Phase 1: Top-to-bottom sweep
          if (elapsed > 0) {
            const sweepProgress = elapsed / sweepDuration;
            const easeOut = 1 - (1 - sweepProgress) ** 3;
            const currentY = startY + (endY - startY) * easeOut;
            updateMask(centerX, currentY, 0);
          }

          // Phase 2: Alpha fade from 0 to 1
          if (elapsed > sweepDuration) {
            const fadeProgress = (elapsed - sweepDuration) / fadeDuration;
            const easeOut = 1 - (1 - fadeProgress) ** 3;
            const alpha = Math.round(easeOut * 100) / 100;
            updateMask(centerX, endY, alpha);
          }

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            // Animation complete, reset styles and enable mouse interactions
            headerRef.current?.classList.remove("is-running");
            setIsRunningFirstTimeAnimation(false);
            animationRef.current = null;
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      }, initialCssAnimationDuration);
    });
  }, [updateMask]);

  const startIdleAnimation = useCallback(() => {
    if (sentientImageRef.current) {
      const startTime = performance.now();
      const duration = 1000; // 1 second
      const { x, y } = mousePosition;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out function for smooth animation
        const easeOut = 1 - (1 - progress) ** 3;
        const alpha = Math.round(easeOut * 100) / 100; // Goes from 0 to 1

        updateMask(x, y, alpha);

        // Fade out the cursor circle
        if (cursorCircleRef.current) {
          const cursorOpacity = 1 - easeOut; // Goes from 1 to 0
          cursorCircleRef.current.style.opacity = cursorOpacity.toString();
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }
  }, [mousePosition, updateMask]);

  // Update circle size on mount and resize
  useEffect(() => {
    updateCircleSize();

    const handleResize = () => updateCircleSize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [updateCircleSize]);

  // Update allImagesLoaded when both images are loaded
  useEffect(() => {
    if (imagesLoaded.after && imagesLoaded.before) {
      setAllImagesLoaded(true);
    }
  }, [imagesLoaded]);

  // Handle window focus and tab visibility to retrigger animation
  useEffect(() => {
    const handleFocus = () => {
      // Always retrigger if images are loaded
      if (allImagesLoaded) {
        runFirstTimeAnimation();
      }
    };

    const handleVisibilityChange = () => {
      // When tab becomes visible again, always retrigger if images are loaded
      if (document.visibilityState === "visible" && allImagesLoaded) {
        runFirstTimeAnimation();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [allImagesLoaded, runFirstTimeAnimation]);

  // Handle image loading and trigger first time animation
  useEffect(() => {
    if (allImagesLoaded) {
      // First requestAnimationFrame to ensure images are rendering
      const rafId = requestAnimationFrame(() => {
        // Second requestAnimationFrame to ensure images have completed rendering
        requestAnimationFrame(() => {
          runFirstTimeAnimation();
        });
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [allImagesLoaded, runFirstTimeAnimation]);

  const handleMouseEnter = () => {
    if (isRunningFirstTimeAnimation) {
      return;
    }
    // Cancel any running animation when mouse enters
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    // Clear any pending idle timeout
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    // Skip if first-time animation is running
    if (isRunningFirstTimeAnimation) {
      return;
    }

    // Clear existing idle timeout
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    if (headerRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      const x = clientX - headerRect.left;
      const y = clientY - headerRect.top;

      // Update cursor circle position using ref
      if (cursorCircleRef.current) {
        cursorCircleRef.current.style.left = `${x}px`;
        cursorCircleRef.current.style.top = `${y}px`;
        // Reset cursor opacity to 1 when pointer moves
        cursorCircleRef.current.style.opacity = "1";
      }
    }

    if (sentientRef.current) {
      const rect = sentientRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      setMousePosition({ x, y });

      // Update mask with current position and transparent center
      updateMask(x, y, 0);
    }

    // Set new idle timeout for 2 seconds
    idleTimeoutRef.current = setTimeout(() => {
      startIdleAnimation();
    }, 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseLeave = () => {
    if (isRunningFirstTimeAnimation) {
      return;
    }
    // Clear any pending idle timeout
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
    // Start animation immediately
    startIdleAnimation();
  };

  return (
    <>
      <style jsx>{`
        .is-loading .caption-title {
          opacity: 0;
        }

        .is-loading .display-title {
          opacity: 0;
          transform: scale(1.2);
        }

        .is-loading .sentient-man {
          opacity: 0;
          transform: scale(1.2);
        }

        .is-loading .cursor-circle {
          opacity: 0;
        }

        .is-running .caption-title {
          transition: opacity 0.5s ease-out;
        }

        .is-running .display-title {
          transition:
            opacity 0.5s ease-out,
            transform 0.5s ease-out;
          transition-delay: 0.5s;
        }

        .is-running .sentient-man {
          transition:
            opacity 0.5s ease-out,
            transform 0.5s ease-out;
          transition-delay: 1s;
        }

        .caption-title {
          opacity: 1;
        }

        .display-title {
          opacity: 1;
          transform: scale(1);
        }

        .sentient-man {
          opacity: 1;
          transform: scale(1);
        }

        .is-running .cursor-circle {
          opacity: 0;
        }
      `}</style>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Header has visual-only mouse tracking effects */}
      <header
        ref={headerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fx-vignette group is-loading @container relative overflow-hidden bg-[#a8a8a8]`}
      >
        {/* Cursor circle */}
        <div
          ref={cursorCircleRef}
          className="background-white/10 -translate-x-1/2 -translate-y-1/2 pointer-events-none absolute inset-shadow-[0px_0px_24px_rgba(0,0,0,0.75)] z-50 cursor-circle rounded-full opacity-0 outline-1 outline-teal-600 backdrop-hue-rotate-145 transition-opacity duration-500 group-hover:opacity-100"
        />
        <section className="relative z-20 bg-gradient-to-b from-white/65 to-transparent py-12">
          <ShadowSlit
            fill="#fff"
            className="absolute top-0 left-0 z-20 h-[240px] w-full opacity-50"
            direction="top"
          />
          <div className="mx-auto max-w-screen-md">
            <h1 className="">
              {" "}
              <span className="-mb-4 sm:-mb-5 relative z-60 block text-center leading-[1]">
                <span className="caption-title block font-extralight font-lexend text-3xl text-teal-600 uppercase tracking-tighter sm:text-4xl">
                  {isYoshiTheme ? "A NEW ERA" : "YAN SERN"}{" "}
                  <span className="text-gray-500 text-lg lowercase tracking-normal sm:text-2xl">
                    {isYoshiTheme ? (
                      <>begins with</>
                    ) : (
                      <>
                        <span className="tracking-tighter">is</span> now
                      </>
                    )}
                  </span>
                </span>
              </span>
              <span className="display-title tk-futura-pt-bold mask-fade-bottom relative z-40 block text-center text-[7rem] text-shadow-xs text-white uppercase leading-[1] tracking-tighter sm:text-[12rem]">
                <span className="-mr-1 sm:-mr-2">Y</span>OSHI
              </span>
            </h1>
          </div>
        </section>
        <section className="-mt-12 relative z-10">
          <div className="@container relative mx-auto max-w-screen-md">
            <div
              ref={sentientRef}
              className="sentient-man sentient -mt-[46cqw] relative z-10 aspect-square w-full select-none"
            >
              <Image
                ref={sentientImageRef}
                src="/images/yoshi-sentient-overlay.jpg"
                alt="Sentient after"
                width={2048}
                height={2048}
                className="absolute inset-0 z-10 select-none object-cover"
                draggable={false}
                onLoad={() => handleImageLoad("after")}
              />
              <Image
                src="/images/yoshi-sentient.jpg"
                alt="Sentient before"
                width={2048}
                height={2048}
                className="absolute inset-0 select-none object-cover"
                draggable={false}
                onLoad={() => handleImageLoad("before")}
              />
            </div>
            <ShadowSlit
              fill="#00afb9"
              className="absolute bottom-0 left-[-20%] z-20 h-[80px] w-[140%] border-[#ffffffcc] border-b-1"
            />
          </div>
        </section>
      </header>
    </>
  );
}
