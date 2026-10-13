import { GUIDES_UR } from "../content/ur/guides";
import { guidePath } from "../content/guides";

/** Urdu title, description and navigation label for a registry page. */
export type UrduPageMeta = { title: string; description: string; navLabel: string };

const STATIC_META: Record<string, UrduPageMeta> = {
  "/": {
    title: "Farm2Fork: پاکستانی کسانوں سے براہِ راست تازہ پیداوار",
    description:
      "Farm2Fork پاکستانی کسانوں کو براہِ راست خریداروں سے جوڑتا ہے۔ فارم، قیمت اور معیار پہلے دیکھیں، ڈیلیوری کروائیں اور ہر آرڈر کو QR کوڈ سے ٹریس کریں۔",
    navLabel: "ہوم",
  },
  "/how-it-works": {
    title: "Farm2Fork کیسے کام کرتا ہے: کھیت سے ڈیلیوری تک",
    description:
      "جانیں Farm2Fork کیسے کام کرتا ہے: کسان پیداوار لسٹ کرتے ہیں، خریدار مخصوص فارم سے آرڈر دیتے ہیں، ڈیلیوری پارٹنر پہنچاتے ہیں، اور ہر مرحلہ QR سے ٹریس ہوتا ہے۔",
    navLabel: "کیسے کام کرتا ہے",
  },
  "/traceability": {
    title: "QR کوڈ اور بلاک چین سے خوراک کی ٹریس ایبلٹی",
    description:
      "Farm2Fork Hyperledger Fabric لیجر اور QR کوڈ سے پیداوار کو کھیت سے خریدار تک ٹریس کرتا ہے۔ جانیں کیا ریکارڈ ہوتا ہے اور بلاک چین کیا ثابت نہیں کر سکتا۔",
    navLabel: "ٹریس ایبلٹی",
  },
  "/for-farmers": {
    title: "پاکستان میں پیداوار براہِ راست خریداروں کو بیچیں",
    description:
      "کسان Farm2Fork پر اپنی قیمت پر پیداوار لسٹ کرتے، براہِ راست آرڈر لیتے، ڈیلیوری ٹرانسپورٹ پارٹنر کو سونپتے اور مالی معاونت کے لیے درخواست دیتے ہیں۔",
    navLabel: "کسانوں کے لیے",
  },
  "/for-buyers": {
    title: "پاکستانی فارموں سے براہِ راست پیداوار خریدیں",
    description:
      "مخصوص پاکستانی فارموں سے براہِ راست تازہ پیداوار منگوائیں۔ فارم، گریڈ اور قیمت پہلے دیکھیں، ادائیگی سے پہلے ڈیلیوری کوٹیشن لیں، اور QR کوڈ سے سفر ٹریس کریں۔",
    navLabel: "خریداروں کے لیے",
  },
  "/for-transporters": {
    title: "ٹرانسپورٹ پارٹنرز کے لیے ڈیلیوری کا کام",
    description:
      "Farm2Fork کے ٹرانسپورٹ پارٹنر کھلی ڈیلیوریز کلیم کرتے، فارموں سے پیداوار اٹھاتے اور ہر شپمنٹ کی حالت اپ ڈیٹ کرتے ہیں۔ جانیں فیس کیسے طے ہوتی ہے۔",
    navLabel: "ٹرانسپورٹ پارٹنرز کے لیے",
  },
  "/guides": {
    title: "پاکستان کے لیے کھیت سے دسترخوان تک کی گائیڈز",
    description:
      "براہِ راست خریداری، موسمی پیداوار، کٹائی کے بعد کے نقصانات، ٹریس ایبلٹی اور پاکستان میں آن لائن فروخت کے بارے میں عملی اور حوالہ جات والی گائیڈز۔",
    navLabel: "گائیڈز",
  },
  "/faq": {
    title: "عام سوالات: خریداری، فروخت اور ٹریس ایبلٹی",
    description:
      "Farm2Fork کے بارے میں عام سوالات کے جوابات: پیداوار کیسے خریدیں اور بیچیں، ڈیلیوری اور فیس، ادائیگی، QR ٹریس ایبلٹی، بلاک چین اور پرائیویسی۔",
    navLabel: "عام سوالات",
  },
  "/glossary": {
    title: "زرعی لغت: منڈی، آڑھتی، ٹریس ایبلٹی",
    description:
      "پاکستانی زراعت اور خوراک کی ٹریس ایبلٹی کی اصطلاحات کی سادہ تعریفیں، بشمول منڈی، آڑھتی، خریف، ربیع، بلاک چین اور کٹائی کے بعد کا نقصان۔",
    navLabel: "لغت",
  },
  "/about": {
    title: "Farm2Fork کے بارے میں",
    description:
      "Farm2Fork یونیورسٹی آف سینٹرل پنجاب کے طلبہ کا بنایا ہوا پلیٹ فارم ہے جو قابلِ سراغ سپلائی چین کے ذریعے پاکستانی کسانوں کو براہِ راست خریداروں سے جوڑتا ہے۔",
    navLabel: "ہمارے بارے میں",
  },
  "/contact": {
    title: "Farm2Fork سے رابطہ",
    description:
      "پلیٹ فارم، شراکت داری یا میڈیا کے بارے میں Farm2Fork ٹیم سے رابطہ کریں۔ ای میل ایڈریس اور وہ معلومات دیکھیں جو لکھنی چاہییں تاکہ ہم جلد مدد کر سکیں۔",
    navLabel: "رابطہ",
  },
  "/privacy": {
    title: "پرائیویسی پالیسی",
    description:
      "Farm2Fork اکاؤنٹ، فارم اور ڈیلیوری کی تفصیلات سمیت ذاتی معلومات کیسے جمع، استعمال اور شیئر کرتا ہے، اور آپ کے ڈیٹا پر آپ کے اختیارات کیا ہیں۔",
    navLabel: "پرائیویسی",
  },
  "/terms": {
    title: "استعمال کی شرائط",
    description:
      "Farm2Fork کے استعمال کے اصول، جو پاکستانی کسانوں، خریداروں اور ٹرانسپورٹ پارٹنرز کو جوڑنے والی پائلٹ مارکیٹ پلیس ہے: اکاؤنٹس، لسٹنگز، آرڈرز اور ڈیلیوریز۔",
    navLabel: "شرائط",
  },
};

/** Guides take their Urdu metadata from the Urdu article itself. */
const GUIDE_META: Record<string, UrduPageMeta> = Object.fromEntries(
  GUIDES_UR.map((guide) => [
    guidePath(guide.slug),
    { title: guide.metaTitle, description: guide.description, navLabel: guide.metaTitle },
  ]),
);

export const URDU_PAGE_META: Record<string, UrduPageMeta> = { ...STATIC_META, ...GUIDE_META };
