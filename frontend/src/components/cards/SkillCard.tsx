"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Brain, Server, Database } from "lucide-react";
import { SkillCategory } from "@/lib/types";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Bot: <Bot className="w-4 h-4 text-cyan-400" />,
  Brain: <Brain className="w-4 h-4 text-purple-400" />,
  Server: <Server className="w-4 h-4 text-emerald-400" />,
  Database: <Database className="w-4 h-4 text-amber-400" />,
};

export default function SkillCard({ category }: { category: SkillCategory }) {
  const icon = (category.icon && CATEGORY_ICONS[category.icon]) || <Bot className="w-4 h-4 text-cyan-400" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
          {icon}
        </div>
        <h4 className="font-semibold text-slate-100 text-xs tracking-wide uppercase">
          {category.name}
        </h4>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {category.skills.map((skill, i) => (
          <span
            key={i}
            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/80 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors font-mono"
          >
            {skill}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
