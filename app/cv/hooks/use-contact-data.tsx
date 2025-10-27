"use client";

import {
  faGithub,
  faLinkedin,
  faTelegram,
} from "@fortawesome/free-brands-svg-icons";
import {
  faEnvelope,
  faLocationDot,
  faPassport,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { usePhoneModal } from "../contexts/phone-modal-context";

export function useContactData() {
  // Always call the hook, but handle the case where context might not be available
  const phoneModal = usePhoneModal();
  const openModal = phoneModal?.openModal;

  return {
    email: {
      icon: faEnvelope,
      label: "Email",
      value: "yansern@yan.sr",
      href: "mailto:yansern@yan.sr?subject=Job%20Opportunity%20for%20Yan%20Sern",
      action: undefined,
    },
    phone: {
      icon: faPhone,
      label: "Phone",
      value: "Request a call",
      href: undefined,
      action: openModal,
    },
    telegram: {
      icon: faTelegram,
      label: "Telegram",
      value: (
        <>
          <span className="sm:hidden">yansern</span>
          <span className="hidden sm:inline">t.me/yansern</span>
        </>
      ),
      href: "https://t.me/yansern",
      action: undefined,
    },
    linkedin: {
      icon: faLinkedin,
      label: "LinkedIn",
      value: (
        <>
          <span className="sm:hidden">yansern</span>
          <span className="hidden sm:inline">linkedin.com/in/yansern</span>
        </>
      ),
      href: "https://linkedin.com/in/yansern",
      action: undefined,
    },
    github: {
      icon: faGithub,
      label: "GitHub",
      value: (
        <>
          <span className="sm:hidden">yansern</span>
          <span className="hidden sm:inline">github.com/yansern</span>
        </>
      ),
      href: "https://github.com/yansern",
      action: undefined,
    },
    location: {
      icon: faLocationDot,
      label: "Location",
      value: (
        <>
          <span className="lg:hidden">Rotterdam, NL</span>
          <span className="hidden lg:inline">Rotterdam, Netherlands</span>
        </>
      ),
      href: "https://maps.app.goo.gl/WPrPHqkAZspDQaFv7",
      action: undefined,
    },
    nationality: {
      icon: faPassport,
      label: "Nationality",
      value: "Dutch (EU)",
      href: undefined,
      action: undefined,
    },
  };
}
