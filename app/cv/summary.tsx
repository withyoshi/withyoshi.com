"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import LivePhoto from "./live-photo";

interface SummaryCardProps {
  headingCaption: string;
  headingTitle: string;
  children: React.ReactNode;
}

const SummaryCard = ({
  headingCaption,
  headingTitle,
  children,
}: SummaryCardProps) => {
  return (
    <div className="px-10">
      <h3 className="mb-3 text-left text-xl font-medium">
        <span className="-mb-1 block text-base font-bold">
          {headingCaption}
        </span>
        <span className="block text-2xl font-medium tracking-tight text-mint-600">
          {headingTitle}
        </span>
      </h3>
      <div className="">{children}</div>
    </div>
  );
};

interface ExperienceListProps {
  experiences: React.ReactElement[];
}

const ExperienceList = ({ experiences }: ExperienceListProps) => {
  return (
    <ul className="space-y-3">
      {experiences.map((experience, index) => (
        <li key={index} className="flex items-start gap-2 leading-5">
          <FontAwesomeIcon
            icon={faCheck}
            className="mt-1 h-3 w-3 flex-shrink-0 text-mint-600"
          />
          <span>{experience}</span>
        </li>
      ))}
    </ul>
  );
};

const ExperienceKeyword = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-mint-600">{children}</span>
);

const engineeringExperience = [
  <>
    Built <ExperienceKeyword>AI</ExperienceKeyword> features and workflows for a
    business intelligence platform.
  </>,
  <>
    Modernized Subscription Management on WordPress.com to{" "}
    <ExperienceKeyword>scale</ExperienceKeyword> and serve over 100 million blog
    subscribers.
  </>,
  <>
    Created <ExperienceKeyword>data</ExperienceKeyword> visualization, reporting
    and tracking tools for a terabyte-scale data warehouse.
  </>,
  <>
    Developed core <ExperienceKeyword>product</ExperienceKeyword> features for
    social networking and blogging platform EasySocial, EasyBlog & JomSocial.
  </>,
  <>
    <ExperienceKeyword>Open-source</ExperienceKeyword> contributor for
    WordPress, Jetpack & Joomla. Plugin author for jQuery & Vue.
  </>,
];

const leadershipExperience = [
  <>Professionally trained in leadership development.</>,
  <>Led and managed 3 teams of 12 software engineers across Europe & Asia.</>,
  <>Mentored and onboarded 6 software engineers.</>,
  <>Delivered training workshops on JavaScript, Vue & Laravel.</>,
];

interface PersonalNoteProps {
  className?: string;
}

const PersonalNote = ({ className = "" }: PersonalNoteProps) => {
  return (
    <section className={`${className}`}>
      <div
        className={`relative rounded-sm bg-green-50 p-6 pt-4 pb-5 md:ml-3 md:translate-x-4 md:rounded-br-none md:border-l-4 md:border-l-mint-600 md:shadow-sm md:after:absolute md:after:right-0 md:after:-bottom-[1rem] md:after:h-0 md:after:w-0 md:after:border-t-[1rem] md:after:border-r-[1rem] md:after:border-t-mint-600 md:after:border-r-transparent md:after:content-['']`}
      >
        <h4 className="text-sm font-semibold text-mint-600">
          Traits & passions
        </h4>
        <p className="text-sm text-gray-700">
          Friendly and curious. I&apos;m into photography, piano, and building
          things in my homelab.
        </p>
      </div>
    </section>
  );
};

const Summary = ({ className }: { className?: string }) => (
  <div className="flex flex-col md:flex-row">
    <div className="relative hidden min-h-10 min-w-[30%] overflow-hidden lg:block">
      <LivePhoto
        className="h-full w-full"
        imageSrc="/images/cv-hero.jpg"
        imageAlt="CV background"
        imageWidth={1080}
        imageHeight={1800}
        videoSrc="/images/cv-hero.mp4"
        autoPlay={true}
      />
    </div>
    <div className={`width-full flex-1 ${className || ""}`}>
      <h2 className="mb-5 text-left">
        <span className="text-3xl font-semibold tracking-tight text-mint-600 sm:text-4xl">
          Career summary
        </span>
      </h2>
      <section className="grid-row -mx-10 grid gap-5 md:grid-cols-2 md:gap-0 md:divide-x md:divide-gray-200">
        <SummaryCard
          headingCaption="15 years of"
          headingTitle="Software Engineering"
        >
          <ExperienceList experiences={engineeringExperience} />
        </SummaryCard>
        <SummaryCard
          headingCaption="5 years of"
          headingTitle="Technical Leadership"
        >
          <div className="relative">
            <ExperienceList experiences={leadershipExperience} />
            <PersonalNote className="relative my-4 md:-mr-10" />
          </div>
        </SummaryCard>
      </section>
    </div>
  </div>
);

export default Summary;
