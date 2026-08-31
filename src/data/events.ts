export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  section: 'rijel' | 'nissa' | 'both';
  image: string;
}

export const eventsData: Event[] = [
  {
    id: 'quran-night',
    slug: 'quran-night',
    title: 'الأمسية القرآنية السنوية الثالثة',
    description: 'أمسية إيمانية تجمع نخبة من قراء العالم الإسلامي والمحليين لتلاوة آيات بينات من الذكر الحكيم، يتخللها كلمات دعوية وتكريم لعدد من حفظة كتاب الله المتميزين في منطقتنا.',
    date: 'السبت، 15 شعبان 1448هـ (الموافق 15 فبراير 2026م)',
    time: 'من الساعة 8:00 مساءً إلى 10:30 مساءً',
    location: 'عن بُعد (عبر البث المباشر وغرفة Zoom الخاصة)',
    section: 'both',
    image: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&q=80&w=900'
  },
  {
    id: 'tajweed-workshop',
    slug: 'tajweed-workshop',
    title: 'ندوة "مفاتيح التدبر وحسن الترتيل"',
    description: 'ندوة مكثفة حول أهم الأخطاء الشائعة في قراءة القرآن، وكيفية تصحيحها، مع تسليط الضوء على مفاتيح تدبر آيات القرآن في الصلاة وخارجها.',
    date: 'الجمعة، 5 رمضان 1448هـ (الموافق 5 مارس 2026م)',
    time: 'بعد صلاة العصر مباشرة',
    location: 'عن بُعد (عبر منصة Zoom - قاعات مخصصة للرجال والنساء)',
    section: 'both',
    image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=900'
  },
  {
    id: 'hifz-graduation',
    slug: 'hifz-graduation',
    title: 'حفل تكريم خريجي برنامج الإجازة والخاتمين',
    description: 'حفل بهيج تحتفي فيه المقرأة بطلابها وطالباتها الذين منّ الله عليهم بختم كتابه الكريم أو نيل الإجازات المتصلة بالسند، بحضور كوكبة من العلماء والدعاة وذوي المحتفى بهم.',
    date: 'الجمعة، 27 شوال 1448هـ (الموافق 22 مايو 2026م)',
    time: 'الساعة 5:00 عصراً',
    location: 'عن بُعد (بث مباشر عالمي تفاعلي عبر Zoom)',
    section: 'both',
    image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80&w=900'
  }
];
