import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Globe, Loader2, Mail, Phone, Send } from 'lucide-react';
import { sendContactEmail } from '../data';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const CONTACT_INFO = [
  { title: 'طبيعة التعليم والحلقات', value: 'تعليم قرآني تفاعلي عن بُعد عبر الإنترنت، متاح للطلاب والطالبات حول العالم', icon: Globe },
  { title: 'أرقام التواصل والواتساب', value: '+216 58 445 289 · +20 10 62666368', icon: Phone, isolate: true },
  { title: 'البريد الإلكتروني', value: 'maqraa.belquorannehya@gmail.com', icon: Mail, isolate: true, href: 'mailto:maqraa.belquorannehya@gmail.com' },
  { title: 'أوقات استقبال الاستفسارات', value: 'أيام الأسبوع ما عدا الجمعة، من صلاة العصر حتى صلاة العشاء', icon: Clock }
];

const field =
  'w-full rounded-2xl border border-stone-300 dark:border-gold-500/20 bg-white/80 dark:bg-emerald-950/60 px-4 py-3.5 text-base text-stone-800 dark:text-mist-100 placeholder:text-stone-400 dark:placeholder:text-mist-400/70 focus:border-gold-500 disabled:opacity-60';
const label = 'block mb-2 text-sm font-semibold text-stone-700 dark:text-mist-200';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setFeedback('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    setStatus('submitting');
    const result = await sendContactEmail(formData);
    setStatus(result.success ? 'success' : 'error');
    setFeedback(result.message);
    if (result.success) setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const busy = status === 'submitting';

  return (
    <div>
      <PageHeader
        eyebrow="تواصل مباشر وتسجيل مبدئي"
        title="تواصل معنا"
        lead="يسعدنا الرد على جميع استفساراتكم المتعلقة بالبرامج والحلقات وطرق الانضمام لمجموعات المقرأة."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-3 gap-8 items-start">
        <ul className="flex flex-col gap-5">
          {CONTACT_INFO.map(({ title, value, icon: Icon, isolate, href }, i) => (
            <Reveal key={title} as="li" delay={i * 0.08} className="lift flex gap-4 rounded-3xl border border-stone-300 dark:border-gold-500/15 bg-stone-50 dark:bg-emerald-900/40 p-6">
              <span className="grid place-items-center w-12 h-12 shrink-0 rounded-2xl bg-emerald-900 text-gold-300">
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-emerald-900 dark:text-gold-200">{title}</h2>
                <p className="mt-1 text-[15px] leading-7 text-stone-600 dark:text-mist-300 break-words">
                  {href ? (
                    <a href={href} className="hover:text-gold-700 dark:hover:text-gold-200"><bdi>{value}</bdi></a>
                  ) : isolate ? (
                    <bdi className="tabular-nums">{value}</bdi>
                  ) : (
                    value
                  )}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="lg:col-span-2 rounded-[32px] border border-stone-300 dark:border-gold-500/15 bg-stone-50 dark:bg-emerald-900/40 p-7 sm:p-10">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-emerald-900 dark:text-gold-300 mb-7">نموذج الاستفسار والتسجيل المبدئي</h2>

          {(status === 'success' || status === 'error') && (
            <p
              role={status === 'error' ? 'alert' : 'status'}
              className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-[15px] ${
                status === 'success'
                  ? 'border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/60 dark:text-gold-200'
                  : 'border-oxblood-400/40 bg-oxblood-50 text-oxblood-700 dark:bg-oxblood-900/50 dark:text-oxblood-100'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-6 h-6 shrink-0 text-gold-600" aria-hidden />
              ) : (
                <AlertCircle className="w-6 h-6 shrink-0" aria-hidden />
              )}
              {feedback}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={label}>
                  الاسم الكامل <span className="text-oxblood-500" aria-hidden>*</span>
                </label>
                <input id="name" name="name" type="text" autoComplete="name" required value={formData.name} onChange={handleChange} className={field} placeholder="مثال: أحمد عبد الله" disabled={busy} />
              </div>
              <div>
                <label htmlFor="email" className={label}>
                  البريد الإلكتروني <span className="text-oxblood-500" aria-hidden>*</span>
                </label>
                <input id="email" name="email" type="email" dir="auto" autoComplete="email" required value={formData.email} onChange={handleChange} className={field} placeholder="example@mail.com" disabled={busy} />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className={label}>الموضوع / اسم البرنامج</label>
              <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} className={field} placeholder="مثال: طلب التسجيل في برنامج الحفظ التأسيسي" disabled={busy} />
            </div>
            <div>
              <label htmlFor="message" className={label}>
                تفاصيل طلبك أو استفسارك <span className="text-oxblood-500" aria-hidden>*</span>
              </label>
              <textarea id="message" name="message" rows={5} required value={formData.message} onChange={handleChange} className={`${field} resize-none`} placeholder="اكتب تفاصيل طلبك، والحفظ السابق لديك، والقسم المناسب لك (رجال / نساء)…" disabled={busy} />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="btn-glow inline-flex items-center justify-center gap-2.5 h-14 rounded-full bg-gold-500 text-emerald-950 font-bold disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : <Send className="w-5 h-5 rtl:-scale-x-100" aria-hidden />}
              {busy ? 'جاري إرسال طلبك…' : 'إرسال الرسالة'}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
};

export default Contact;
