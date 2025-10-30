"use client";
import { faBehanceSquare } from "@fortawesome/free-brands-svg-icons";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { caveat } from "@/lib/fonts";
import HanddrawnArrowCurve from "@/public/assets/handdrawn-arrow-curve.svg";

type TimelineItemProps = {
  date: string;
  title: string;
  mode?: string;
  company: string;
  location?: string;
  children: React.ReactNode;
  showFirstTimeTooltip?: boolean;
  onFirstInteraction?: () => void;
};

const TimelineItem = ({
  date,
  title,
  mode,
  company,
  location,
  children,
  showFirstTimeTooltip = false,
  onFirstInteraction,
}: TimelineItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTooltipDismissing, setIsTooltipDismissing] = useState(false);
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);
  const shouldShowTooltip =
    !isTooltipDismissed && (showFirstTimeTooltip || isTooltipDismissing);

  return (
    <div className="-mx-3 relative pb-4 pl-6 before:absolute before:top-[4px] before:left-0 before:z-10 before:h-2 before:w-2 before:rounded-full before:bg-mint-600 before:content-[''] after:absolute after:top-[8px] after:left-[3px] after:z-0 after:h-full after:w-px after:bg-gray-300 after:content-[''] last:pb-0 last:after:hidden md:mx-0 md:pl-0 md:after:hidden md:before:hidden">
      <div className="sm:mr-0">
        {(() => {
          const headerContent = (
            <div className="flex-1">
              <div className="text-gray-500 text-xs tracking-tight">{date}</div>
              <h3 className="whitespace-nowrap font-semibold text-lg text-mint-600 tracking-tight sm:text-xl">
                {title}
              </h3>
              <div className="-mt-0.5 whitespace-nowrap text-sm tracking-tight">
                <span className="font-medium text-gray-800">{company}</span>

                {(location || mode) && (
                  <span className="tracking-tighter sm:tracking-tight">
                    {" "}
                    ({mode && <span>{mode}</span>}
                    {mode && location && " - "}
                    {location && <span>{location}</span>})
                  </span>
                )}
              </div>
            </div>
          );

          const chevron = (
            <div className="ml-2 flex items-center text-mint-600">
              <FontAwesomeIcon
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                icon={faSortDown}
              />
            </div>
          );

          return (
            <>
              {/* Mobile/Tablet: Interactive button */}
              <button
                aria-label={
                  isExpanded ? "Collapse description" : "Expand description"
                }
                className="flex w-full cursor-pointer items-center text-left md:hidden"
                onClick={() => {
                  if (showFirstTimeTooltip && !isTooltipDismissed) {
                    setIsTooltipDismissing(true);
                    window.setTimeout(() => {
                      setIsTooltipDismissed(true);
                    }, 300);
                    onFirstInteraction?.();
                  }
                  setIsExpanded(!isExpanded);
                }}
                type="button"
              >
                <div className="min-w-0 flex-1">{headerContent}</div>
                <div className="ml-2 flex-shrink-0">{chevron}</div>
              </button>

              {/* Mobile-only first-time tooltip */}
              {shouldShowTooltip && (
                <div
                  className={`absolute inline-flex items-center gap-1 ${caveat.className} top-[-24px] left-[134px] text-gray-400 text-xl transition-all duration-300 md:hidden ${
                    isTooltipDismissing
                      ? "-translate-y-2 opacity-0"
                      : "translate-y-0 opacity-100"
                  }`}
                >
                  <HanddrawnArrowCurve className="h-6 w-6 translate-y-1 rotate-[-35deg] scale-x-[-1] scale-y-[1] text-gray-500" />
                  <span>tap to expand</span>
                </div>
              )}

              {/* Desktop: Non-interactive div */}
              <div className="hidden md:flex md:items-center md:justify-between">
                {headerContent}
              </div>
            </>
          );
        })()}
      </div>
      <div
        className={`description mt-2 overflow-hidden text-pretty text-gray-700 text-sm tracking-tight transition-all duration-300 ease-in-out [&>*+p]:mt-2 [&>*+ul]:mt-1 [&>ul>li::marker]:text-mint-600 [&>ul>li]:leading-snug [&>ul]:list-outside [&>ul]:list-disc [&>ul]:space-y-1 [&>ul]:pl-4 ${
          isExpanded
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 md:max-h-screen md:opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

type TimelineProps = {
  className?: string;
};

const Timeline = ({ className }: TimelineProps) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  return (
    <div className={className}>
      <h2 className="mb-8 text-left">
        <span className="font-semibold text-3xl text-mint-600 tracking-tight sm:text-4xl">
          Career timeline & achievements
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-[auto_auto] md:gap-6 lg:grid-cols-[32%_34%_auto] xl:grid-cols-[auto_25%_auto_auto]">
        <TimelineItem
          company="Arcohub"
          date="Nov 2024 - Oct 2025"
          location="Global"
          mode="Remote"
          onFirstInteraction={() => setHasInteracted(true)}
          showFirstTimeTooltip={!hasInteracted}
          title="AI Engineer"
        >
          <p>
            Built AI features and workflows for a business intelligence platform
            specializing in e-commerce and real-estate.
          </p>
          <ul>
            <li>
              Added AI features that leverage LLM + RAG, e.g. chatbot, semantic
              search, and predictive analysis.
            </li>
            <li>
              Created NLP workflows to categorize and structure raw data into
              context-relevant vector embeddings.
            </li>
            <li>
              Built data scrapers to collect and process e-commerce and real
              estate data (housing, geography, pricing, sales).
            </li>
          </ul>
        </TimelineItem>

        <TimelineItem
          company="Automattic"
          date="Jul 2020 - Oct 2024"
          location="San Francisco, US"
          mode="Remote"
          title="Engineering Team Lead"
        >
          <p>
            Led a 6-engineer team in modernizing Subscription Management on
            WordPress.com.
          </p>
          <ul>
            <li>Scaled to serve over 100 million blog subscribers.</li>
            <li>Built paid tiers and monetization features.</li>
            <li>
              Built tracking analytics that handle millions of real-time events
              daily.
            </li>
            <li>
              Complete overhaul of management dashboard and email notifications.
            </li>
          </ul>
          <p>
            Led a 4-engineer team in handling Bug Incident & Resolution on
            WordPress.com.
          </p>
          <ul>
            <li>
              Resolved over 300 technical issues in a 6-month bi-weekly sprint
              across various codebases.
            </li>
          </ul>
        </TimelineItem>

        <TimelineItem
          company="Automattic"
          date="Jan 2020 - Jun 2020"
          location="San Francisco, US"
          mode="Remote"
          title="Senior Software Engineer"
        >
          <ul>
            <li>
              Built various features for WordPress.com sign-up flow, e.g. site
              customization, pricing grid, domain upsell, intent capture, social
              & email login, e-commerce signup, and A/B testing.
            </li>
            <li>
              Implemented in-editor payment checkout flow, site launch, and site
              upgrade flow on the WordPress.com Site Editor.
            </li>
            <li>
              Added style customization panels to 10+ Jetpack blocks, created
              the PocketCasts block, and converted 20+ legacy shortcodes into
              blocks.
            </li>
          </ul>
        </TimelineItem>

        <TimelineItem
          company="T-Systems NL"
          date="May 2015 - Dec 2019"
          location="The Hague, NL"
          mode="Hybrid"
          title="BI & Data Engineer"
        >
          <p>
            Developed a suite of internal web-based tools for a terabyte-scale
            data warehouse specializing in server and cloud hosting, which
            includes:
          </p>
          <ul>
            <li>
              Drag & drop querying tool to create custom data reports with
              optimization and caching.
            </li>
            <li>
              Data visualization tool to easily explore relationships between
              data.
            </li>
            <li>
              Semantic search tool to quickly search through anything in the
              data lake.
            </li>
            <li>
              Migration tracking tool to assist server engineers in tracking
              large-scale server migrations.
            </li>
          </ul>
        </TimelineItem>

        <TimelineItem
          company="Google"
          date="Feb 2013 - Oct 2013"
          location="Global"
          mode="Remote"
          title="JavaScript Engineer (Mentor)"
        >
          <p>
            Served as a JavaScript mentor on Google Summer of Code (GSoC) 2013
            providing technical advisory on migrating Joomla&apos;s legacy
            MooTools-based JavaScript library to jQuery while maintaining 100%
            backwards compatibility with all existing codes in the Joomla!
            ecosystem.
          </p>

          <p>
            This collaborative open-source effort has been successfully rolled
            into Joomla&apos;s v3.2 release running on over 600 million websites
            worldwide.
          </p>
        </TimelineItem>

        <TimelineItem
          company="StackIdeas"
          date="Mar 2011 - Apr 2015"
          location="Kuala Lumpur, MY"
          title="Senior JavaScript Developer"
        >
          <p>
            Developed core product features for EasyBlog & EasySocial, e.g. drag
            & drop blog editor, media manager, image conversion and video
            transcoding, large media processing, blog revisions, software update
            system, photo sharing & tagging, geolocation tagging, link
            discovery, activity streams, and privacy control.
          </p>
          <p>
            Created a JavaScript MVC framework and tooling stack to unify how
            components, modules, and templates are built and deployed across all
            StackIdeas software.
          </p>
        </TimelineItem>

        <TimelineItem
          company="Slashes & Dots"
          date="Nov 2008 - Feb 2011"
          location="Kuala Lumpur, MY"
          title="Front End Developer"
        >
          <ul>
            <li>
              Built UI components and JavaScript widgets for JomSocial, a
              self-hosted social networking platform.
            </li>
            <li>Designed & developed templates for JomSocial.</li>
            <li>
              Designed the company&apos;s website, product logos, web banners,
              print, and marketing materials.
            </li>
          </ul>
        </TimelineItem>

        <TimelineItem
          company="Self-Employed"
          date="2004 - 2008"
          title="Freelance Coder & Designer"
        >
          <p>
            Worked on various freelance coding and design work in my high school
            & college years. Projects ranged from websites, company branding,
            product logos, vector art, animation, posters, banners, flyers,
            T-shirt designs. Highlights include:
          </p>
          <ul>
            <li>Paintr - a web-based SVG drawing app.</li>
            <li>Sims of Silicon Valley - a 28-page comic spread.</li>
          </ul>
          <p>
            My old design portfolio can be viewed at:
            <br />
            <a
              className="inline-flex items-center gap-1 underline-offset-3 hover:underline"
              href="https://behance.net/yansern"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FontAwesomeIcon className="h-4 w-4" icon={faBehanceSquare} />
              <span>behance.net/yansern</span>
            </a>
          </p>
        </TimelineItem>
      </div>
    </div>
  );
};

export { TimelineItem };
export default Timeline;
