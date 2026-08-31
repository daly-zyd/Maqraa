import React, { useState, useEffect } from 'react';
import { getArticles, getReflections } from '../data';
import type { Article, Reflection } from '../data';
import { Sparkles, Calendar, User, Quote, X } from 'lucide-react';
import { FadeInUp } from '../components/Animations';

export const Tazkiya: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const artData = await getArticles();
      const refData = await getReflections();
      setArticles(artData);
      setReflections(refData);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
      
      {/* Header */}
      <FadeInUp className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold text-xs sm:text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          <span>مدرسة القلوب والتربية الإيمانية</span>
        </div>
        <h1 className="font-amiri text-4xl sm:text-5xl lg:text-6xl font-bold text-emerald-950 dark:text-gold-100 mb-4">
          تزكية وإيمانيات
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 mx-auto rounded-full mb-6" />
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-light leading-relaxed">
          مقالات تربوية وخواطر إيمانية مستوحاة من هدي القرآن الكريم وسنة رسوله ﷺ تعينك على صلاح القلب وزكاة النفس.
        </p>
      </FadeInUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Articles Column (Col 2) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200 border-s-4 border-gold-500 ps-3 mb-2">
            مقالات ومحاضرات تربوية
          </h2>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map((n) => (
                <div key={n} className="h-48 rounded-3xl bg-stone-200 dark:bg-emerald-900/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <div 
                  key={article.id}
                  className="bg-white dark:bg-emerald-900/25 rounded-3xl overflow-hidden border border-stone-200/70 dark:border-gold-500/15 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row group"
                >
                  
                  {/* Article Image */}
                  <div className="h-48 sm:h-auto sm:w-56 bg-emerald-950 flex-shrink-0 overflow-hidden relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-emerald-950/80 via-transparent to-transparent" />
                  </div>
                  
                  {/* Article content info */}
                  <div className="p-6 sm:p-7 flex flex-col justify-between gap-4 flex-grow">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-3 text-[11px] text-stone-400">
                        <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-800/60 text-emerald-900 dark:text-gold-300">{article.category}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gold-500" />
                          <span>{article.date}</span>
                        </div>
                      </div>
                      
                      <h3 
                        onClick={() => setSelectedArticle(article)}
                        className="font-amiri text-xl sm:text-2xl font-bold text-emerald-950 dark:text-gold-100 leading-snug cursor-pointer hover:text-gold-600 dark:hover:text-gold-300 transition-colors"
                      >
                        {article.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light line-clamp-2 leading-relaxed">
                        {article.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 dark:border-emerald-800/30 pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <User className="w-3.5 h-3.5 text-gold-500" />
                        <span>بقلم: <strong>{article.author}</strong></span>
                      </div>
                      
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="text-xs font-bold text-emerald-800 dark:text-gold-400 hover:text-emerald-600 dark:hover:text-gold-300 flex items-center gap-1"
                      >
                        اقرأ المقال كاملاً ←
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Reflections Column (Col 1) */}
        <div className="flex flex-col gap-6">
          
          <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200 border-s-4 border-gold-500 ps-3 mb-2">
            خواطر اليوم وسلفنا الصالح
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 rounded-3xl bg-stone-200 dark:bg-emerald-900/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {reflections.map((ref) => (
                <div 
                  key={ref.id}
                  className="bg-white dark:bg-emerald-900/25 p-6 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-md relative overflow-hidden group hover:border-gold-500/40 hover:shadow-lg transition-all"
                >
                  <Quote className="w-10 h-10 text-gold-500/15 absolute -top-1 -start-1 pointer-events-none" />
                  
                  <div className="flex flex-col gap-4 relative z-10">
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 leading-relaxed font-light italic">
                      "{ref.content}"
                    </p>
                    <div className="flex justify-end items-center gap-1.5 text-[11px] text-gold-600 dark:text-gold-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                      <span>المصدر: {ref.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Dynamic Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-stone-200/60 dark:border-emerald-800/30 shadow-2xl relative">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 end-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-900 text-stone-600 dark:text-stone-350 transition-colors z-20 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Modal Image */}
            <div className="h-48 sm:h-64 bg-emerald-950 relative">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 start-6 text-white">
                <span className="text-[10px] font-bold text-gold-400 block mb-1">{selectedArticle.category}</span>
                <h3 className="font-amiri text-2xl font-bold">{selectedArticle.title}</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Metadata */}
              <div className="flex items-center gap-6 text-xs text-stone-400 border-b border-stone-100 dark:border-emerald-800/20 pb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-gold-500" />
                  <span>الكاتب: <strong>{selectedArticle.author}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ النشر: {selectedArticle.date}</span>
                </div>
              </div>

              {/* Text Body */}
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-light text-sm sm:text-base whitespace-pre-line">
                {selectedArticle.content}
              </p>

            </div>

            {/* Bottom bar */}
            <div className="p-4 bg-stone-50 dark:bg-emerald-900/10 border-t border-stone-100 dark:border-emerald-800/15 text-center rounded-b-3xl">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2 rounded-full font-bold text-xs text-emerald-950 bg-gold-400 dark:bg-gold-500 hover:bg-gold-450 hover:shadow-md transition-all"
              >
                إغلاق المقال
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default Tazkiya;
