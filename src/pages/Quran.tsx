import React, { useState, useEffect } from 'react';
import { getTajweedRules, getStudiedSurahs } from '../data';
import type { TajweedRule, StudiedSurah } from '../data';
import { BookOpen, BookMarked, Play, Pause, Volume2, Sparkles, ChevronDown, ChevronUp, Radio, Disc } from 'lucide-react';
import { FadeInUp } from '../components/Animations';

export const Quran: React.FC = () => {
  const [rules, setRules] = useState<TajweedRule[]>([]);
  const [surahs, setSurahs] = useState<StudiedSurah[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState<string | null>('noon-sakinah');

  // Simulated audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSurah, setActiveSurah] = useState('سورة الفاتحة');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const rulesData = await getTajweedRules();
      const surahsData = await getStudiedSurahs();
      setRules(rulesData);
      setSurahs(surahsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleRule = (id: string) => {
    if (expandedRule === id) {
      setExpandedRule(null);
    } else {
      setExpandedRule(id);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
      
      {/* Header */}
      <FadeInUp className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold text-xs sm:text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          <span>علوم القرآن وأحكام الترتيل</span>
        </div>
        <h1 className="font-amiri text-4xl sm:text-5xl lg:text-6xl font-bold text-emerald-950 dark:text-gold-100 mb-4">
          الفضاء القرآني التعليمي
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 mx-auto rounded-full mb-6" />
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-light leading-relaxed">
          موارد تعليمية تفاعلية لشرح أصول التجويد، وتسهيل حفظ السور المقررة، والاستماع إلى التلاوات النموذجية المتقنة.
        </p>
      </FadeInUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Rules & Surahs columns (Col 2) */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* 1. Tajweed Rules (Accordion) */}
          <div className="bg-white dark:bg-emerald-900/25 p-6 sm:p-8 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 dark:from-emerald-800/60 dark:to-emerald-900/80 text-emerald-800 dark:text-gold-400 flex items-center justify-center shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200">
                  قواعد التجويد المبسطة
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">انقر على الحكم لعرض الشرح والأمثلة التطبيقية</p>
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-14 rounded-2xl bg-stone-200 dark:bg-emerald-900/20 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3.5">
                {rules.map((rule) => {
                  const isExpanded = expandedRule === rule.id;
                  return (
                    <div 
                      key={rule.id}
                      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                        isExpanded 
                          ? 'border-gold-500/40 shadow-md bg-stone-50/50 dark:bg-emerald-950/40' 
                          : 'border-stone-200/60 dark:border-emerald-800/20 hover:border-gold-500/20'
                      }`}
                    >
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-right bg-white dark:bg-emerald-900/20 hover:bg-stone-50 dark:hover:bg-emerald-900/40 transition-colors focus:outline-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${isExpanded ? 'bg-gold-500 animate-pulse' : 'bg-stone-300 dark:bg-emerald-800'}`} />
                          <span className="font-amiri font-bold text-emerald-950 dark:text-stone-100 text-base sm:text-lg">
                            {rule.title}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gold-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-stone-400" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-5 bg-white/80 dark:bg-emerald-950/60 border-t border-stone-150 dark:border-emerald-800/20 text-stone-700 dark:text-stone-300 text-sm leading-relaxed font-light space-y-4">
                          <p>{rule.explanation}</p>
                          <div className="p-4 bg-emerald-50/80 dark:bg-emerald-900/30 rounded-2xl border-s-4 border-gold-500 shadow-inner">
                            <span className="text-emerald-900 dark:text-gold-300 font-bold block text-xs mb-1.5">تطبيق ومثال قرآني :</span>
                            <span className="font-amiri text-lg text-emerald-950 dark:text-gold-100 font-bold">{rule.example}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Studied Surahs */}
          <div className="bg-white dark:bg-emerald-900/25 p-6 sm:p-8 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 dark:from-emerald-800/60 dark:to-emerald-900/80 text-emerald-800 dark:text-gold-400 flex items-center justify-center shadow-inner">
                <BookMarked className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200">
                  السور المقررة والمستهدفة بالحفظ
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">نماذج السور المعتمدة في المناهج التحفيظية</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-28 rounded-2xl bg-stone-200 dark:bg-emerald-900/20 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {surahs.map((surah) => (
                  <div 
                    key={surah.id}
                    className="p-5 rounded-2xl bg-stone-50/80 dark:bg-emerald-900/20 border border-stone-200/60 dark:border-emerald-800/20 flex flex-col gap-3 text-right group hover:border-gold-500/40 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-amiri text-xl font-bold text-emerald-950 dark:text-gold-200">
                        {surah.name}
                      </h3>
                      <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold shadow-sm ${
                        surah.type === 'مكي' 
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300' 
                          : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {surah.type} (آياتها: {surah.versesCount})
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                      {surah.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Audio space (Col 1) */}
        <div className="flex flex-col gap-6">
          
          {/* Audio Player Widget */}
          <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white p-7 rounded-3xl border border-gold-500/30 shadow-2xl relative overflow-hidden flex flex-col gap-6">
            <div className="absolute inset-0 islamic-pattern opacity-8" />
            <div className="absolute -top-16 -end-16 w-36 h-36 bg-gold-500/10 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-2 relative z-10">
              <Radio className="w-5 h-5 text-gold-400 animate-pulse" />
              <h3 className="font-amiri text-xl font-bold text-gold-300">المكتبة الصوتية النموذجية</h3>
            </div>

            {/* Simulated Track Disc with Gold Ring */}
            <div className="flex flex-col items-center text-center gap-4 py-4 relative z-10">
              <div 
                className="w-24 h-24 rounded-full bg-emerald-900/80 border-2 border-gold-400/80 flex items-center justify-center shadow-xl gold-glow transition-transform"
                style={{ 
                  animation: isPlaying ? 'soft-float 3s ease-in-out infinite' : 'none'
                }}
              >
                <Disc className={`w-12 h-12 text-gold-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
              </div>
              <div className="flex flex-col">
                <span className="font-amiri text-2xl font-bold text-gold-200">{activeSurah}</span>
                <span className="text-xs text-stone-300 mt-1">تلاوة تعليمية متقنة برواية حفص عن عاصم</span>
              </div>
            </div>

            {/* Playlist Selection */}
            <div className="space-y-2 relative z-10">
              <span className="text-xs text-gold-300 block mb-2 font-medium">اختر سورة للاستماع :</span>
              {['سورة الفاتحة', 'سورة الكهف', 'سورة الملك', 'سورة يس'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveSurah(item);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeSurah === item
                      ? 'bg-gradient-to-l from-emerald-800 to-emerald-700 text-gold-300 border border-gold-500/40 shadow-md'
                      : 'bg-emerald-950/60 text-stone-300 hover:bg-emerald-800/40 border border-emerald-800/20'
                  }`}
                >
                  <span>{item}</span>
                  <Volume2 className={`w-4 h-4 ${activeSurah === item ? 'text-gold-400' : 'text-stone-500'}`} />
                </button>
              ))}
            </div>

            {/* Audio Controls */}
            <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-emerald-800/60 relative z-10">
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-l from-gold-500 to-gold-400 text-emerald-950 font-bold shadow-lg hover:from-gold-400 hover:to-gold-300 hover:scale-105 active:scale-95 transition-all"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ms-0.5" />}
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-800/40 mt-2">
                <div className={`bg-gradient-to-r from-gold-600 to-gold-400 h-full rounded-full ${isPlaying ? 'w-1/3 animate-pulse' : 'w-[5%]'}`} />
              </div>
              
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>01:25</span>
                <span>04:30</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
export default Quran;
