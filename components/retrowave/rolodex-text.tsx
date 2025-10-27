"use client";

import { useEffect, useRef, useState } from "react";
import { useIsYoshiTheme } from "../../lib/site-context";

type RolodexTextProps = {
  items: string[];
  prefix?: string;
  className?: string;
  interval?: number;
  visibleItems?: number;
  bufferSize?: number;
};

export default function RolodexText({
  items,
  className = "",
  interval = 2000,
  visibleItems = 5,
}: RolodexTextProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [displayItems, setDisplayItems] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const bufferSize = visibleItems + 1;
  const scrollIncrement = 100 / bufferSize;
  const nextIndexRef = useRef(0);
  const currentItemsRef = useRef<string[]>([]);
  const isYoshiTheme = useIsYoshiTheme();

  useEffect(() => {
    // Initialize display items with fixed buffer size
    const initialItems = items.slice(-1);
    for (let i = 0; i < bufferSize - 1; i++) {
      initialItems.push(items[i % items.length]);
    }
    currentItemsRef.current = initialItems;
    setDisplayItems(initialItems);
    nextIndexRef.current = (bufferSize - 1) % items.length;
    setScrollPosition(scrollIncrement);

    // Animation function
    const animate = () => {
      setIsTransitioning(false);

      const nextIndex = nextIndexRef.current;
      const currentItems = currentItemsRef.current;
      const newItems = [...currentItems.slice(1), items[nextIndex]];
      nextIndexRef.current = (nextIndex + 1) % items.length;
      currentItemsRef.current = newItems;

      setDisplayItems(newItems);
      setScrollPosition(0);

      // Use requestAnimationFrame for smoother transitions
      requestAnimationFrame(() => {
        setIsTransitioning(true);
        setScrollPosition(scrollIncrement);
      });
    };

    // Start the animation loop
    const intervalId = setInterval(animate, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [interval, bufferSize, items, scrollIncrement]);

  return (
    <div
      className={`${className} flex w-full flex-col items-start gap-4 pt-24 text-teal-600/90 md:flex-row md:items-center md:py-36`}
    >
      <span className="flex flex-row items-end gap-3 whitespace-nowrap md:items-center">
        <span className="tk-futura-pt-bold text-6xl sm:text-7xl">
          {/* I know I'm a little obsessive with getting the kerning right */}
          <span className="-mr-1">Y</span>
          <span className="-mr-0.5">O</span>SHI
        </span>
        <span className="-top-1 relative whitespace-nowrap font-lexend font-thin text-3xl tracking-tight sm:text-4xl md:top-0">
          {isYoshiTheme ? "is a" : "is my"}
        </span>
      </span>
      <span className="relative h-54 w-full overflow-hidden before:absolute before:top-0 before:left-0 before:h-18 before:w-full before:rounded-md before:border-1 before:border-teal-600/40 before:content-[''] md:block md:h-18 md:overflow-visible">
        <div className="absolute top-0 left-0 h-full w-full">
          <div className="-translate-y-1/2 relative mt-[2.25em] h-90 w-full overflow-hidden [--tw-mask-image:linear-gradient(to_bottom,transparent_5%,black_40%,black_60%,transparent_95%)] [mask-image:linear-gradient(to_bottom,transparent_5%,black_40%,black_60%,transparent_95%)]">
            <div
              className={`${
                isTransitioning
                  ? "transition-transform duration-500 ease-in-out"
                  : ""
              }`}
              style={{
                transform: `translateY(-${scrollPosition}%)`,
              }}
            >
              {displayItems.map((item, index) => {
                // The middle item is always the current one
                const middleIndex = Math.floor(bufferSize / 2);
                const isCurrentItem = index === middleIndex;
                const opacity = isCurrentItem ? 1 : 0.5;

                return (
                  <span
                    className={`h-18 whitespace-nowrap px-5 font-lexend font-light text-3xl text-white/90 tracking-tight sm:text-4xl ${
                      isTransitioning
                        ? "transition-opacity duration-500 ease-in-out"
                        : ""
                    }`}
                    key={`rolodex-${index}-${item}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      opacity,
                    }}
                  >
                    {item}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </span>
    </div>
  );
}
