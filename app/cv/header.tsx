import { cn } from "@/lib/utils";
import ContactCard from "./contact-card";
import ProfilePic from "./profile-pic";

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
          <h1 className="text-center font-semibold text-[2.6rem] text-gray-800 leading-[1] tracking-tight lg:mb-0 lg:text-left lg:text-5xl">
            Yan Sern
          </h1>
          <p className="whitespace-nowrap text-center font-medium text-mint-600 text-xl tracking-tight lg:text-left">
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
