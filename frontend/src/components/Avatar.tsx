"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Zap, Brain, MessageSquare } from "lucide-react";

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
      {/* Outer ambient glow reflecting the current AI state */}
      <motion.div
        className="absolute -inset-6 rounded-full blur-2xl opacity-70 pointer-events-none"
        animate={{
          backgroundColor:
            state === "talking"
              ? "rgba(6, 182, 212, 0.45)" // cyan glow
              : state === "thinking"
              ? "rgba(168, 85, 247, 0.45)" // purple glow
              : "rgba(56, 189, 248, 0.25)", // soft sky blue glow
          scale:
            state === "talking"
              ? [1, 1.18, 1]
              : state === "thinking"
              ? [1, 1.25, 0.96, 1]
              : [1, 1.06, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: state === "talking" ? 1.2 : state === "thinking" ? 2 : 4,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting cyber particles */}
      <motion.div
        className="absolute w-56 h-56 rounded-full border border-cyan-500/20 border-dashed pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      >
        <span className="absolute -top-1.5 left-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee]" />
        <span className="absolute -bottom-1.5 left-1/3 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_#c084fc]" />
      </motion.div>

      {/* Sound wave ripples when talking */}
      {state === "talking" && (
        <>
          <motion.div
            className="absolute -inset-3 rounded-full border-2 border-cyan-400/60 pointer-events-none"
            animate={{ scale: [1, 1.2], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
          />
          <motion.div
            className="absolute -inset-3 rounded-full border border-indigo-400/40 pointer-events-none"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: 0.4,
              ease: "easeOut",
            }}
          />
        </>
      )}

      {/* Main Avatar Container with cyber neon bezel */}
      <motion.div
        onClick={handleTap}
        className="relative w-44 h-44 md:w-52 md:h-52 rounded-full cursor-pointer p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 shadow-[0_0_35px_rgba(34,211,238,0.3)] transition-shadow duration-300 hover:shadow-[0_0_45px_rgba(34,211,238,0.5)]"
        animate={{
          y: state === "talking" ? [0, -4, 2, 0] : [0, -6, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: state === "talking" ? 0.8 : 3.5,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Inner container */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
          {/* Real Avatar Portrait */}
          <Image
            src="/avatar.jpg"
            alt="Mohmed Husain Pasheriya"
            fill
            priority
            sizes="(max-width: 768px) 176px, 208px"
            className="object-cover rounded-full select-none"
          />

          {/* Thinking Holographic Scanning Beam */}
          {state === "thinking" && (
            <motion.div
              className="absolute inset-x-0 h-2 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_15px_#c084fc] pointer-events-none"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
            />
          )}

          {/* Talking Audio Equalizer Overlay at the base */}
          {state === "talking" && (
            <div className="absolute bottom-2 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 shadow-lg">
              {[0.4, 0.8, 1.2, 0.6, 1.0].map((delay, i) => (
                <motion.span
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee]"
                  animate={{ height: [4, 16, 6, 18, 4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* State badge */}
      <motion.div
        className="mt-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-xl text-xs font-medium text-slate-300"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {state === "talking" ? (
          <>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Speaking with you...
            </span>
          </>
        ) : state === "thinking" ? (
          <>
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 animate-spin" /> Reasoning with DeepSeek...
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-emerald-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Mohmed&apos;s AI Twin • Online
            </span>
          </>
        )}
      </motion.div>

      <span className="text-[11px] text-slate-500 mt-1.5">
        Tap avatar to interact
      </span>
    </div>
  );
}
