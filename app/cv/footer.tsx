import Image from "next/image";
import ContactSection from "./contact-section";

export default function Footer({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        alt="Work collage showcasing various projects and achievements"
        className="h-auto w-full"
        height={1030}
        src="/images/cv-work-collage.jpg"
        width={2800}
      />

      {/* Contact Section */}
      <div className="px-8 py-10 sm:p-10">
        <ContactSection />
      </div>
    </div>
  );
}
