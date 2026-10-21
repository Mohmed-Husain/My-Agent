"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { ExperienceData } from "@/lib/types";

export default function ExperienceCard({ experience }: { experience: ExperienceData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 p-4 transition-all duration-300 shadow-lg"
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            {experience.role}
          </h4>
          <span className="text-xs text-indigo-300 font-medium">
            {experience.company}
          </span>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <Calendar className="w-3 h-3 text-slate-400" />
            {experience.period}
          </span>
          <span className="block text-[10px] text-slate-500 mt-0.5 flex items-center justify-end gap-1">
            <MapPin className="w-2.5 h-2.5" /> {experience.location}
          </span>
        </div>
      </div>

      <ul className="space-y-1.5 mt-3 mb-3 border-l-2 border-indigo-500/30 pl-3">
        {experience.bullets.map((b, i) => (
          <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {experience.skills && experience.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
          {experience.skills.map((s, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-200 border border-indigo-900/40 font-mono"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
