import Image from "next/image";
import ContactSection from "./contact-section";

export default function Footer({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/images/cv-work-collage.jpg"
        alt="Work collage showcasing various projects and achievements"
        width={2800}
        height={1030}
        className="h-auto w-full"
      />

      {/* Contact Section */}
      <div className="px-8 py-10 sm:p-10">
        <ContactSection />
      </div>
    </div>
  );
}
