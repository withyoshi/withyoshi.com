"use client";
import { faPlay, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

interface ProfilePicProps {
  className?: string;
  imageSrc: string;
  imageAlt: string;
  videoSrc: string;
}

const ProfilePic = ({
  className = "",
  imageSrc,
  imageAlt,
  videoSrc,
}: ProfilePicProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [preventHover, setPreventHover] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 1;
      videoRef.current.play();
    }
    setIsExpanded(true);
    setPreventHover(true);
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsExpanded(false);
  };

  const handleClick = () => {
    if (!isExpanded) {
      playVideo();
    } else {
      pauseVideo();
    }
  };

  const handleVideoEnded = () => {
    pauseVideo();
  };

  const handleMouseEnter = () => {
    setPreventHover(false);
  };

  const handleMouseLeave = () => {
    setPreventHover(false);
  };

  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
  };

  const handleVideoCanPlay = () => {
    setIsVideoLoading(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
  };

  // Detect touch device to avoid hover state issues
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches,
      );
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  return (
    <button
      type="button"
      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-full bg-gray-100 transition-all duration-500 ease-in-out ${
        isExpanded ? "mb-6 w-[70%]" : "w-28"
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleMouseEnter}
    >
      <div className="absolute inset-0">
        {/* Live pic - pauses on last frame for 8 seconds before looping */}
        {/* biome-ignore lint/performance/noImgElement: Using img instead of Next.js Image for special animation requirements */}
        <img
          src={imageSrc}
          alt={imageAlt}
          width={256}
          height={256}
          className={`absolute inset-0 z-10 h-full w-full object-cover object-center ${
            isExpanded ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Video overlay */}
        <video
          ref={videoRef}
          className={`absolute inset-0 z-20 h-full w-full object-cover object-[center_75%] transition-all duration-500 ${isExpanded ? "opacity-100" : "opacity-0"}`}
          onEnded={handleVideoEnded}
          onClick={handleClick}
          onLoadStart={handleVideoLoadStart}
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          muted
          playsInline
          preload="auto"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Play icon overlay - appears on hover, hidden when expanded */}
        <div
          className={`-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 z-30 flex h-7 w-7 scale-0 items-center justify-center rounded-full bg-mint-600 opacity-0 transition-all duration-200 ${
            !isTouchDevice && !preventHover
              ? "group-hover:scale-100 group-hover:opacity-100"
              : ""
          } ${isExpanded ? "hidden" : ""}`}
        >
          <FontAwesomeIcon icon={faPlay} className="text-white text-xs" />
        </div>

        {/* Loading indicator - appears when video is loading */}
        <div
          className={`-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 opacity-0 transition-all duration-200 ${
            isVideoLoading && isExpanded ? "opacity-100" : ""
          }`}
        >
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-sm text-white"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-30 h-full w-full rounded-full shadow-[inset_0px_2px_3px_rgba(0,0,0,0.2)]" />
      </div>
    </button>
  );
};

export default ProfilePic;
