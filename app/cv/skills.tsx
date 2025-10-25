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

interface SkillsProps {
  className?: string;
}

export default function Skills({ className }: SkillsProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 ${className || ""}`}
    >
      {skills.map((skill) => (
        <div key={skill.category} className="p-2 px-6">
          <h5 className="text-sm font-bold text-white">{skill.category}</h5>
          <ul className="columns-3 gap-3 text-xs text-white/90">
            {skill.skills.map((skill) => (
              <li key={skill} className="break-inside-avoid whitespace-nowrap">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
