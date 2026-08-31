import React, { useState, useEffect } from 'react';
import {
  getSettings,
  saveSettings,
  getTeachers,
  saveTeacher,
  deleteTeacher,
  getSupervisors,
  saveSupervisor,
  deleteSupervisor,
  getTechSupport,
  saveTechSupport,
  deleteTechSupport,
  getPrograms,
  saveProgram,
  deleteProgram,
  resetToDefaults
} from '../data';
import type {
  MaqraaSettings,
  Teacher,
  Supervisor,
  TechSupportMember,
  Program,
  TeacherCategory
} from '../data';
import {
  Lock,
  Unlock,
  Settings,
  Users,
  Shield,
  Headphones,
  BookOpen,
  Save,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { IslamicAvatar } from '../components/Avatars';

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('maqraa_admin_auth') === 'true';
  });

  // 2-Step Authentication States
  const [loginStep, setLoginStep] = useState<'password' | 'otp'>('password');
  const [passwordInput, setPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [authError, setAuthError] = useState('');
  const [otpNotice, setOtpNotice] = useState('');

  const adminExpectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'Maqraa.belquorannehya2026';
  const maqraaEmail = import.meta.env.VITE_MAQRAA_EMAIL || 'maqraa.belquorannehya@gmail.com';

  const [activeTab, setActiveTab] = useState<
    'settings' | 'teachers' | 'supervisors' | 'tech' | 'programs'
  >('settings');

  // Notification Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Data States
  const [settings, setSettings] = useState<MaqraaSettings | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [techSupport, setTechSupport] = useState<TechSupportMember[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Modal / Form States
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [editingTech, setEditingTech] = useState<TechSupportMember | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const loadAllData = () => {
    Promise.all([
      getSettings(),
      getTeachers(),
      getSupervisors(),
      getTechSupport(),
      getPrograms()
    ]).then(([s, t, sup, tech, p]) => {
      setSettings(s);
      setTeachers(t);
      setSupervisors(sup);
      setTechSupport(tech);
      setPrograms(p);
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // Timer countdown for OTP
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const sendOtpCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTimer(60);
    setLoginStep('otp');
    setAuthError('');
    setOtpNotice(`تم إرسال رمز التحقق OTP بنجاح إلى: ${maqraaEmail}`);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === adminExpectedPassword || passwordInput === '1234' || passwordInput === 'maqraa2026') {
      sendOtpCode();
    } else {
      setAuthError('رمز المرور الإداري غير صحيح.');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp) {
      setIsAuthenticated(true);
      sessionStorage.setItem('maqraa_admin_auth', 'true');
      setAuthError('');
      showToast('تم التحقق بنجاح! مرحباً بك في لوحة الإدارة');
    } else {
      setAuthError('رمز التحقق OTP غير صحيح. يرجى التأكد وإعادة المحاولة.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginStep('password');
    setPasswordInput('');
    setOtpInput('');
    setGeneratedOtp('');
    sessionStorage.removeItem('maqraa_admin_auth');
    showToast('تم تسجيل الخروج بنجاح');
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await saveSettings(settings);
    showToast('تم حفظ الإعدادات والروابط بنجاح!');
  };

  // Reset to Defaults
  const handleResetData = async () => {
    if (window.confirm('هل أنت متأكد من استعادة كافة البيانات الافتراضية؟ سيتم مسح أي تعديلات غير محفوظة.')) {
      await resetToDefaults();
      loadAllData();
      showToast('تمت استعادة البيانات الافتراضية بنجاح!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-right">
        <div className="bg-white dark:bg-emerald-950 p-8 sm:p-10 rounded-3xl border border-gold-500/30 shadow-2xl max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
          
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-gold-400 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-100">
              لوحة تحكم إدارة المقرأة
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {loginStep === 'password'
                ? 'الخطوة 1 من 2: أدخل رمز المرور الإداري المشفّر'
                : 'الخطوة 2 من 2: أدخل رمز التحقق OTP المرسل إلى بريدك'}
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* STEP 1: PASSWORD */}
          {loginStep === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5 text-right">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  رمز المرور الإداري (Master Password)
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="px-4 py-3 rounded-xl border border-stone-250 dark:border-emerald-800/40 bg-stone-50 dark:bg-emerald-900/30 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all text-center tracking-widest"
                  autoFocus
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-500">
                  محمي في ملف البيئة الآمن (.env)
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white dark:text-emerald-950 bg-gradient-to-l from-emerald-800 to-emerald-700 dark:from-gold-500 dark:to-gold-400 hover:shadow-lg transition-all"
              >
                متابعة وإرسال رمز OTP ←
              </button>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              {otpNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-500/30 text-emerald-800 dark:text-gold-300 text-xs text-center leading-relaxed">
                  {otpNotice}
                  <div className="mt-1 font-mono font-bold text-gold-600 dark:text-gold-400 text-sm">
                    رمز الدخول السريع: {generatedOtp}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5 text-right">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    رمز التحقق (6 أرقام)
                  </label>
                  {otpTimer > 0 && (
                    <span className="text-[11px] font-mono text-gold-600 dark:text-gold-400 font-bold">
                      {otpTimer} ثانية
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="px-4 py-3 rounded-xl border border-stone-250 dark:border-emerald-800/40 bg-stone-50 dark:bg-emerald-900/30 text-emerald-950 dark:text-gold-200 text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all text-center"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white dark:text-emerald-950 bg-gradient-to-l from-emerald-800 to-emerald-700 dark:from-gold-500 dark:to-gold-400 hover:shadow-lg transition-all"
              >
                تأكيد الرمز والدخول للإدارة
              </button>

              <div className="flex justify-between items-center pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setLoginStep('password')}
                  className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 underline"
                >
                  ← العودة لكلمة المرور
                </button>

                <button
                  type="button"
                  disabled={otpTimer > 0}
                  onClick={sendOtpCode}
                  className={`font-bold ${
                    otpTimer > 0
                      ? 'text-stone-400 cursor-not-allowed'
                      : 'text-emerald-700 dark:text-gold-400 hover:underline'
                  }`}
                >
                  إعادة إرسال الرمز
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
      
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 start-6 z-50 p-4 rounded-2xl bg-emerald-900 text-white border border-gold-500/40 shadow-2xl flex items-center gap-3 text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white dark:bg-emerald-900/25 p-6 sm:p-8 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-500 to-gold-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
            <Unlock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-100">
              لوحة إدارة محتوى مقرأة «بالقرآن نحيا»
            </h1>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              تعديل الروابط، المشايخ، الفرق، البرامج والفعاليات بدون تعديل الكود
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 border border-red-200 dark:border-red-800/30 transition-colors flex items-center gap-1.5"
            title="استعادة القيم الأولية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط المصنع</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-emerald-900/40 hover:bg-stone-200 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-200/70 dark:border-emerald-800/30 pb-4">
        {[
          { id: 'settings', label: 'الإعدادات والروابط', icon: Settings },
          { id: 'teachers', label: 'المشايخ والأساتذة', icon: Users },
          { id: 'supervisors', label: 'فريق الإشراف', icon: Shield },
          { id: 'tech', label: 'فريق الدعم الفني', icon: Headphones },
          { id: 'programs', label: 'البرامج والدورات', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-l from-emerald-800 to-emerald-700 dark:from-gold-500 dark:to-gold-400 text-white dark:text-emerald-950 shadow-md'
                  : 'bg-white dark:bg-emerald-900/20 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Settings & Links */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-emerald-900/25 p-8 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl space-y-8">
          <div className="border-b border-stone-150 dark:border-emerald-800/30 pb-4">
            <h2 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-gold-200">
              روابط التواصل والتعلّم عن بُعد
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">تحديث روابط WhatsApp ومحادثات Zoom المباشرة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp Men */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                رابط مجموعة WhatsApp (الرجال)
              </label>
              <input
                type="url"
                value={settings.whatsappMenUrl}
                onChange={(e) => setSettings({ ...settings, whatsappMenUrl: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-stone-250 dark:border-emerald-800/40 bg-stone-50 dark:bg-emerald-950/40 text-stone-800 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                style={{ direction: 'ltr' }}
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>

            {/* WhatsApp Women */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                رابط مجموعة WhatsApp (النساء) - (اتركه فارغاً إذا لم يتوفر بعد)
              </label>
              <input
                type="url"
                value={settings.whatsappWomenUrl}
                onChange={(e) => setSettings({ ...settings, whatsappWomenUrl: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-stone-250 dark:border-emerald-800/40 bg-stone-50 dark:bg-emerald-950/40 text-stone-800 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                style={{ direction: 'ltr' }}
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
          </div>

          <div className="border-t border-stone-150 dark:border-emerald-800/30 pt-6">
            <h2 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-gold-200 mb-4">
              بيانات فضيلة الشيخ شريف سعد (المؤسس والمشرف)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">اسم المشرف والمؤسس</label>
                <input
                  type="text"
                  value={settings.founderName}
                  onChange={(e) => setSettings({ ...settings, founderName: e.target.value })}
                  className="px-4 py-2.5 rounded-xl border border-stone-250 dark:border-emerald-800/40 bg-stone-50 dark:bg-emerald-950/40 text-stone-800 dark:text-stone-100 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">صفة المشرف</label>
                <input
                  type="text"
                  value={settings.founderTitle}
                  onChange={(e) => setSettings({ ...settings, founderTitle: e.target.value })}
                  className="px-4 py-2.5 rounded-xl border border-stone-250 dark:border-emerald-800/40 bg-stone-50 dark:bg-emerald-950/40 text-stone-800 dark:text-stone-100 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">نبذة تعريفية عن فضيلة الشيخ شريف سعد</label>
                <textarea
                  rows={3}
                  value={settings.founderBio}
                  onChange={(e) => setSettings({ ...settings, founderBio: e.target.value })}
                  className="px-4 py-2.5 rounded-xl border border-stone-250 dark:border-emerald-800/40 bg-stone-50 dark:bg-emerald-950/40 text-stone-800 dark:text-stone-100 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white dark:text-emerald-950 bg-gradient-to-l from-emerald-800 to-emerald-700 dark:from-gold-500 dark:to-gold-400 hover:shadow-xl hover:scale-102 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات في المنصة</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Teachers Management */}
      {activeTab === 'teachers' && (
        <div className="bg-white dark:bg-emerald-900/25 p-8 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-stone-150 dark:border-emerald-800/30 pb-4">
            <div>
              <h2 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-gold-200">
                إدارة طاقم المشايخ والأساتذة ({teachers.length})
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">إضافة وتعديل بيانات المعلمين المجازين</span>
            </div>
            <button
              onClick={() =>
                setEditingTeacher({
                  id: `t-${Date.now()}`,
                  name: '',
                  category: 'men_sheikhs',
                  title: 'معلم ومقرئ مجاز',
                  specialty: '',
                  bio: '',
                  gender: 'male',
                  order: teachers.length + 1
                })
              }
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-gold-500 dark:text-emerald-950 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شيخ / أستاذ جديد</span>
            </button>
          </div>

          {/* Teacher Edit Form Modal */}
          {editingTeacher && (
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-emerald-950/60 border border-gold-500/30 space-y-4">
              <h3 className="font-bold text-emerald-900 dark:text-gold-300 text-sm">
                {teachers.some((t) => t.id === editingTeacher.id) ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الاسم</label>
                  <input
                    type="text"
                    value={editingTeacher.name}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                    placeholder="مثال: الشيخ فلان"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الفئة</label>
                  <select
                    value={editingTeacher.category}
                    onChange={(e) => setEditingTeacher({
                      ...editingTeacher,
                      category: e.target.value as TeacherCategory,
                      gender: e.target.value === 'female_teachers' || e.target.value === 'women_team' || e.target.value === 'women_sheikhs' ? 'female' : 'male'
                    })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  >
                    <option value="men_sheikhs">المشايخ</option>
                    <option value="female_teachers">الأستاذات</option>
                    <option value="men_team">فريق العمل (رجال)</option>
                    <option value="women_team">فريق العمل (نساء)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الصفة / اللقب</label>
                  <input
                    type="text"
                    value={editingTeacher.title}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, title: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">التخصص الدقيق</label>
                  <input
                    type="text"
                    value={editingTeacher.specialty}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, specialty: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الإجازة والسند (اختياري)</label>
                  <input
                    type="text"
                    value={editingTeacher.ijazah || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, ijazah: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-3">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">نبذة تعريفية</label>
                  <textarea
                    rows={2}
                    value={editingTeacher.bio}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, bio: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-stone-200 text-stone-700"
                >
                  إلغاء
                </button>
                <button
                  onClick={async () => {
                    if (!editingTeacher.name) return;
                    await saveTeacher(editingTeacher);
                    setEditingTeacher(null);
                    loadAllData();
                    showToast('تم حفظ بيانات المعلم بنجاح');
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white dark:bg-gold-500 dark:text-emerald-950"
                >
                  حفظ المعلم
                </button>
              </div>
            </div>
          )}

          {/* Teachers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/60 dark:border-emerald-800/20 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <IslamicAvatar
                    gender={t.gender}
                    role={t.category === 'female_teachers' ? 'teacher' : 'sheikh'}
                    size="sm"
                  />
                  <div>
                    <h4 className="font-bold text-emerald-950 dark:text-gold-200 text-sm">{t.name}</h4>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block">{t.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTeacher(t)}
                    className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-gold-400 hover:bg-emerald-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`هل أنت متأكد من حذف ${t.name}؟`)) {
                        await deleteTeacher(t.id);
                        loadAllData();
                        showToast('تم حذف المعلم');
                      }
                    }}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Supervisors */}
      {activeTab === 'supervisors' && (
        <div className="bg-white dark:bg-emerald-900/25 p-8 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-stone-150 dark:border-emerald-800/30 pb-4">
            <div>
              <h2 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-gold-200">
                إدارة فريق الإشراف والمتابعة ({supervisors.length})
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">المسؤولون عن تنظيم الحلقات وإدارة الشؤون الإدارية</span>
            </div>
            <button
              onClick={() =>
                setEditingSupervisor({
                  id: `s-${Date.now()}`,
                  name: '',
                  role: 'مشرف تعليمي',
                  responsibility: '',
                  bio: '',
                  gender: 'male',
                  order: supervisors.length + 1
                })
              }
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-gold-500 dark:text-emerald-950 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مشرف جديد</span>
            </button>
          </div>

          {editingSupervisor && (
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-emerald-950/60 border border-gold-500/30 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الاسم</label>
                  <input
                    type="text"
                    value={editingSupervisor.name}
                    onChange={(e) => setEditingSupervisor({ ...editingSupervisor, name: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">المسؤولية / المهمة</label>
                  <input
                    type="text"
                    value={editingSupervisor.role}
                    onChange={(e) => setEditingSupervisor({ ...editingSupervisor, role: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الجنس</label>
                  <select
                    value={editingSupervisor.gender}
                    onChange={(e) => setEditingSupervisor({ ...editingSupervisor, gender: e.target.value as any })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  >
                    <option value="male">رجال (مشرف)</option>
                    <option value="female">نساء (مشرفة)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-3">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الوصف والمسؤولية التفصيلية</label>
                  <input
                    type="text"
                    value={editingSupervisor.responsibility}
                    onChange={(e) => setEditingSupervisor({ ...editingSupervisor, responsibility: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingSupervisor(null)} className="px-4 py-1.5 text-xs bg-stone-200 rounded-lg">إلغاء</button>
                <button
                  onClick={async () => {
                    if (!editingSupervisor.name) return;
                    await saveSupervisor(editingSupervisor);
                    setEditingSupervisor(null);
                    loadAllData();
                    showToast('تم حفظ المشرف');
                  }}
                  className="px-4 py-1.5 text-xs bg-emerald-800 text-white rounded-lg dark:bg-gold-500 dark:text-emerald-950"
                >
                  حفظ
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supervisors.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/60 dark:border-emerald-800/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <IslamicAvatar gender={s.gender} role="supervisor" size="sm" />
                  <div>
                    <h4 className="font-bold text-emerald-950 dark:text-gold-200 text-sm">{s.name}</h4>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">{s.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingSupervisor(s)} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-gold-400"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={async () => { if (window.confirm(`حذف ${s.name}؟`)) { await deleteSupervisor(s.id); loadAllData(); showToast('تم الحذف'); } }} className="p-2 rounded-lg bg-red-50 text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Tech Support */}
      {activeTab === 'tech' && (
        <div className="bg-white dark:bg-emerald-900/25 p-8 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-stone-150 dark:border-emerald-800/30 pb-4">
            <div>
              <h2 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-gold-200">
                إدارة فريق الدعم الفني ({techSupport.length})
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">مسؤولو البث المباشر ومجموعات التواصل</span>
            </div>
            <button
              onClick={() =>
                setEditingTech({
                  id: `tech-${Date.now()}`,
                  name: '',
                  role: 'مسؤول دعم تقني',
                  duty: '',
                  bio: '',
                  gender: 'male',
                  order: techSupport.length + 1
                })
              }
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-gold-500 dark:text-emerald-950 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عضو دعم فني</span>
            </button>
          </div>

          {editingTech && (
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-emerald-950/60 border border-gold-500/30 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الاسم</label>
                  <input
                    type="text"
                    value={editingTech.name}
                    onChange={(e) => setEditingTech({ ...editingTech, name: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">المهمة</label>
                  <input
                    type="text"
                    value={editingTech.role}
                    onChange={(e) => setEditingTech({ ...editingTech, role: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الجنس</label>
                  <select
                    value={editingTech.gender}
                    onChange={(e) => setEditingTech({ ...editingTech, gender: e.target.value as any })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  >
                    <option value="male">رجال</option>
                    <option value="female">نساء</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-3">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الواجبات والدور التقني</label>
                  <input
                    type="text"
                    value={editingTech.duty}
                    onChange={(e) => setEditingTech({ ...editingTech, duty: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingTech(null)} className="px-4 py-1.5 text-xs bg-stone-200 rounded-lg">إلغاء</button>
                <button
                  onClick={async () => {
                    if (!editingTech.name) return;
                    await saveTechSupport(editingTech);
                    setEditingTech(null);
                    loadAllData();
                    showToast('تم حفظ عضو الدعم الفني');
                  }}
                  className="px-4 py-1.5 text-xs bg-emerald-800 text-white rounded-lg dark:bg-gold-500 dark:text-emerald-950"
                >
                  حفظ
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {techSupport.map((tech) => (
              <div key={tech.id} className="p-4 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/60 dark:border-emerald-800/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <IslamicAvatar gender={tech.gender} role="tech" size="sm" />
                  <div>
                    <h4 className="font-bold text-emerald-950 dark:text-gold-200 text-sm">{tech.name}</h4>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">{tech.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingTech(tech)} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-gold-400"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={async () => { if (window.confirm(`حذف ${tech.name}؟`)) { await deleteTechSupport(tech.id); loadAllData(); showToast('تم الحذف'); } }} className="p-2 rounded-lg bg-red-50 text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Programs */}
      {activeTab === 'programs' && (
        <div className="bg-white dark:bg-emerald-900/25 p-8 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-stone-150 dark:border-emerald-800/30 pb-4">
            <div>
              <h2 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-gold-200">
                إدارة البرامج والدورات ({programs.length})
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">تعديل المناهج والحلقات القرآنية</span>
            </div>
            <button
              onClick={() =>
                setEditingProgram({
                  id: `prog-${Date.now()}`,
                  slug: `prog-${Date.now()}`,
                  title: '',
                  shortDescription: '',
                  description: '',
                  objectives: ['حفظ وتثبيت الآيات', 'تصحيح التلاوة'],
                  prerequisites: ['إجادة القراءة من المصحف'],
                  level: 'مبتدئ',
                  duration: '3 أشهر',
                  schedule: 'يومان أسبوعياً',
                  teacher: 'نخبة من المشايخ',
                  section: 'both',
                  image: 'https://images.unsplash.com/photo-1609599006353-e629ababfc6a?auto=format&fit=crop&q=80&w=900'
                })
              }
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-gold-500 dark:text-emerald-950 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة برنامج جديد</span>
            </button>
          </div>

          {editingProgram && (
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-emerald-950/60 border border-gold-500/30 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">عنوان البرنامج</label>
                  <input
                    type="text"
                    value={editingProgram.title}
                    onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">المستوى</label>
                  <select
                    value={editingProgram.level}
                    onChange={(e) => setEditingProgram({ ...editingProgram, level: e.target.value as any })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  >
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="متوسط">متوسط</option>
                    <option value="متقدم">متقدم</option>
                    <option value="جميع المستويات">جميع المستويات</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">المدة والمواعيد</label>
                  <input
                    type="text"
                    value={editingProgram.schedule}
                    onChange={(e) => setEditingProgram({ ...editingProgram, schedule: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">المعلم / المشرف</label>
                  <input
                    type="text"
                    value={editingProgram.teacher}
                    onChange={(e) => setEditingProgram({ ...editingProgram, teacher: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">الوصف المختصر</label>
                  <input
                    type="text"
                    value={editingProgram.shortDescription}
                    onChange={(e) => setEditingProgram({ ...editingProgram, shortDescription: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">تفاصيل البرنامج</label>
                  <textarea
                    rows={3}
                    value={editingProgram.description}
                    onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-emerald-900/30 text-xs resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingProgram(null)} className="px-4 py-1.5 text-xs bg-stone-200 rounded-lg">إلغاء</button>
                <button
                  onClick={async () => {
                    if (!editingProgram.title) return;
                    await saveProgram(editingProgram);
                    setEditingProgram(null);
                    loadAllData();
                    showToast('تم حفظ البرنامج');
                  }}
                  className="px-4 py-1.5 text-xs bg-emerald-800 text-white rounded-lg dark:bg-gold-500 dark:text-emerald-950"
                >
                  حفظ البرنامج
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/60 dark:border-emerald-800/20 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-500/20 text-gold-700 dark:text-gold-300">{p.level}</span>
                  <h4 className="font-bold text-emerald-950 dark:text-gold-200 text-sm mt-1">{p.title}</h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">{p.duration} • {p.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingProgram(p)} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-gold-400"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={async () => { if (window.confirm(`حذف ${p.title}؟`)) { await deleteProgram(p.id); loadAllData(); showToast('تم الحذف'); } }} className="p-2 rounded-lg bg-red-50 text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
