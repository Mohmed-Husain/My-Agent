"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Award, CheckCircle, ExternalLink, Cpu, Users } from "lucide-react";
import { AchievementData } from "@/lib/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="w-5 h-5 text-amber-400" />,
  Award: <Award className="w-5 h-5 text-purple-400" />,
  CheckCircle: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  Cpu: <Cpu className="w-5 h-5 text-cyan-400" />,
  Users: <Users className="w-5 h-5 text-blue-400" />,
};

export default function AchievementCard({ achievement }: { achievement: AchievementData }) {
  const icon = (achievement.icon && ICON_MAP[achievement.icon]) || <Trophy className="w-5 h-5 text-amber-400" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-4 transition-all duration-300 shadow-lg flex gap-3.5 items-start"
    >
      <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shrink-0 shadow-inner">
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-slate-100 text-sm">
            {achievement.title}
          </h4>
          <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {achievement.year}
          </span>
        </div>

        <span className="text-[11px] font-medium text-amber-400/90 block mb-1.5">
          {achievement.badge} • {achievement.category}
        </span>

        <p className="text-xs text-slate-300 leading-relaxed">
          {achievement.description}
        </p>

        {achievement.link && (
          <a
            href={achievement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 mt-2 font-medium"
          >
            <span>Learn more</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
