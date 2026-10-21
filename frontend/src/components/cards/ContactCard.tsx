"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Globe, MapPin } from "lucide-react";
import { ContactData } from "@/lib/types";

export default function ContactCard({ contact }: { contact: ContactData }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-cyan-500/30 p-5 shadow-2xl shadow-cyan-500/10"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
          MHP
        </div>
        <div>
          <h4 className="font-semibold text-slate-100 text-sm">
            {contact.name}
          </h4>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" /> {contact.location}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        I am currently open to full-time roles, AI backend engineering opportunities, and cutting-edge agentic AI collaborations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition-all text-xs font-medium"
        >
          <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
          <span className="truncate">{contact.email}</span>
        </a>

        <a
          href={contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/50 hover:text-white transition-all text-xs font-medium"
        >
          <Linkedin className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>LinkedIn Profile</span>
        </a>

        <a
          href={contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-xs font-medium"
        >
          <Github className="w-4 h-4 shrink-0 text-slate-400" />
          <span>GitHub @Mohmed-Husain</span>
        </a>

        <a
          href={contact.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-300 hover:bg-purple-900/50 hover:text-white transition-all text-xs font-medium"
        >
          <Globe className="w-4 h-4 shrink-0 text-purple-400" />
          <span>mohmed-husain.in</span>
        </a>
      </div>
    </motion.div>
  );
}
