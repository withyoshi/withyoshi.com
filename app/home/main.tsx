"use client";
import {
  faBrush,
  faCompass,
  faFaceLaughBeam,
  faKeyboard,
  faMusic,
  faPersonShelter,
  faPersonWalkingDashedLineArrowRight,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import GlassmorphismCard from "../../components/retrowave/glassmorphism-card";
import RolodexText from "../../components/retrowave/rolodex-text";
import { useIsYoshiTheme } from "../../lib/site-context";
import MoonMesh from "./images/moon-mesh.svg";

const roleItems = [
  "maker",
  "tinkerer",
  "codemonkey",
  "shutterbug",
  "pianist",
  "foodie",
  "globetrotter",
];

const identityItems = [
  "personal branding",
  "stage name",
  "online identity",
  "public persona",
  "professional alias",
  "digital pseudonym",
  "alter ego",
];

const identityCards = [
  {
    icon: faPersonWalkingDashedLineArrowRight,
    title: "Online Identity",
    description:
      "Taking on the name Yoshi identity creates a dedicated digital persona that operates totally <strong>separate from my private life</strong>.",
  },
  {
    icon: faWandMagicSparkles,
    title: "Creative Freedom",
    description:
      "Adopting Yoshi means I can finally <strong>experiment, explore unusual ideas, and take creative risks</strong> without holding anything back.",
  },
  {
    icon: faFaceLaughBeam,
    title: "Friendly Branding",
    description:
      "I wear many hats - coder, photographer, maker, and more. The Yoshi branding <strong>ties everything under one roof</strong> in a fun, friendly and casual setting.",
  },
  {
    icon: faPersonShelter,
    title: "Safety First",
    description:
      "In this crazy world filled with trackers and cookies, I'm just making sure I have <strong>some sanity and security</strong> over my personal data and privacy.",
  },
];

const roleCards = [
  {
    icon: faKeyboard,
    title: "Tech Tinkerer",
    description:
      "I'm a <strong>codemonkey and keyboard basher</strong> who likes coding, debugging, experimenting with new toys, building computers and configuring servers in my homelab.",
  },
  {
    icon: faBrush,
    title: "Visual Dabbler",
    description:
      "I'm a <strong>shutterbug and pixel painter</strong> who likes taking travel portraits and street photography, creating digital artwork and making beautiful looking things.",
  },
  {
    icon: faMusic,
    title: "Jazz Operator",
    description:
      "I'm a <strong>rusty pianist and bedroom producer</strong> who likes discovering unique chord combinations, jazz improvisation and making music in my bedroom.",
  },
  {
    icon: faCompass,
    title: "Culture Vulture",
    description:
      "I'm a <strong>globetrotter, foodie and polyglot</strong> who likes exploring new places, trying out new foods, learning new languages and experiencing new cultures.",
  },
];

export default function Main() {
  const isYoshiTheme = useIsYoshiTheme();
  const cards = isYoshiTheme ? roleCards : identityCards;

  return (
    <main className="relative z-10 mx-auto overflow-hidden bg-black text-center">
      <div className="relative z-20 mx-auto max-w-screen-md rounded-lg px-10">
        <div className="">
          <RolodexText items={isYoshiTheme ? roleItems : identityItems} />
        </div>

        {/* Identity reasons */}
        <section className="relative z-10 grid gap-6 pb-28 sm:grid-cols-2">
          {cards.map((card) => (
            <GlassmorphismCard
              description={card.description}
              icon={card.icon}
              key={card.title}
              title={card.title}
            />
          ))}
        </section>

        {/* Moon Mesh */}
        <section className="absolute bottom-0 left-0 aspect-[2.5/1] w-full overflow-hidden md:left-[-10%] md:w-[120%]">
          <div className="pointer-events-none absolute top-0 aspect-[1/1] w-full [mask-image:linear-gradient(to_bottom,black_25%,transparent_50%)]">
            <MoonMesh className="absolute h-full w-full animate-spin object-contain object-center opacity-50 duration-[300s]" />
          </div>
        </section>
      </div>

      <div
        className="backdrop fx-cloud-gradient-bg absolute top-0 left-0 z-10 h-full w-full overflow-hidden opacity-50"
        style={
          {
            "--fx-gradient-color": "rgba(0, 175, 185, 0.2)",
          } as React.CSSProperties
        }
      />
    </main>
  );
}
