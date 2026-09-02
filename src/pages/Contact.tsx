import React, { useState } from 'react';
import { Mail, Phone, Globe, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem } from '../components/Animations';
import { sendContactEmail } from '../data';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setFeedbackMessage('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setStatus('submitting');
    
    const result = await sendContactEmail({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    });

    if (result.success) {
      setStatus('success');
      setFeedbackMessage(result.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      setStatus('error');
      setFeedbackMessage(result.message);
    }
  };

  const contactInfo = [
    {
      id: 1,
      title: 'طبيعة التعليم والحلقات',
      value: 'تعليم قرآني تفاعلي 100% عن بُعد عبر الإنترنت (متاح لجميع الطلاب والطالبات حول العالم)',
      icon: Globe
    },
    {
      id: 2,
      title: 'أرقام التواصل والواتساب',
      value: '+216 58 445 289 | +20 10 62666368',
      icon: Phone,
      dir: 'ltr'
    },
    {
      id: 3,
      title: 'البريد الإلكتروني الرسمي',
      value: 'maqraa.belquorannehya@gmail.com',
      icon: Mail,
      dir: 'ltr'
    },
    {
      id: 4,
      title: 'أوقات العمل واستقبال الاستفسارات',
      value: 'أيام الأسبوع ما عدا الجمعة (من صلاة العصر حتى صلاة العشاء)',
      icon: Clock
    }
  ];

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
      
      {/* Header */}
      <FadeInUp className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold text-xs sm:text-sm mb-4">
          <Send className="w-4 h-4" />
          <span>تواصل مباشر وتسجيل فوري</span>
        </div>
        <h1 className="font-amiri text-4xl sm:text-5xl lg:text-6xl font-bold text-emerald-950 dark:text-gold-100 mb-4">
          تواصل معنا والتسجيل
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 mx-auto rounded-full mb-6" />
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-light leading-relaxed">
          يسعدنا الرد على جميع استفساراتكم المتعلقة بالبرامج والحلقات وطرق الانضمام لمجموعات المقرأة.
        </p>
      </FadeInUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Info Column (Col 1) */}
        <StaggerContainer className="flex flex-col gap-6 lg:col-span-1">
          {contactInfo.map((info) => {
            const Icon = info.icon;
            return (
              <StaggerItem 
                key={info.id}
                className="bg-white dark:bg-emerald-900/25 p-6 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-md flex gap-4 group hover:border-gold-500/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 dark:from-emerald-800/60 dark:to-emerald-900/80 text-emerald-800 dark:text-gold-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 shadow-inner transition-transform duration-200">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                    {info.title}
                  </h3>
                  <span 
                    className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed text-right"
                    style={{ direction: info.dir ? 'ltr' : undefined }}
                  >
                    {info.value}
                  </span>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Form Column (Col 2) */}
        <FadeInUp delay={0.2} className="lg:col-span-2">
          <div className="bg-white dark:bg-emerald-900/25 p-7 sm:p-10 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
            
            <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200 mb-6 border-s-4 border-gold-500 ps-3">
              نموذج الاستفسار والتسجيل المبدئي
            </h2>

            {status === 'success' && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-500/40 text-emerald-800 dark:text-gold-300 flex items-center gap-3 text-sm shadow-inner">
                <CheckCircle2 className="w-6 h-6 text-gold-500 flex-shrink-0" />
                <span>{feedbackMessage || 'تم إرسال رسالتكم بنجاح إلى إدارة المقرأة (maqraa.belquorannehya@gmail.com)! سنتواصل معكم في أقرب وقت.'}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-500/30 text-red-800 dark:text-red-300 flex items-center gap-3 text-sm shadow-inner">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span>{feedbackMessage || 'يرجى ملء جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، والرسالة) بشكل صحيح.'}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Grid 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-2xl border border-stone-250 dark:border-emerald-800/30 bg-stone-50/80 dark:bg-emerald-950/40 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                    placeholder="مثال: أحمد عبد الله"
                    disabled={status === 'submitting'}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-2xl border border-stone-250 dark:border-emerald-800/30 bg-stone-50/80 dark:bg-emerald-950/40 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                    placeholder="example@mail.com"
                    style={{ direction: 'ltr', textAlign: 'right' }}
                    disabled={status === 'submitting'}
                  />
                </div>

              </div>

              {/* Subject */}
              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  الموضوع / اسم البرنامج
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl border border-stone-250 dark:border-emerald-800/30 bg-stone-50/80 dark:bg-emerald-950/40 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                  placeholder="مثال: طلب التسجيل في برنامج الحفظ التأسيسي"
                  disabled={status === 'submitting'}
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  تفاصيل طلبك أو استفسارك <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="px-4 py-3 rounded-2xl border border-stone-250 dark:border-emerald-800/30 bg-stone-50/80 dark:bg-emerald-950/40 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none transition-all"
                  placeholder="اكتب هنا تفاصيل طلبك، الحفظ السابق لديك، والقسم المناسب لك (رجال / نساء)..."
                  disabled={status === 'submitting'}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 px-6 rounded-2xl font-bold text-white dark:text-emerald-950 bg-gradient-to-l from-emerald-800 to-emerald-600 dark:from-gold-500 dark:to-gold-400 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white dark:border-emerald-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري إرسال طلبك...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 transform rotate-180" />
                    <span>إرسال الرسالة الآن</span>
                  </>
                )}
              </button>

            </form>

          </div>
        </FadeInUp>

      </div>

    </div>
  );
};
export default Contact;
