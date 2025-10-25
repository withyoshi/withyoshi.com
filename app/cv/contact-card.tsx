"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContactData } from "./hooks/use-contact-data";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { ReactNode } from "react";

interface ContactItemProps {
  icon: IconDefinition;
  label: string;
  value: string | ReactNode;
  href?: string;
  action?: () => void;
}

const ContactItem = ({
  icon,
  label,
  value,
  href,
  action,
}: ContactItemProps) => {
  const content = (
    <div className="flex items-start gap-1 rounded px-2 py-2 pr-2.5 text-left whitespace-nowrap sm:gap-1.5">
      <FontAwesomeIcon
        icon={icon}
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-mint-600"
      />
      <span className="block">
        <span className="block text-sm font-medium text-black">{label}</span>
        <span className="-mt-0.5 block text-sm text-gray-500">{value}</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded border-1 border-transparent hover:border-mint-600/50 hover:bg-green-50"
        aria-label={`${label}: ${value} (opens in new tab)`}
        title={`Visit ${label} - ${value}`}
      >
        {content}
      </a>
    );
  }

  if (action) {
    return (
      <button
        onClick={action}
        className="block w-full cursor-pointer rounded border-1 border-transparent hover:border-mint-600/50 hover:bg-green-50"
        aria-label={`${label}: ${value}`}
        title={`${label} - ${value}`}
      >
        {content}
      </button>
    );
  }

  return content;
};

interface ContactCardProps {
  className?: string;
  items?: string[];
}

const ContactCard = ({ className, items }: ContactCardProps) => {
  const contactData = useContactData();

  // If no items provided, show all contact items
  const itemsToShow = items
    ? items
        .map((item) => contactData[item as keyof typeof contactData])
        .filter(Boolean)
    : Object.values(contactData);

  return (
    <div
      className={
        className ||
        "inline-grid grid-cols-[auto_auto] sm:grid-flow-col sm:grid-cols-[auto_auto_auto] sm:grid-rows-2"
      }
    >
      {itemsToShow.map((item, index) => (
        <ContactItem
          key={index}
          icon={item.icon}
          label={item.label}
          value={item.value}
          href={item.href}
          action={item.action}
        />
      ))}
    </div>
  );
};

export default ContactCard;
