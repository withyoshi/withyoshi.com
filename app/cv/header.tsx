import ContactCard from "./contact-card";
import ProfilePic from "./profile-pic";
import { cn } from "@/lib/utils";

export default function Header({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-7 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-4",
        className,
      )}
    >
      <div className="flex w-full flex-col items-center justify-center gap-1 lg:w-auto lg:flex-row lg:items-center lg:justify-start">
        <div className="flex w-full justify-center lg:hidden">
          <ProfilePic
            imageSrc="/images/cv-profile-pic.jpg"
            imageAlt="Profile picture"
            videoSrc="/images/cv-hero.mp4"
          />
        </div>
        <div>
          <h1 className="text-center text-[2.6rem] leading-[1] font-semibold tracking-tight text-gray-800 lg:mb-0 lg:text-left lg:text-5xl">
            Yan Sern
          </h1>
          <p className="text-center text-xl font-medium tracking-tight whitespace-nowrap text-mint-600 lg:text-left">
            Full-Stack Software Engineer
          </p>
        </div>
      </div>
      <div className="-m-3 flex">
        <ContactCard
          className=""
          items={[
            "email",
            "telegram",
            "linkedin",
            "github",
            "location",
            "nationality",
          ]}
        />
      </div>
    </div>
  );
}
