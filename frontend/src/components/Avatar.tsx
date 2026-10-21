"use client";

import React from "react";
import { motion } from "framer-motion";
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
      {/* Outer ambient glow based on state */}
      <motion.div
        className="absolute -inset-4 rounded-full blur-2xl opacity-60 pointer-events-none"
        animate={{
          backgroundColor:
            state === "talking"
              ? "rgba(6, 182, 212, 0.4)" // cyan
              : state === "thinking"
              ? "rgba(168, 85, 247, 0.4)" // purple
              : "rgba(16, 185, 129, 0.25)", // emerald
          scale: state === "talking" ? [1, 1.15, 1] : state === "thinking" ? [1, 1.25, 0.95, 1] : [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: state === "talking" ? 1.4 : state === "thinking" ? 2 : 4,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting particles */}
      <motion.div
        className="absolute w-48 h-48 rounded-full border border-cyan-500/20 border-dashed pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        <span className="absolute -top-1.5 left-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee]" />
        <span className="absolute -bottom-1 left-1/3 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_#c084fc]" />
      </motion.div>

      {/* Main Avatar Circle */}
      <motion.div
        onClick={handleTap}
        className="relative w-36 h-36 md:w-44 md:h-44 rounded-full cursor-pointer overflow-hidden p-1 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-2xl shadow-cyan-500/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        {/* Inner container with glass effect */}
        <div className="relative w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden border border-slate-800">
          {/* Cyber grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:14px_14px] opacity-40" />

          {/* Holographic Avatar Graphic */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            animate={{
              y: state === "talking" ? [0, -3, 2, 0] : [0, -4, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: state === "talking" ? 0.6 : 3,
              ease: "easeInOut",
            }}
          >
            {/* Avatar Head Silhouette / Robot Cyber Persona */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center shadow-inner">
              {/* Head circuit lines */}
              <div className="absolute top-2 w-8 h-0.5 bg-cyan-400/50 rounded-full" />
              
              {/* Digital Eyes / Visor */}
              <div className="flex gap-4 items-center">
                <motion.div
                  className="w-4 h-2 md:w-5 md:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                  animate={{
                    scaleY: [1, 1, 0.1, 1],
                    backgroundColor: state === "thinking" ? "#c084fc" : "#22d3ee",
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.5,
                    times: [0, 0.9, 0.95, 1],
                  }}
                />
                <motion.div
                  className="w-4 h-2 md:w-5 md:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                  animate={{
                    scaleY: [1, 1, 0.1, 1],
                    backgroundColor: state === "thinking" ? "#c084fc" : "#22d3ee",
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.5,
                    times: [0, 0.9, 0.95, 1],
                  }}
                />
              </div>

              {/* Mouth Waveform when Talking */}
              <div className="absolute bottom-4 flex items-center gap-1">
                {state === "talking" ? (
                  [0.4, 0.8, 1.2, 0.7, 0.3].map((delay, i) => (
                    <motion.span
                      key={i}
                      className="w-1 bg-cyan-300 rounded-full shadow-[0_0_6px_#67e8f9]"
                      animate={{ height: [4, 16, 6, 18, 4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.1,
                      }}
                    />
                  ))
                ) : (
                  <div className="w-6 h-1 rounded-full bg-slate-600/70" />
                )}
              </div>
            </div>

            {/* Shoulders / Torso hint */}
            <div className="w-28 h-8 -mt-1 rounded-t-full bg-gradient-to-b from-slate-800 to-slate-900/60 border-t border-slate-700/60" />
          </motion.div>

          {/* Thinking scanner effect */}
          {state === "thinking" && (
            <motion.div
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_#c084fc]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}

          {/* Sound wave rings radiating outwards when talking */}
          {state === "talking" && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-400"
              animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
            />
          )}
        </div>
      </motion.div>

      {/* State badge */}
      <motion.div
        className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 shadow-lg text-xs font-medium text-slate-300"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {state === "talking" ? (
          <>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-300 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Speaking with you...
            </span>
          </>
        ) : state === "thinking" ? (
          <>
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 flex items-center gap-1">
              <Brain className="w-3 h-3 animate-spin" /> Retrieving context...
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-emerald-300 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Mohmed&apos;s AI Twin • Online
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
