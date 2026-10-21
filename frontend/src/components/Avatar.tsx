"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Brain, MessageSquare } from "lucide-react";
import Image from "next/image";

interface AvatarProps {
  state: "idle" | "thinking" | "talking";
  onClick?: () => void;
}

export default function Avatar({ state, onClick }: AvatarProps) {
  const handleTap = () => {
    if (onClick) onClick();
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Outer ambient dual glow matching the portrait's cyan and amber lighting */}
      <motion.div
        className="absolute -inset-4 rounded-full blur-2xl opacity-70 pointer-events-none"
        animate={{
          background:
            state === "talking"
              ? "radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(245,158,11,0.3) 100%)"
              : state === "thinking"
              ? "radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(6,182,212,0.3) 100%)"
              : "radial-gradient(circle, rgba(245,158,11,0.35) 0%, rgba(6,182,212,0.35) 100%)",
          scale: state === "talking" ? [1, 1.15, 1] : state === "thinking" ? [1, 1.2, 0.95, 1] : [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: state === "talking" ? 1.4 : state === "thinking" ? 2 : 4,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting cyber particles */}
      <motion.div
        className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full border border-cyan-500/30 border-dashed pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
      >
        <span className="absolute -top-1.5 left-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee]" />
        <span className="absolute -bottom-1 left-1/3 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]" />
      </motion.div>

      {/* Main Avatar Circle */}
      <motion.div
        onClick={handleTap}
        className="relative w-44 h-44 md:w-52 md:h-52 rounded-full cursor-pointer overflow-hidden p-1 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-500 shadow-2xl shadow-cyan-500/25"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Inner container */}
        <div className="relative w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-2 border-slate-800">
          {/* Real Portrait Asset */}
          <motion.div
            className="relative w-full h-full"
            animate={{
              scale: state === "talking" ? [1, 1.025, 1] : [1, 1.01, 1],
              y: state === "talking" ? [0, -2, 1, 0] : [0, -2, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: state === "talking" ? 0.8 : 3.5,
              ease: "easeInOut",
            }}
          >
            <Image
              src="/avatar/husain-avatar.jpg"
              alt="Mohmed Husain Pasheriya"
              fill
              sizes="(max-width: 768px) 176px, 208px"
              priority
              className="object-cover object-top select-none pointer-events-none"
            />
          </motion.div>

          {/* Thinking Holographic Scanning Beam */}
          {state === "thinking" && (
            <motion.div
              className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-purple-300 to-transparent shadow-[0_0_16px_#c084fc] pointer-events-none"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
            />
          )}

          {/* Speaking Audio Equalizer Overlay */}
          {state === "talking" && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center items-end gap-1 px-4 pointer-events-none">
              {[0.4, 0.9, 1.4, 0.7, 1.2, 0.5, 1.1].map((delay, i) => (
                <motion.span
                  key={i}
                  className="w-1 bg-gradient-to-t from-cyan-400 to-amber-300 rounded-full shadow-[0_0_8px_#22d3ee]"
                  animate={{ height: [6, 26, 10, 28, 6] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.55,
                    delay: i * 0.08,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Sound pulse wave radiating outward when talking */}
          {state === "talking" && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-400 pointer-events-none"
              animate={{ scale: [1, 1.25], opacity: [0.7, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
            />
          )}
        </div>
      </motion.div>

      {/* State badge */}
      <motion.div
        className="mt-3.5 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-xl text-xs font-medium text-slate-300 backdrop-blur-md"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {state === "talking" ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-300 flex items-center gap-1 font-semibold">
              <MessageSquare className="w-3.5 h-3.5" /> Speaking with you...
            </span>
          </>
        ) : state === "thinking" ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 flex items-center gap-1 font-semibold">
              <Brain className="w-3.5 h-3.5 animate-spin" /> Reasoning & searching...
            </span>
          </>
        ) : (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-emerald-300 flex items-center gap-1 font-semibold">
              <Zap className="w-3.5 h-3.5" /> Mohmed&apos;s AI Twin • Online
            </span>
          </>
        )}
      </motion.div>

      <span className="text-[11px] text-slate-500 mt-1">
        Tap avatar to interact
      </span>
    </div>
  );
}
