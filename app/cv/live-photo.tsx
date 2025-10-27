"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type LivePhotoProps = {
  className?: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  videoSrc: string;
  videoSrcWebm?: string;
  autoPlay?: boolean;
};

const LivePhoto = ({
  className = "",
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  videoSrc,
  autoPlay = true,
}: LivePhotoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playVideo = useCallback(
    (restartPlayback = false) => {
      if (videoRef.current && isVideoLoaded && isImageLoaded) {
        setIsPlaying(true);
        videoRef.current.pause();
        if (restartPlayback) {
          videoRef.current.currentTime = 1;
        }

        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsVideoVisible(true);
            })
            .catch((_error) => {
              setIsPlaying(false);
            });
        }
      }
    },
    [isVideoLoaded, isImageLoaded]
  );

  const restartVideo = () => {
    playVideo(true);
  };

  const pauseVideo = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsVideoVisible(false);
      setIsPlaying(false);
    }
  };

  const toggleVideo = () => {
    if (isVideoVisible) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const handleVideoEnded = () => {
    setIsVideoVisible(false);
    setIsPlaying(false);
  };

  const handleImageLoaded = () => {
    setIsImageLoaded(true);
  };

  useEffect(() => {
    // Play video once on page load after both video and image are loaded
    if (autoPlay && isVideoLoaded && isImageLoaded) {
      const timer = setTimeout(() => {
        playVideo();
      }, 100); // Small delay for smooth transition

      return () => clearTimeout(timer);
    }
  }, [autoPlay, isVideoLoaded, isImageLoaded, playVideo]);

  // Monitor video readyState with timeout
  useEffect(() => {
    if (isVideoLoaded) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(() => {
      attempts++;

      if (videoRef.current && videoRef.current.readyState >= 2) {
        setIsVideoLoaded(true);
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isVideoLoaded]);

  return (
    <div className={`relative ${className}`}>
      <Image
        alt={imageAlt}
        className="absolute inset-0 z-10 h-full w-full object-cover object-bottom"
        height={imageHeight}
        onLoad={handleImageLoaded}
        src={imageSrc}
        width={imageWidth}
      />
      <video
        className={`absolute inset-0 z-20 h-full w-full object-cover object-bottom transition-opacity duration-700 ease-in-out ${
          isVideoVisible ? "opacity-100" : "opacity-0"
        }`}
        muted
        onClick={toggleVideo}
        onEnded={handleVideoEnded}
        onMouseEnter={restartVideo}
        onMouseLeave={pauseVideo}
        playsInline
        preload="auto"
        ref={videoRef}
        src={videoSrc}
      />
    </div>
  );
};

export default LivePhoto;
