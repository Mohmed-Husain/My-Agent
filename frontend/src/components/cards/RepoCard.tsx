"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink, Code } from "lucide-react";
import { RepoData } from "@/lib/types";

export default function RepoCard({ repo }: { repo: RepoData }) {
  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="block rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 p-3.5 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 group"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h4 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-cyan-400" />
          {repo.name}
        </h4>
        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
        {repo.description || "Open source project by Mohmed Husain"}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          {repo.language || "Python"}
        </span>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 hover:text-amber-300">
            <Star className="w-3 h-3 text-amber-400" />
            {repo.stars || 0}
          </span>
          <span className="flex items-center gap-1 hover:text-slate-300">
            <GitFork className="w-3 h-3 text-slate-400" />
            {repo.forks || 0}
          </span>
        </div>
      </div>
    </motion.a>
  );
}
