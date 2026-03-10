import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PenLine, BarChart3, Code2, Palette, Brain, Zap, Globe, Image, MessageSquare } from 'lucide-react';

interface WelcomeScreenProps {
  greeting: string;
  onSend: (message: string) => void;
}

const categories = [
  {
    label: 'Write',
    icon: PenLine,
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    prompts: [
      'Write a professional email to request a meeting',
      'Draft a compelling product description',
    ],
  },
  {
    label: 'Analyze',
    icon: BarChart3,
    color: 'from-emerald-500 to-teal-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    prompts: [
      'Explain quantum computing in simple terms',
      'Compare React vs Vue for a new project',
    ],
  },
  {
    label: 'Code',
    icon: Code2,
    color: 'from-violet-500 to-purple-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    prompts: [
      'Write a Python script for web scraping',
      'Build a REST API with Node.js and Express',
    ],
  },
  {
    label: 'Create',
    icon: Palette,
    color: 'from-pink-500 to-rose-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    iconColor: 'text-pink-400',
    prompts: [
      'Create a 7-day workout plan for beginners',
      'Design a social media content strategy',
    ],
  },
];

const capabilities = [
  { icon: Brain, label: 'Reasoning', color: 'text-violet-400' },
  { icon: Code2, label: 'Code Gen', color: 'text-emerald-400' },
  { icon: Image, label: 'Image Creation', color: 'text-pink-400' },
  { icon: Globe, label: 'Web Search', color: 'text-cyan-400' },
  { icon: Zap, label: 'Fast Responses', color: 'text-amber-400' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ greeting, onSend }) => {
  return (
    <motion.div
      className="h-full flex flex-col items-center justify-center p-6 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div variants={itemVariants} className="relative mb-8">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-accent to-purple-600 blur-2xl opacity-30 animate-pulse-ring" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center shadow-2xl glow-accent-lg">
          <Sparkles size={36} className="text-white" />
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.h1
        variants={itemVariants}
        className="text-4xl md:text-5xl font-bold text-gradient mb-3 tracking-tight text-center"
      >
        {greeting}
      </motion.h1>
      <motion.p
        variants={itemVariants}
        className="text-gray-400 text-base md:text-lg max-w-xl text-center mb-10 leading-relaxed"
      >
        Experience the next generation of AI. Choose a prompt below or type your own.
      </motion.p>

      {/* Capability Pills */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-center gap-2 mb-10"
      >
        {capabilities.map((cap) => (
          <div
            key={cap.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-gray-400"
          >
            <cap.icon size={13} className={cap.color} />
            {cap.label}
          </div>
        ))}
      </motion.div>

      {/* Categorized Suggestion Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl"
      >
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-2">
            <div className={`flex items-center gap-2 px-1 mb-1`}>
              <div className={`w-6 h-6 rounded-lg ${cat.bgColor} flex items-center justify-center`}>
                <cat.icon size={14} className={cat.iconColor} />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cat.label}</span>
            </div>
            {cat.prompts.map((prompt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSend(prompt)}
                className={`w-full text-left px-4 py-3 rounded-xl bg-white/[0.03] border ${cat.borderColor} hover:bg-white/[0.06] transition-all duration-200 group`}
                aria-label={`Send: ${prompt}`}
              >
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                  {prompt}
                </p>
              </motion.button>
            ))}
          </div>
        ))}
      </motion.div>

      {/* Bottom hint */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 mt-8 text-xs text-gray-500"
      >
        <MessageSquare size={12} />
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[10px]">Enter</kbd> to send a message</span>
      </motion.div>
    </motion.div>
  );
};
