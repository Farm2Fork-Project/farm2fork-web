import { HOME_FAQS_UR } from "./faqs";
import { GUIDES_UR } from "./guides";
import type { ContentPageData } from "../types";

/**
 * Urdu home page at /ur. English "/" is an interactive app shell, so this is a
 * plain server-rendered content page rather than a translation of it.
 */
export const HOME_UR: ContentPageData = {
  path: "/",
  eyebrow: "اردو",
  h1: "پاکستانی کسانوں سے براہِ راست تازہ پیداوار",
  lead: "Farm2Fork پاکستان کی کسان سے خریدار تک براہِ راست منڈی ہے۔ کسان اپنی مرضی کی قیمت پر پیداوار لسٹ کرتے ہیں، خریدار ایک مخصوص فارم سے آرڈر دیتے ہیں اور ادائیگی سے پہلے ڈیلیوری کوٹیشن دیکھتے ہیں، ٹرانسپورٹ پارٹنر آرڈر پہنچاتے ہیں، اور ہر حوالگی Hyperledger Fabric لیجر پر ریکارڈ ہوتی ہے جسے خریدار QR کوڈ اسکین کر کے پڑھ سکتا ہے۔",
  sections: [
    {
      id: "what-is-farm2fork",
      heading: "Farm2Fork کیا ہے؟",
      blocks: [
        {
          type: "p",
          text: "Farm2Fork یونیورسٹی آف سینٹرل پنجاب کا فائنل ایئر پروجیکٹ ہے اور فی الحال پائلٹ مرحلے میں ہے۔ اس میں چار کردار ہیں: خریدار، کسان، ٹرانسپورٹ پارٹنر اور مالیاتی پارٹنر۔ ہر کردار الگ سائن اپ کرتا ہے اور اپنے مخصوص ٹولز دیکھتا ہے۔",
        },
        {
          type: "p",
          text: "[ہمارے بارے میں](/ur/about) پڑھیں، دیکھیں کہ [آرڈر کیسے کام کرتا ہے](/ur/how-it-works)، یا جانیں کہ [ٹریس ایبلٹی کیا ثابت کرتی ہے اور کیا نہیں](/ur/traceability)۔ کسان [کسانوں کے صفحے](/ur/for-farmers) سے، خریدار [خریداروں کے صفحے](/ur/for-buyers) سے اور ٹرانسپورٹر [ٹرانسپورٹ پارٹنرز کے صفحے](/ur/for-transporters) سے آغاز کر سکتے ہیں۔",
        },
        {
          type: "callout",
          title: "ایک ضروری نوٹ",
          text: "Farm2Fork ابھی پائلٹ ہے، اس لیے ادائیگی کا انضمام اور AI ماڈلز ٹیسٹنگ یا تربیت میں ہیں، اور ہم صارفین کی تعداد یا تعریفی آراء شائع نہیں کرتے۔ سائن اِن اور مارکیٹ پلیس کی ایپ فی الحال [انگریزی صفحے](/) سے کھلتی ہے۔",
        },
      ],
    },
    {
      id: "guides",
      heading: "گائیڈز: تازہ پیداوار واقعی کیسے منتقل ہوتی ہے",
      blocks: [
        {
          type: "ul",
          items: GUIDES_UR.slice(0, 4).map((guide) => `[${guide.title}](/ur/guides/${guide.slug})`),
        },
        {
          type: "p",
          text: "[تمام گائیڈز دیکھیں](/ur/guides)۔ نیچے کے سوالات میں زیادہ تر لوگ سب سے پہلے یہی پوچھتے ہیں؛ ہر سوال کا جواب [عام سوالات](/ur/faq) میں تفصیل سے موجود ہے۔",
        },
      ],
    },
  ],
  faqs: HOME_FAQS_UR,
  cta: {
    title: "شروع کرنے کے لیے تیار ہیں؟",
    text: "اپنے کردار کے مطابق مفت اکاؤنٹ بنائیں، یا پہلے دیکھیں کہ پلیٹ فارم کیسے کام کرتا ہے۔",
    primary: { label: "شروع کریں", href: "/signup" },
    secondary: { label: "کیسے کام کرتا ہے", href: "/ur/how-it-works" },
  },
  related: ["/how-it-works", "/traceability", "/for-farmers", "/for-buyers"],
};
