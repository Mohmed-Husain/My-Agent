"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, ArrowRight } from "lucide-react";
import { QuestionData } from "@/lib/types";

interface QuestionCardProps {
  data: QuestionData;
  onSelectOption: (option: string) => void;
}

export default function QuestionCard({ data, onSelectOption }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-900/90 border border-cyan-500/30 p-3.5 my-2 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-2 text-cyan-300 font-medium text-xs">
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{data.question}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {data.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onSelectOption(option)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs font-medium active:scale-95 text-left"
          >
            <span>{option}</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
