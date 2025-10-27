"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContactData } from "./hooks/use-contact-data";

type ContactItemProps = {
  icon: IconDefinition;
  label: string;
  value: string | React.ReactNode;
  href?: string;
  action?: () => void;
};

const ContactItem = ({
  icon,
  label,
  value,
  href,
  action,
}: ContactItemProps) => {
  const content = (
    <div className="flex items-start gap-1 whitespace-nowrap rounded px-2 py-2 pr-2.5 text-left sm:gap-1.5">
      <FontAwesomeIcon
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-mint-600"
        icon={icon}
      />
      <span className="block">
        <span className="block font-medium text-black text-sm">{label}</span>
        <span className="-mt-0.5 block text-gray-500 text-sm">{value}</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <a
        aria-label={`${label}: ${value} (opens in new tab)`}
        className="block rounded border-1 border-transparent hover:border-mint-600/50 hover:bg-green-50"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        title={`Visit ${label} - ${value}`}
      >
        {content}
      </a>
    );
  }

  if (action) {
    return (
      <button
        aria-label={`${label}: ${value}`}
        className="block w-full cursor-pointer rounded border-1 border-transparent hover:border-mint-600/50 hover:bg-green-50"
        onClick={action}
        title={`${label} - ${value}`}
        type="button"
      >
        {content}
      </button>
    );
  }

  return content;
};

type ContactCardProps = {
  className?: string;
  items?: string[];
};

const ContactCard = ({ className, items }: ContactCardProps) => {
  const contactData = useContactData();

  // If no items provided, show all contact items
  const itemsToShow = items
    ? items
        .map((key) => ({
          key,
          data: contactData[key as keyof typeof contactData],
        }))
        .filter((item) => item.data)
    : Object.entries(contactData).map(([key, data]) => ({ key, data }));

  return (
    <div
      className={
        className ||
        "inline-grid grid-cols-[auto_auto] sm:grid-flow-col sm:grid-cols-[auto_auto_auto] sm:grid-rows-2"
      }
    >
      {itemsToShow.map((item) => (
        <ContactItem
          action={item.data.action}
          href={item.data.href}
          icon={item.data.icon}
          key={item.key}
          label={item.data.label}
          value={item.data.value}
        />
      ))}
    </div>
  );
};

export default ContactCard;
