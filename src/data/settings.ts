export interface MaqraaSettings {
  maqraaName: string;
  isFree: boolean;
  freeBadgeText: string;
  heroTagline: string;
  heroDescription: string;
  founderName: string;
  founderTitle: string;
  founderBio: string;
  whatsappMenUrl: string;
  whatsappWomenUrl: string;
  zoomUrl: string;
  zoomMeetingId: string;
  zoomPasscode: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
}

export const defaultSettings: MaqraaSettings = {
  maqraaName: 'مقرأة بالقرآن نحيا',
  isFree: true,
  freeBadgeText: 'مقرأة قرآنية مجانية 100%',
  heroTagline: 'تعلم القرآن عن بُعد مع نخبة من المشايخ والأساتذة',
  heroDescription: 'صرح قرآني تعليمي مجاني يُعنى بحفظ كتاب الله عز وجل وتجويده وتدبره عن بُعد، تحت إشراف نخبة من المشايخ والمقرئين بالسند المتصل.',
  founderName: 'فضيلة الشيخ شريف سعد',
  founderTitle: 'مؤسس المقرأة والمشرف العام عليها',
  founderBio: 'مقرئ مجاز بالقراءات العشر الصغرى والكبرى، صاحب مسيرة علمية وتربوية حافلة في خدمة كتاب الله وتعليم النشء وتخريج الحفاظ المتقنين على هدي النبوة والسند المتصل.',
  whatsappMenUrl: 'https://chat.whatsapp.com/G4g5nZL24LsJ7wjUIt6pgV',
  whatsappWomenUrl: 'https://chat.whatsapp.com/Iz6Txl9YYFFKSAacjm4Oyx',
  zoomUrl: 'https://zoom.us/j/1234567890',
  zoomMeetingId: '123 456 7890',
  zoomPasscode: '1448',
  contactEmail: 'maqraa.belquorannehya@gmail.com',
  contactPhone: '+216 58 445 289 | +20 10 62666368',
  location: 'حلقات التعليم القرآني عن بُعد (عالمية عبر الإنترنت)'
};
