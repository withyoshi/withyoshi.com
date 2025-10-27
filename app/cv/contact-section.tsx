"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faTelegram as faTelegramBrand } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ContactCard from "./contact-card";
import {
  PhoneModalProvider,
  usePhoneModal,
} from "./contexts/phone-modal-context";
import PhoneRequestModal from "./phone-request-modal";

interface ContactOptionProps {
  icon: IconDefinition;
  label: string;
  description: string;
  action: string;
  href: string;
}

const ContactOption = ({
  icon,
  label,
  description,
  action,
  href,
}: ContactOptionProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group block rounded-lg border border-gray-200 p-4 hover:border-mint-600/50 hover:bg-green-50"
  >
    <div className="flex items-start gap-3">
      <FontAwesomeIcon
        icon={icon}
        className="mt-1 h-6 w-6 flex-shrink-0 text-mint-600"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-black">{label}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
        <p className="mt-2 font-medium text-mint-600 text-sm">{action} →</p>
      </div>
    </div>
  </a>
);

function ContactSectionContent() {
  const { isOpen, closeModal } = usePhoneModal();

  const contactOptions = [
    {
      icon: faTelegramBrand,
      label: "Telegram",
      description: "Drop me a message for quick response.",
      action: "Send Message",
      href: "https://t.me/yansern",
    },
    {
      icon: faEnvelope,
      label: "Email",
      description: "Write me an email if formalities are preferred.",
      action: "Send Email",
      href: "mailto:yansern@yan.sr?subject=Job%20Opportunity%20for%20Yan%20Sern",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-bold text-3xl text-mint-600 sm:text-4xl">
            Get in touch
          </h2>
          <p>
            Am I the right person for the role? Want to collaborate on a
            project? Here&apos;s how to reach me.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contactOptions.map((option) => (
            <ContactOption
              key={option.label}
              icon={option.icon}
              label={option.label}
              description={option.description}
              action={option.action}
              href={option.href}
            />
          ))}
        </div>

        {/* Additional Contact Info */}
        <div className="space-y-2">
          <h3 className="font-bold">Other ways to connect</h3>
          <ContactCard
            items={["linkedin", "github", "phone"]}
            className="inline-grid grid-cols-[auto_auto_auto] gap-0"
          />
        </div>
      </div>

      {/* Phone Request Modal */}
      <PhoneRequestModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
}

export default function ContactSection() {
  return (
    <PhoneModalProvider>
      <ContactSectionContent />
    </PhoneModalProvider>
  );
}
