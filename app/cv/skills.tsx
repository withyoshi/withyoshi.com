const skills = [
  {
    category: "Web Development",
    skills: [
      "React / Vue",
      "Next.js",
      "TypeScript",
      "PHP",
      "Laravel",
      "Tailwind CSS",
    ],
  },
  {
    category: "Data Engineering",
    skills: ["PostgreSQL", "MongoDB", "Redis", "ETL", "ORM", "Data Modelling"],
  },
  {
    category: "Applied AI",
    skills: ["Python", "LLM", "RAG", "LangChain", "HuggingFace", "Data Prep"],
  },
  {
    category: "Tooling & Deployment",
    skills: [
      "Docker",
      "CI/CD",
      "DevOps",
      "Scripting",
      "ELK Stack",
      "Cloud Platforms",
    ],
  },
];

type SkillsProps = {
  className?: string;
};

export default function Skills({ className }: SkillsProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 ${className || ""}`}
    >
      {skills.map((skill) => (
        <div className="p-2 px-6" key={skill.category}>
          <h5 className="font-bold text-sm text-white">{skill.category}</h5>
          <ul className="columns-3 gap-3 text-white/90 text-xs">
            {skill.skills.map((skillName) => (
              <li
                className="break-inside-avoid whitespace-nowrap"
                key={skillName}
              >
                {skillName}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
