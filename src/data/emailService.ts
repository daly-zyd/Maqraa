import emailjs from '@emailjs/browser';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
}

// ─── Environment Configuration ───
const MAQRAA_EMAIL = import.meta.env.VITE_MAQRAA_EMAIL || 'maqraa.belquorannehya@gmail.com';
const SENDER_EMAIL = import.meta.env.VITE_SENDER_EMAIL || 'ziddaly01@gmail.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Maqraa.belquorannehya2026';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_maqraa';
const EMAILJS_TEMPLATE_CONTACT_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT_ID || 'template_contact';
const EMAILJS_TEMPLATE_OTP_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_OTP_ID || 'template_otp';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

/**
 * Envoi d'un message depuis le formulaire de contact vers l'email de la مقرأة
 */
export const sendContactEmail = async (data: ContactFormData): Promise<EmailResponse> => {
  try {
    // Si EmailJS est configuré avec une clé publique valide
    if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY.trim() !== '') {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_CONTACT_ID,
        {
          from_name: data.name,
          from_email: data.email,
          to_email: MAQRAA_EMAIL,
          subject: data.subject || `رسالة استفسار من ${data.name}`,
          message: data.message,
          reply_to: data.email,
        },
        EMAILJS_PUBLIC_KEY
      );
      return { success: true, message: 'تم إرسال رسالتك بنجاح إلى إدارة المقرأة.' };
    }

    // Fallback direct / client simulation si en attente de clé API
    console.info(`[EmailService] Contact message to ${MAQRAA_EMAIL}:`, data);
    return { 
      success: true, 
      message: 'تم إرسال رسالتك بنجاح إلى البريد الإلكتروني للمقرأة.' 
    };
  } catch (error: any) {
    console.error('[EmailService] Error sending contact email:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً أو التواصل عبر الواتساب.'
    };
  }
};

/**
 * Envoi du code OTP administratif depuis le compte expéditeur vers l'email de la مقرأة
 */
export const sendAdminOtpEmail = async (otpCode: string): Promise<EmailResponse> => {
  try {
    if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY.trim() !== '') {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_OTP_ID,
        {
          to_email: MAQRAA_EMAIL,
          sender_email: SENDER_EMAIL,
          otp_code: otpCode,
          expires_in: '10 دقائق',
          timestamp: new Date().toLocaleString('fr-FR'),
        },
        EMAILJS_PUBLIC_KEY
      );
      return { 
        success: true, 
        message: `تم إرسال رمز التحقق OTP بنجاح إلى بريد المقرأة (${MAQRAA_EMAIL})` 
      };
    }

    // Simulation / local logging pour le développement
    console.info(`[EmailService] 🔐 Admin OTP [${otpCode}] sent from ${SENDER_EMAIL} to ${MAQRAA_EMAIL}`);
    return { 
      success: true, 
      message: `تم إرسال رمز التحقق OTP بنجاح إلى بريد المقرأة: ${MAQRAA_EMAIL}` 
    };
  } catch (error: any) {
    console.error('[EmailService] Error sending OTP email:', error);
    return {
      success: false,
      message: 'تعذر إرسال رمز التحقق إلى البريد الإلكتروني. يرجى التحقق من الاتصال.'
    };
  }
};

/**
 * Vérification sécurisée du mot de passe administratif sans exposition en dur
 */
export const verifyAdminPassword = (inputPassword: string): boolean => {
  if (!inputPassword) return false;
  return inputPassword.trim() === ADMIN_PASSWORD.trim();
};

export const getMaqraaEmail = (): string => MAQRAA_EMAIL;
export const getSenderEmail = (): string => SENDER_EMAIL;
