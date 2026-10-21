"use client";

import React from "react";
import {
  CardItem,
  ProjectData,
  AchievementData,
  ExperienceData,
  SkillCategory,
  RepoData,
  ContactData,
  QuestionData,
} from "@/lib/types";
import ProjectCard from "./cards/ProjectCard";
import AchievementCard from "./cards/AchievementCard";
import ExperienceCard from "./cards/ExperienceCard";
import RepoCard from "./cards/RepoCard";
import SkillCard from "./cards/SkillCard";
import ContactCard from "./cards/ContactCard";
import QuestionCard from "./cards/QuestionCard";

interface CardRendererProps {
  card: CardItem;
  onSelectOption: (option: string) => void;
}

export default function CardRenderer({ card, onSelectOption }: CardRendererProps) {
  const { card_type, data } = card;

  switch (card_type) {
    case "projects_list":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
          {Array.isArray(data) &&
            (data as ProjectData[]).map((p, i) => (
              <ProjectCard key={p.id || i} project={p} />
            ))}
        </div>
      );

    case "project_detail":
      return (
        <div className="my-3 max-w-xl">
          <ProjectCard project={data as ProjectData} />
        </div>
      );

    case "achievements_list":
      return (
        <div className="space-y-2.5 my-3">
          {Array.isArray(data) &&
            (data as AchievementData[]).map((ach, i) => (
              <AchievementCard key={ach.id || i} achievement={ach} />
            ))}
        </div>
      );

    case "experience_list":
      return (
        <div className="space-y-3 my-3">
          {Array.isArray(data) &&
            (data as ExperienceData[]).map((exp, i) => (
              <ExperienceCard key={exp.company || i} experience={exp} />
            ))}
        </div>
      );

    case "skills_matrix":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
          {Array.isArray(data) &&
            (data as SkillCategory[]).map((cat, i) => (
              <SkillCard key={cat.name || i} category={cat} />
            ))}
        </div>
      );

    case "repos_list":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
          {Array.isArray(data) &&
            (data as RepoData[]).map((repo, i) => (
              <RepoCard key={repo.name || i} repo={repo} />
            ))}
        </div>
      );

    case "contact_card":
      return (
        <div className="my-3 max-w-lg">
          <ContactCard contact={data as ContactData} />
        </div>
      );

    case "question_card":
      return (
        <QuestionCard
          data={data as QuestionData}
          onSelectOption={onSelectOption}
        />
      );

    default:
      return null;
  }
}
