import React from 'react';
import { motion } from 'framer-motion';

interface AnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FadeInUp: React.FC<AnimationProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FadeIn: React.FC<AnimationProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideInRight: React.FC<AnimationProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer: React.FC<AnimationProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<AnimationProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn: React.FC<AnimationProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── FloatAnimation: gentle up-down float for hero logos ──────────────────────
export const FloatAnimation: React.FC<AnimationProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── GlowPulse: subtle pulsing glow wrapper ────────────────────────────────────
export const GlowPulse: React.FC<AnimationProps & { color?: string }> = ({
  children,
  className = '',
  color = 'rgba(201,162,39,0.4)',
}) => {
  return (
    <motion.div
      animate={{ filter: [`drop-shadow(0 0 8px ${color})`, `drop-shadow(0 0 24px ${color})`, `drop-shadow(0 0 8px ${color})`] }}
      transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── RevealText: character-by-character text reveal ───────────────────────────
interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  charDelay?: number;
}
export const RevealText: React.FC<RevealTextProps> = ({
  text,
  className = '',
  delay = 0,
  charDelay = 0.04,
}) => {
  const chars = Array.from(text);
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: charDelay, delayChildren: delay } } }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
            show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// ── SlideInLeft: slide from left (RTL-friendly) ───────────────────────────────
export const SlideInLeft: React.FC<AnimationProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
