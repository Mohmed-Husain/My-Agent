export type Role = "user" | "assistant" | "system";

export interface ProjectData {
  id: string;
  title: string;
  badge?: string;
  category?: string;
  description: string;
  tech_stack: string[];
  highlights?: string[];
  github_url?: string;
  live_url?: string;
  featured?: boolean;
}

export interface AchievementData {
  id: string;
  title: string;
  category: string;
  year: string;
  badge: string;
  description: string;
  icon?: string;
  link?: string;
}

export interface ExperienceData {
  company: string;
  location: string;
  role: string;
  period: string;
  type?: string;
  bullets: string[];
  skills: string[];
}

export interface SkillCategory {
  name: string;
  icon?: string;
  skills: string[];
}

export interface RepoData {
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  topics?: string[];
  updated_at?: string;
}

export interface ContactData {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  website: string;
  location: string;
}

export interface QuestionData {
  question: string;
  options: string[];
}

export type CardType =
  | "projects_list"
  | "project_detail"
  | "achievements_list"
  | "experience_list"
  | "skills_matrix"
  | "repos_list"
  | "contact_card"
  | "question_card";

export interface CardItem {
  card_type: CardType;
  data: Record<string, unknown> | Array<Record<string, unknown>> | unknown;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  cards?: CardItem[];
  created_at?: string;
  isStreaming?: boolean;
}
