import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type GlassmorphismCardProps = {
  icon: IconDefinition;
  title: string;
  description: string;
  className?: string;
};

export default function GlassmorphismCard({
  icon,
  title,
  description,
  className = "",
}: GlassmorphismCardProps) {
  return (
    <div
      className={`rounded-md border-1 border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl text-teal-600">
          <FontAwesomeIcon className="h-6 w-6" icon={icon} />
        </div>
        <div className="text-left">
          <h3 className="mb-2 font-semibold text-lg text-white">{title}</h3>
          <p
            className="text-sm text-white/60 leading-relaxed [&_strong]:font-semibold [&_strong]:text-white"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Used under controlled environments
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </div>
    </div>
  );
}
