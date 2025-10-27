import {
  faSpinner,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

// Extend HTMLAnchorElement to include startY property
declare global {
  type HTMLAnchorElement = {
    startY?: number;
  };
}

type LaunchItemProps = {
  state: "ready" | "upcoming";
  icon?: IconDefinition;
  title?: string;
  description?: string;
  href?: string;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
};

export default function LaunchItem({
  state,
  icon,
  title,
  description,
  href = "",
  className = "",
  onMouseEnter,
  onMouseLeave,
  onClick,
}: LaunchItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
    // Store the initial touch position
    e.currentTarget.startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLAnchorElement>) => {
    // Check if startY was recorded (touch started on this element)
    if (e.currentTarget.startY === undefined) {
      return;
    }

    // Check if the touch moved significantly (scrolling)
    const endY = e.changedTouches[0].clientY;
    const deltaY = Math.abs(endY - e.currentTarget.startY);

    // If moved more than 10px, prevent the click (user was scrolling)
    if (deltaY > 10) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Focus the element to trigger focus styles on mobile
    e.currentTarget.focus();
    if (onClick) {
      onClick();
    }
    if (!href) {
      return;
    }
    e.preventDefault();

    // Start loading state
    setIsLoading(true);

    window.setTimeout(() => {
      window.location.assign(href);
      // Reset loading state after navigation
      setIsLoading(false);
    }, 2000);
  };

  const handleAnchorClick = () => {
    if (onClick) {
      onClick();
    }

    if (!href) {
      return;
    }

    // Desktop clicks proceed immediately without loading state
  };
  const baseClasses =
    "p-8 rounded-md flex items-center justify-center transition-all duration-300 relative backdrop-blur-xl touch-manipulation ";

  const stateClasses = {
    ready:
      "outline-1 outline-teal-600/50 hover:border-teal-600/100 hover:bg-teal-700/15 hover:outline-teal-600/100 hover:backdrop-blur-xl focus:border-teal-600/100 focus:bg-teal-700/15 focus:outline-teal-600/100 focus:backdrop-blur-xl bg-black/40",
    upcoming: "bg-black/10 outline-1 outline-white/25",
  };

  const iconClasses = {
    ready: "text-teal-600 text-28 sm:text-32",
    upcoming: "text-white/20 text-28 sm:text-32",
  };

  const titleClasses = {
    ready: "text-2xl sm:text-3xl text-teal-600 tk-futura-pt-bold uppercase",
    upcoming: "text-2xl sm:text-3xl text-white/20 tk-futura-pt-bold uppercase",
  };

  const descriptionClasses = {
    ready: "text-xs sm:text-sm text-white/60",
    upcoming: "text-xs sm:text-sm text-white/20 whitespace-nowrap",
  };

  const combinedClasses = `${baseClasses} ${stateClasses[state]} ${className}`;

  return (
    <>
      {href ? (
        <a
          className={combinedClasses}
          href={href}
          onClick={handleAnchorClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <div>
            {icon && (
              <div className="text-3xl">
                {isLoading ? (
                  <FontAwesomeIcon
                    className={`${iconClasses[state]} animate-spin`}
                    icon={faSpinner}
                    style={{ animationDuration: "4s" }}
                  />
                ) : (
                  <FontAwesomeIcon className={iconClasses[state]} icon={icon} />
                )}
              </div>
            )}
            {title && <h4 className={titleClasses[state]}>{title}</h4>}
            {description && (
              <p className={descriptionClasses[state]}>{description}</p>
            )}
          </div>
        </a>
      ) : (
        <div className={combinedClasses}>
          <div>
            {icon && (
              <div className="text-3xl">
                <FontAwesomeIcon className={iconClasses[state]} icon={icon} />
              </div>
            )}
            {title && <h4 className={titleClasses[state]}>{title}</h4>}
            {description && (
              <p className={descriptionClasses[state]}>{description}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
