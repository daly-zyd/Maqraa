import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "../assets/Logo Bel Quroan Nahyaa.png";

export const CinemaIntro: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [hasSettled, setHasSettled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Phase 1: Settle banner at ~1.8s
    const settleTimer = setTimeout(() => {
      setHasSettled(true);
    }, 1800);

    // Phase 2: Start smooth exit ascent at 4.2s
    const exitTimer = setTimeout(() => {
      setIsClosing(true);
    }, 4200);

    // Phase 3: Unmount at 5.1s
    const unmountTimer = setTimeout(() => {
      setVisible(false);
    }, 5100);

    timerRef.current = [settleTimer, exitTimer, unmountTimer];

    return () => {
      timerRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleDismiss = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setVisible(false);
    }, 750);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="quranic-suspended-intro"
          onClick={handleDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden bg-[#010c08]/88 backdrop-blur-lg"
          title="انقر في أي مكان لتخطي المقدمة"
        >
          {/* ─── Ambient Glow Blobs Behind Banner ─── */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gold-500/12 blur-[130px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/15 blur-[90px] pointer-events-none" />

          {/* ═══════════════════════════════════════════════════════════════
              SUSPENDED BANNER ASSEMBLY WITH REALISTIC PHYSICS
             ═══════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ y: "-135vh", rotate: -3.5 }}
            animate={
              isClosing
                ? { y: "-135vh", rotate: 2, opacity: 0 }
                : hasSettled
                ? {
                    y: [0, -3, 0],
                    rotate: [-0.35, 0.35, -0.35],
                    opacity: 1,
                    transition: {
                      y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                      opacity: { duration: 0.3 }
                    }
                  }
                : {
                    y: 0,
                    rotate: [-3.5, 2.2, -1.2, 0.6, -0.2, 0],
                    opacity: 1,
                    transition: {
                      y: { duration: 1.45, ease: [0.16, 1, 0.3, 1] },
                      rotate: { duration: 2.2, ease: "easeOut" },
                      opacity: { duration: 0.3 }
                    }
                  }
            }
            className="relative flex flex-col items-center max-w-[480px] w-[90vw] sm:w-[440px] md:w-[460px] pt-10 sm:pt-14 pb-2"
          >
            {/* ─── Hanging Braided Cords from Ceiling ─── */}
            <div className="absolute top-0 inset-x-0 h-14 sm:h-18 pointer-events-none flex justify-between px-8 sm:px-14">
              {/* Left Braided Golden Cord */}
              <div className="relative flex flex-col items-center h-full">
                {/* Ceiling Mount Ring */}
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-gold-300 bg-emerald-950 shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                {/* Braided Texture Cord */}
                <div className="w-1 sm:w-1.5 flex-1 bg-[repeating-linear-gradient(45deg,#d4af37,#d4af37_2px,#f3e46c_2px,#f3e46c_4px,#996515_4px,#996515_6px)] shadow-[0_0_8px_rgba(212,175,55,0.5)] rounded-full" />
                {/* Hook / Ring to Crossbar */}
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-gold-300 bg-gold-600 shadow-md -mb-1 z-30" />
              </div>

              {/* Right Braided Golden Cord */}
              <div className="relative flex flex-col items-center h-full">
                {/* Ceiling Mount Ring */}
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-gold-300 bg-emerald-950 shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                {/* Braided Texture Cord */}
                <div className="w-1 sm:w-1.5 flex-1 bg-[repeating-linear-gradient(-45deg,#d4af37,#d4af37_2px,#f3e46c_2px,#f3e46c_4px,#996515_4px,#996515_6px)] shadow-[0_0_8px_rgba(212,175,55,0.5)] rounded-full" />
                {/* Hook / Ring to Crossbar */}
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-gold-300 bg-gold-600 shadow-md -mb-1 z-30" />
              </div>
            </div>

            {/* ─── Top 3D Carved Horizontal Bar (Crossbar) ─── */}
            <div className="relative w-full h-3.5 sm:h-4 bg-gradient-to-r from-[#8b6508] via-[#ffd700] via-[#ffe066] to-[#8b6508] rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.7),0_0_12px_rgba(212,175,55,0.4)] flex items-center justify-between px-1 z-20 border border-gold-200/60">
              {/* Left Sphere Finial */}
              <div className="w-4 h-4 sm:w-5 sm:h-5 -ml-1 sm:-ml-2 rounded-full bg-gradient-to-tr from-gold-700 via-gold-300 to-gold-100 border border-gold-200 shadow-lg flex-shrink-0" />
              {/* Right Sphere Finial */}
              <div className="w-4 h-4 sm:w-5 sm:h-5 -mr-1 sm:-mr-2 rounded-full bg-gradient-to-tl from-gold-700 via-gold-300 to-gold-100 border border-gold-200 shadow-lg flex-shrink-0" />
            </div>

            {/* ─── Main Suspended Quranic Panel ─── */}
            <div className="relative w-full bg-gradient-to-b from-[#022017] via-[#042d20] to-[#01140e] border-2 border-gold-400 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(212,175,55,0.25)] p-5 sm:p-8 text-center overflow-hidden">
              
              {/* Gold Shimmer Beam on Panel Surface */}
              <motion.div
                initial={{ x: "-150%", opacity: 0 }}
                animate={{ x: "150%", opacity: [0, 0.45, 0] }}
                transition={{ duration: 1.6, delay: 1.4, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-200/30 to-transparent skew-x-12 pointer-events-none z-30"
              />

              {/* Outer Inset Shadow & Vignette */}
              <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.7)] pointer-events-none rounded-2xl" />

              {/* Inner Double Gold Border */}
              <div className="absolute inset-2 sm:inset-2.5 border border-gold-500/40 rounded-xl pointer-events-none" />
              <div className="absolute inset-3 sm:inset-3.5 border border-gold-500/20 rounded-lg pointer-events-none" />

              {/* Corner Arabesque Motif Accents */}
              <div className="absolute top-3.5 right-3.5 text-gold-400/80 text-xs font-serif select-none pointer-events-none">❖</div>
              <div className="absolute top-3.5 left-3.5 text-gold-400/80 text-xs font-serif select-none pointer-events-none">❖</div>
              <div className="absolute bottom-3.5 right-3.5 text-gold-400/80 text-xs font-serif select-none pointer-events-none">❖</div>
              <div className="absolute bottom-3.5 left-3.5 text-gold-400/80 text-xs font-serif select-none pointer-events-none">❖</div>

              {/* Background Islamic Geometric Pattern */}
              <div className="absolute inset-0 islamic-pattern opacity-[0.04] pointer-events-none" />

              {/* ─── Panel Content ─── */}
              <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
                
                {/* Top Bismillah Header */}
                <div className="text-gold-300 font-amiri text-[11px] sm:text-sm tracking-widest flex items-center gap-2 drop-shadow-sm">
                  <span className="w-6 sm:w-8 h-[1px] bg-gradient-to-r from-transparent to-gold-400" />
                  <span>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
                  <span className="w-6 sm:w-8 h-[1px] bg-gradient-to-l from-transparent to-gold-400" />
                </div>

                {/* Logo with Ambient Pulsing Sunburst */}
                <div className="relative w-18 h-18 sm:w-24 sm:h-24 my-0.5 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gold-400/25 blur-xl scale-125 animate-pulse pointer-events-none" />
                  <img
                    src={logoImg}
                    alt="مقرأة بالقرآن نحيا"
                    width={96}
                    height={96}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.7)]"
                  />
                </div>

                {/* Main Vocalized Calligraphy: بِالقُرْآنِ نَحْيَا */}
                <div className="space-y-1">
                  <h1 className="font-quran text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-b from-[#fff2b2] via-[#ffd700] to-[#c99700] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(212,175,55,0.6)] flex items-baseline justify-center gap-2 sm:gap-4" style={{ lineHeight: 2, transform: 'scaleY(1.2)', transformOrigin: 'center' }}>
                    <span>بِالقرآنِ</span>
                    <span>نَحْيَا</span>
                  </h1>
                  <p className="text-[10px] sm:text-xs font-black text-gold-200/90 tracking-widest">
                  مقرأة قرآنية تعليمية مجانية 100%
                  </p>
                </div>

                {/* Ornate Gold Filigree Divider */}
                <div className="flex items-center justify-center gap-2.5 w-44 sm:w-60 my-0.5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400 to-gold-300" />
                  <span className="text-gold-300 text-xs sm:text-sm">✦</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold-400 to-gold-300" />
                </div>

                {/* Supervisor & Founder Info */}
                <div className="space-y-0.5 text-stone-200">
                  <p className="text-[9px] sm:text-[11px] text-stone-300 font-light">
                    تحت إشراف
                  </p>
                  <p className="text-xs sm:text-base font-bold text-white tracking-wide drop-shadow-sm">
                    فضيلة الشيخ شريف سعد
                  </p>
                  <p className="text-[9px] sm:text-[11px] text-gold-400 font-medium">
                    (المؤسس والمشرف العام)
                  </p>
                </div>

              </div>

              {/* Bottom Gold Panel Timer Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 4.2, ease: "linear" }}
                style={{ originX: 0 }}
                className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 shadow-[0_0_8px_rgba(212,175,55,0.7)] pointer-events-none"
              />
            </div>

            {/* ─── Bottom Suspended Silk Tassels with Secondary Inertia Physics ─── */}
            <div className="relative w-full flex justify-around px-8 -mt-1 pointer-events-none">
              
              {/* Left Tassel */}
              <motion.div
                animate={
                  hasSettled
                    ? { rotate: [-1.2, 1.2, -1.2] }
                    : { rotate: [4, -3, 2, -1, 0] }
                }
                transition={
                  hasSettled
                    ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 2.6, ease: "easeOut" }
                }
                className="flex flex-col items-center origin-top"
              >
                {/* Gold Bead */}
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-gold-600 via-gold-300 to-gold-100 border border-gold-200 shadow-sm" />
                {/* Cord Segment */}
                <div className="w-0.5 h-3 bg-gradient-to-b from-gold-400 to-gold-600" />
                {/* Silk Fringe Tassel */}
                <div className="w-2.5 h-5 bg-gradient-to-b from-gold-400 via-gold-500 to-gold-700 rounded-b-full shadow-md border-t border-gold-200/50" />
              </motion.div>

              {/* Center Main Tassel (Longer, Richer) */}
              <motion.div
                animate={
                  hasSettled
                    ? { rotate: [1.5, -1.5, 1.5] }
                    : { rotate: [-5, 4, -2, 1, 0] }
                }
                transition={
                  hasSettled
                    ? { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                    : { duration: 2.8, ease: "easeOut", delay: 0.1 }
                }
                className="flex flex-col items-center origin-top"
              >
                {/* Upper Brass Bead */}
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-gold-600 via-gold-300 to-gold-100 border border-gold-200 shadow-md" />
                {/* Cord Segment */}
                <div className="w-1 h-4 bg-gradient-to-b from-gold-400 to-gold-600" />
                {/* Silk Fringe Tassel */}
                <div className="w-3.5 h-7 bg-gradient-to-b from-gold-300 via-gold-500 to-gold-800 rounded-b-full shadow-lg border-t border-gold-100" />
              </motion.div>

              {/* Right Tassel */}
              <motion.div
                animate={
                  hasSettled
                    ? { rotate: [-1.2, 1.2, -1.2] }
                    : { rotate: [4, -3, 2, -1, 0] }
                }
                transition={
                  hasSettled
                    ? { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
                    : { duration: 2.6, ease: "easeOut" }
                }
                className="flex flex-col items-center origin-top"
              >
                {/* Gold Bead */}
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-gold-600 via-gold-300 to-gold-100 border border-gold-200 shadow-sm" />
                {/* Cord Segment */}
                <div className="w-0.5 h-3 bg-gradient-to-b from-gold-400 to-gold-600" />
                {/* Silk Fringe Tassel */}
                <div className="w-2.5 h-5 bg-gradient-to-b from-gold-400 via-gold-500 to-gold-700 rounded-b-full shadow-md border-t border-gold-200/50" />
              </motion.div>

            </div>

            {/* ─── Polished Discrete Skip Badge ─── */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="mt-3 text-[10px] text-stone-300/80 tracking-widest border border-gold-500/30 rounded-full px-3.5 py-0.5 bg-black/50 backdrop-blur-md shadow-sm"
            >
              انقر في أي مكان للتخطي ✕
            </motion.div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinemaIntro;
