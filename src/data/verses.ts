/**
 * Quran verses and hadiths shown on the site.
 *
 * Adab rules (see maqraa_2_functional.md): text is displayed exactly and in full, never on buttons
 * or error messages, and nothing is published until the owner sets `approved: true`.
 * Until then an entry is rendered only in development and on /styleguide, tagged "قيد المراجعة".
 */
export interface Verse {
  id: string;
  kind: 'ayah' | 'hadith';
  text: string;
  /** Human-readable reference, e.g. "سورة القمر — الآية 17" */
  reference: string;
  /** Where the text was checked */
  source: string;
  approved: boolean;
}

const TANZIL = 'Tanzil Uthmani (via api.alquran.cloud, edition quran-uthmani)';

export const verses: Verse[] = [
  {
    id: 'qamar-17',
    kind: 'ayah',
    text: 'وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍۢ',
    reference: 'سورة القمر — الآية 17',
    source: TANZIL,
    approved: false
  },
  {
    id: 'isra-82',
    kind: 'ayah',
    text: 'وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌۭ وَرَحْمَةٌۭ لِّلْمُؤْمِنِينَ ۙ وَلَا يَزِيدُ ٱلظَّٰلِمِينَ إِلَّا خَسَارًۭا',
    reference: 'سورة الإسراء — الآية 82',
    source: TANZIL,
    approved: false
  },
  {
    id: 'bukhari-5027',
    kind: 'hadith',
    text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    reference: 'رواه البخاري (5027)',
    source: 'صحيح البخاري، كتاب فضائل القرآن — يلزم التحقق من الرواية والتشكيل من نسخة معتمدة',
    approved: false
  }
];

/** Entries allowed on public pages: approved ones, or every one while developing. */
export const getPublishableVerses = (): Verse[] =>
  verses.filter((v) => v.approved || import.meta.env.DEV);

export const getVerse = (id: string): Verse | undefined => verses.find((v) => v.id === id);
