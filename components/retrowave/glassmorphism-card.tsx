import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface GlassmorphismCardProps {
  icon: IconDefinition;
  title: string;
  description: string;
  className?: string;
}

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
          <FontAwesomeIcon icon={icon} className="h-6 w-6" />
        </div>
        <div className="text-left">
          <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
          <p
            className="text-sm leading-relaxed text-white/60 [&_strong]:font-semibold [&_strong]:text-white"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </div>
    </div>
  );
}
