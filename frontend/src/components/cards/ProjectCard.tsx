"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { ProjectData } from "@/lib/types";

export default function ProjectCard({ project }: { project: ProjectData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 p-4 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
    >
      <div>
        {/* Header with Title and Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-slate-100 text-base group-hover:text-cyan-300 transition-colors">
            {project.title}
          </h4>
          {project.badge && (
            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {project.badge}
            </span>
          )}
        </div>

        {/* Category tag */}
        {project.category && (
          <span className="text-[11px] font-mono text-slate-400 block mb-2">
            {"//"} {project.category}
          </span>
        )}

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {project.description}
        </p>

        {/* Highlights toggle */}
        {project.highlights && project.highlights.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
            >
              {expanded ? (
                <>
                  Hide Key Highlights <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  View Key Highlights ({project.highlights.length}){" "}
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>

            {expanded && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 space-y-1.5 pl-2 border-l border-slate-700/80"
              >
                {project.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-slate-300 flex items-start gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
        )}

        {/* Tech Stack Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tech_stack.map((tech, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Action Links */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Code</span>
          </a>
        )}
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/50 px-3 py-1.5 rounded-lg transition-colors border border-cyan-800/50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Demo</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}
