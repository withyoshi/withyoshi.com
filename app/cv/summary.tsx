"use client";
import { faCheck, faQuoteRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LivePhoto from "./live-photo";

type SummaryCardProps = {
  headingCaption: string;
  headingTitle: string;
  children: React.ReactNode;
};

const SummaryCard = ({
  headingCaption,
  headingTitle,
  children,
}: SummaryCardProps) => (
  <div className="px-10">
    <h3 className="mb-3 text-left font-medium text-xl">
      <span className="-mb-1 block font-bold text-base">{headingCaption}</span>
      <span className="block font-medium text-2xl text-mint-600 tracking-tight">
        {headingTitle}
      </span>
    </h3>
    <div className="text-pretty">{children}</div>
  </div>
);

type ExperienceItem = {
  key: string;
  content: React.ReactElement;
};

type ExperienceListProps = {
  experiences: ExperienceItem[];
};

const ExperienceList = ({ experiences }: ExperienceListProps) => (
  <ul className="space-y-3">
    {experiences.map((experience) => (
      <li className="flex items-start gap-2 leading-5" key={experience.key}>
        <FontAwesomeIcon
          className="mt-1 h-3 w-3 flex-shrink-0 text-mint-600"
          icon={faCheck}
        />
        <span>{experience.content}</span>
      </li>
    ))}
  </ul>
);

const ExperienceKeyword = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-mint-600">{children}</span>
);

const engineeringExperience: ExperienceItem[] = [
  {
    key: "ai",
    content: (
      <>
        Built <ExperienceKeyword>AI</ExperienceKeyword> features and workflows
        for a business intelligence platform.
      </>
    ),
  },
  {
    key: "scale",
    content: (
      <>
        Modernized Subscription Management on WordPress.com to{" "}
        <ExperienceKeyword>scale</ExperienceKeyword> and serve over 100 million
        blog subscribers.
      </>
    ),
  },
  {
    key: "data",
    content: (
      <>
        Created <ExperienceKeyword>data</ExperienceKeyword> visualization,
        reporting and tracking tools for a terabyte-scale data warehouse.
      </>
    ),
  },
  {
    key: "product",
    content: (
      <>
        Developed core <ExperienceKeyword>product</ExperienceKeyword> features
        for social networking and blogging platforms EasySocial, EasyBlog &
        JomSocial.
      </>
    ),
  },
  {
    key: "opensource",
    content: (
      <>
        <ExperienceKeyword>Open-source</ExperienceKeyword> contributor for
        WordPress, Jetpack & Joomla. Plugin author for jQuery & Vue.
      </>
    ),
  },
];

const leadershipExperience: ExperienceItem[] = [
  {
    key: "certified",
    content: <>Professionally trained in leadership development.</>,
  },
  {
    key: "leader",
    content: (
      <>
        Led and managed 3 teams of 12 software engineers across Europe & Asia.
      </>
    ),
  },
  {
    key: "mentor",
    content: <>Mentored and onboarded 6 software engineers.</>,
  },
  {
    key: "trainer",
    content: <>Delivered training workshops on JavaScript, Vue & Laravel.</>,
  },
];

type PersonalNoteProps = {
  className?: string;
};

const PersonalNote = ({ className = "" }: PersonalNoteProps) => (
  <section className={`${className}`}>
    <div
      className={
        "rounded-sm bg-gray-100 p-6 pt-4 pb-5 overflow-hidden relative"
      }
    >
      <FontAwesomeIcon
        className="mb-2 text-6xl text-white absolute right-5 -top-5"
        icon={faQuoteRight}
      />
      <h4 className="font-semibold text-mint-600 text-sm">
        My traits & passions
      </h4>
      <p className="text-balance italic text-gray-600 text-sm">
        Friendly and curious. I&apos;m into photography, piano, and building
        things in my homelab.
      </p>
    </div>
  </section>
);

const Summary = ({ className }: { className?: string }) => (
  <div className="flex flex-col md:flex-row">
    <div className="relative hidden min-h-10 min-w-[30%] overflow-hidden lg:block">
      <LivePhoto
        autoPlay={true}
        className="h-full w-full"
        imageAlt="CV background"
        imageHeight={1800}
        imageSrc="/images/cv-hero.jpg"
        imageWidth={1080}
        videoSrc="/images/cv-hero.mp4"
      />
    </div>
    <div className={`width-full flex-1 ${className || ""}`}>
      <h2 className="mb-5 text-left">
        <span className="font-semibold text-3xl text-mint-600 tracking-tight sm:text-4xl">
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
            <PersonalNote className="mt-6" />
          </div>
        </SummaryCard>
      </section>
    </div>
  </div>
);

export default Summary;
