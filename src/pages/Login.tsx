import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { apiErrorMessage } from '../lib/apiClient';
import { useAuth } from '../features/auth/AuthContext';
import { mockActive } from '../mocks/enable';
import { DEMO_OTP, DEMO_PASSWORD } from '../mocks/constants';
import { OrnamentDivider } from '../components/OrnamentDivider';
import logoImg from '../assets/logo-brand.webp';

type Step = 'password' | 'otp-send' | 'otp-verify' | 'forgot' | 'reset';

const input =
  'w-full rounded-xl border border-gold-600/40 bg-white/80 dark:bg-emerald-950/60 px-4 py-3 text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-gold-500';
const primary =
  'w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 font-bold text-emerald-950 bg-gradient-to-b from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 disabled:opacity-60 transition-colors';
const link = 'text-sm font-semibold text-emerald-800 dark:text-gold-300 underline-offset-4 hover:underline';

export const Login: React.FC = () => {
  const { me, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [step, setStep] = useState<Step>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (me) return <Navigate to={from} replace />;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const go = (next: Step, message = '') => {
    setStep(next);
    setError('');
    setNotice(message);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = identifier.trim();
    if (step === 'password') {
      return run(async () => {
        await signIn(() => authService.login(id, password));
        navigate(from, { replace: true });
      });
    }
    if (step === 'otp-send' || step === 'forgot') {
      return run(async () => {
        await (step === 'otp-send' ? authService.requestOtp(id) : authService.forgotPassword(id));
        go(step === 'otp-send' ? 'otp-verify' : 'reset', 'إن كان للحساب رقم واتساب مسجّل فسيصلك رمز التحقق خلال لحظات.');
      });
    }
    if (step === 'otp-verify') {
      return run(async () => {
        await signIn(() => authService.verifyOtp(id, code.trim()));
        navigate(from, { replace: true });
      });
    }
    return run(async () => {
      await authService.resetPassword(id, code.trim(), newPassword);
      setPassword('');
      setCode('');
      setNewPassword('');
      go('password', 'تم تغيير كلمة المرور. سجّل الدخول بها الآن.');
    });
  };

  const titles: Record<Step, string> = {
    password: 'تسجيل الدخول',
    'otp-send': 'الدخول برمز واتساب',
    'otp-verify': 'أدخل الرمز',
    forgot: 'استعادة كلمة المرور',
    reset: 'كلمة مرور جديدة'
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="mushaf-frame rounded-[28px] bg-paper dark:bg-emerald-950 px-6 sm:px-9 py-9 shadow-[0_24px_48px_-24px_rgba(4,24,18,0.5)]">
        <img src={logoImg} alt="" width={84} height={84} className="w-[84px] h-[84px] object-contain mx-auto" />
        <h1 className="mt-3 text-center font-amiri text-3xl font-bold text-emerald-900 dark:text-gold-200">{titles[step]}</h1>
        <OrnamentDivider className="mt-2 mb-6" />

        <form onSubmit={submit} className="space-y-4" noValidate>
          {notice && <p role="status" className="rounded-xl bg-emerald-100/70 dark:bg-emerald-900/50 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">{notice}</p>}
          {error && <p role="alert" className="rounded-xl bg-oxblood-50 dark:bg-oxblood-900/40 border border-oxblood-400/40 px-4 py-3 text-sm text-oxblood-600 dark:text-oxblood-200">{error}</p>}

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-stone-700 dark:text-stone-200">اسم المستخدم أو الهاتف أو البريد</span>
            <input className={input} value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" inputMode="text" dir="ltr" required />
          </label>

          {step === 'password' && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700 dark:text-stone-200">كلمة المرور</span>
              <span className="relative block">
                <input className={`${input} pe-12`} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" dir="ltr" required />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} className="absolute inset-y-0 end-3 text-stone-500">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </span>
            </label>
          )}

          {(step === 'otp-verify' || step === 'reset') && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700 dark:text-stone-200">الرمز المرسل إلى واتساب</span>
              <input className={`${input} tracking-[0.4em] text-center`} value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={8} dir="ltr" required />
            </label>
          )}

          {step === 'reset' && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700 dark:text-stone-200">كلمة المرور الجديدة (10 أحرف على الأقل)</span>
              <input className={input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" dir="ltr" minLength={10} required />
            </label>
          )}

          <button type="submit" disabled={busy} className={primary}>
            {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : step === 'password' ? <KeyRound className="w-5 h-5" aria-hidden /> : <MessageCircle className="w-5 h-5" aria-hidden />}
            {step === 'password' ? 'دخول' : step === 'otp-send' || step === 'forgot' ? 'أرسل الرمز' : step === 'otp-verify' ? 'تأكيد ودخول' : 'حفظ كلمة المرور'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2.5">
          {step === 'password' && (
            <>
              <button type="button" onClick={() => go('otp-send')} className={`${link} inline-flex items-center gap-1.5`}>
                <MessageCircle className="w-4 h-4" aria-hidden /> أرسل لي رمزا على واتساب بدل كلمة المرور
              </button>
              <button type="button" onClick={() => go('forgot')} className={link}>نسيت كلمة المرور؟</button>
            </>
          )}
          {step !== 'password' && (
            <button type="button" onClick={() => go('password')} className={link}>العودة إلى كلمة المرور</button>
          )}
          <Link to="/" className="text-sm text-stone-500 dark:text-stone-400 hover:underline">العودة إلى الموقع</Link>
        </div>

        {mockActive && (
          <p className="mt-6 rounded-xl border border-dashed border-gold-600/50 px-4 py-3 text-xs leading-6 text-stone-600 dark:text-stone-300" dir="rtl">
            وضع تجريبي (بدون خادم): <strong dir="ltr">admin.demo</strong> أو <strong dir="ltr">sheikh.demo</strong>، كلمة المرور{' '}
            <strong dir="ltr">{DEMO_PASSWORD}</strong>. رمز واتساب للتجربة: <strong dir="ltr">{DEMO_OTP}</strong> (للهاتف <strong dir="ltr">98123456</strong>).
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
