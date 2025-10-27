"use client";
import {
  faCamera,
  faCircleNodes,
  faCode,
  faPersonRunning,
  faPlay,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import LaunchItem from "../../components/retrowave/launch-item";
import RetroSky from "../../components/retrowave/retro-sky";
import RetroStars from "../../components/retrowave/retro-stars";
import RetroSun from "../../components/retrowave/retro-sun";
import ShadowSlit from "../../components/retrowave/shadow-slit";
import { useIsYoshiTheme } from "../../lib/site-context";
import LandscapeMesh from "./images/landscape-mesh.svg";

export default function Footer() {
  const [activePresetName, setActivePresetName] = useState("dark-space");
  const isYoshiTheme = useIsYoshiTheme();

  const launchItems = [
    {
      state: "ready" as const,
      icon: faPlay,
      title: "Start",
      description: isYoshiTheme
        ? "withyoshi.com (You Are Here)"
        : "withyoshi.com",
      href: "https://withyoshi.com",
      className: "col-span-2",
      preset: "cyan-dream",
    },
    {
      state: "ready" as const,
      icon: faCamera,
      title: "Shoot",
      description: "shoot.withyoshi.com",
      href: "https://shoot.withyoshi.com",
      className: "",
      preset: "purple-dawn",
    },
    {
      state: "upcoming" as const,
      icon: faCode,
      title: "Code",
      description: "Coming · Fall 2026",
      href: undefined,
      className: "",
      preset: "dark-space",
    },
    {
      state: "upcoming" as const,
      icon: faCircleNodes,
      title: "Make",
      description: "Coming · Fall 2027",
      href: undefined,
      className: "",
      preset: "dark-space",
    },
    {
      state: "upcoming" as const,
      icon: faWaveSquare,
      title: "Vibe",
      description: "Coming · Fall 2028",
      href: undefined,
      className: "",
      preset: "dark-space",
    },
    {
      state: "upcoming" as const,
      icon: faPersonRunning,
      title: "Escape",
      description: "Coming · Fall 2029",
      href: undefined,
      className: "col-span-2",
      preset: "dark-space",
    },
  ];

  return (
    <footer className="relative bg-black">
      <div className="relative z-30 mx-auto max-w-screen-md p-8 pt-24 pb-32 sm:p-10 md:p-16 md:pb-48">
        <ShadowSlit
          fill="#00afb9"
          className="pointer-events-none absolute top-0 left-[-20%] z-20 h-[80px] w-[140%] border-[#ffffffcc] border-t-1"
          direction="top"
        />
        <h2 className="mt-12 mb-6 text-center">
          <span className="-mb-1.5 block whitespace-nowrap font-lexend font-thin text-3xl text-teal-600 sm:text-4xl">
            Enter the universe of
          </span>
          <span className="tk-futura-pt-bold block text-center text-[6rem] text-teal-600 leading-[1] tracking-tighter sm:text-9xl">
            <span className="-mr-1">Y</span>
            <span className="-mr-0.5">O</span>SHI
          </span>
        </h2>

        <div className="my-12 grid grid-cols-2 gap-4 text-center sm:gap-6">
          {launchItems.map((item) => (
            <LaunchItem
              key={item.title}
              state={item.state}
              icon={item.icon}
              title={item.title}
              description={item.description}
              href={item.href}
              className={item.className}
              onMouseEnter={() => setActivePresetName(item.preset)}
              onMouseLeave={() => setActivePresetName("dark-space")}
              onClick={() => setActivePresetName(item.preset)}
            />
          ))}
        </div>
      </div>

      <section className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 h-[57.5%] w-full">
          <RetroSky
            activePreset={activePresetName}
            className="absolute inset-0 opacity-20"
          />
          <RetroStars className="absolute inset-0" />
          <RetroSun
            className="absolute inset-0 opacity-75"
            preset={
              activePresetName === "cyan-dream"
                ? "white"
                : activePresetName === "purple-dawn"
                  ? "pink"
                  : "none"
            }
          />
        </div>
        <div className="absolute bottom-0 left-0 h-[100%] w-full xl:[mask-image:radial-gradient(ellipse_50%_50%_at_center_60%,black_0%,black_60%,transparent_100%)]">
          <LandscapeMesh className="-translate-x-1/2 absolute bottom-[-9.5%] left-[50%] h-[130%] w-[1280px] opacity-50 md:left-[50.9%] md:w-[2560px]" />
        </div>
      </section>
    </footer>
  );
}
