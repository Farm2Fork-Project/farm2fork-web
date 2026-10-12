import type { Article } from "../content/types";
import type { Locale } from "./locale";

/**
 * Interface strings for the public pages (navigation, headings the layout adds
 * around content, bespoke page copy). Page content itself lives in
 * `lib/content` (English) and `lib/content/ur` (Urdu).
 */
export type Ui = {
  skip: string;
  home: string;
  signIn: string;
  getStarted: string;
  menu: string;
  openMenu: string;
  brandAria: string;
  mainNav: string;
  mobileNav: string;
  breadcrumb: string;
  onThisPage: string;
  commonQuestions: string;
  sources: string;
  keepReading: string;
  relatedPages: string;
  relatedGuides: string;
  keyTakeaways: string;
  table: string;
  lastReviewed: string;
  published: string;
  updated: string;
  byTeam: string;
  minRead: (minutes: number) => string;
  readMore: string;
  categories: Record<Article["category"], string>;
  /** Link that switches to the other language. */
  switchLabel: string;
  switchAria: string;
  footer: {
    product: string;
    learn: string;
    company: string;
    about: string;
    note: string;
    legal: (year: number) => string;
  };
  faq: { crumb: string; eyebrow: string; h1: string; lead: string; jsonName: string; ctaTitle: string; ctaText: string; cta1: string; cta2: string };
  glossary: { crumb: string; eyebrow: string; h1: string; lead: string; jsonName: string };
  guides: { crumb: string; eyebrow: string; h1: string; lead: string; jsonName: string };
  guide: { ctaTitle: string; ctaText: string; cta1: string; cta2: string; defaultAlt: string };
  contact: {
    crumb: string;
    eyebrow: string;
    h1: string;
    lead: string;
    jsonName: string;
    emailHeading: string;
    includeHeading: string;
    includeItems: string[];
    warning: string;
  };
};

const en: Ui = {
  skip: "Skip to content",
  home: "Home",
  signIn: "Sign in",
  getStarted: "Get started",
  menu: "Menu",
  openMenu: "Open menu",
  brandAria: "Farm2Fork home",
  mainNav: "Main navigation",
  mobileNav: "Mobile navigation",
  breadcrumb: "Breadcrumb",
  onThisPage: "On this page",
  commonQuestions: "Common questions",
  sources: "Sources",
  keepReading: "Keep reading",
  relatedPages: "Related pages",
  relatedGuides: "Related guides",
  keyTakeaways: "Key takeaways",
  table: "Table",
  lastReviewed: "Last reviewed",
  published: "Published",
  updated: "Updated",
  byTeam: "By the Farm2Fork team",
  minRead: (minutes) => `${minutes} min read`,
  readMore: "Read more",
  categories: { Buying: "Buying", Traceability: "Traceability", Farming: "Farming", "Supply chain": "Supply chain" },
  switchLabel: "اردو",
  switchAria: "اردو میں پڑھیں (Read in Urdu)",
  footer: {
    product: "Product",
    learn: "Learn",
    company: "Company",
    about: "Transparent agriculture, from farm to fork. A direct, traceable produce market for Pakistan.",
    note: "A final year project of the Faculty of Information Technology and Computer Science, University of Central Punjab. Currently in pilot.",
    legal: (year) => `© ${year} Farm2Fork. All rights reserved.`,
  },
  faq: {
    crumb: "FAQ",
    eyebrow: "FAQ",
    h1: "Frequently asked questions about Farm2Fork",
    lead: "Straight answers about buying and selling produce, delivery and fees, payment, QR traceability and privacy on Farm2Fork, a pilot marketplace for Pakistani farmers.",
    jsonName: "Farm2Fork frequently asked questions",
    ctaTitle: "Still have a question?",
    ctaText: "Read how the platform works, or look up a term in the glossary.",
    cta1: "How it works",
    cta2: "Glossary",
  },
  glossary: {
    crumb: "Glossary",
    eyebrow: "Glossary",
    h1: "Farm-to-fork glossary: mandi, arhti, traceability and more",
    lead: "Short, plain definitions of the supply chain, farming and technology terms used across Farm2Fork, with the Urdu term where one is in common use.",
    jsonName: "Farm-to-fork glossary",
  },
  guides: {
    crumb: "Guides",
    eyebrow: "Guides",
    h1: "Farm-to-table guides for Pakistan",
    lead: "Practical, sourced guides for buyers, farmers and anyone curious about how fresh produce moves through Pakistan: buying direct, seasonal produce, post-harvest losses, traceability and selling online.",
    jsonName: "Farm2Fork guides",
  },
  guide: {
    ctaTitle: "See how Farm2Fork puts this into practice",
    ctaText: "Direct orders from named farms, delivery quotes up front, and a QR journey for every order.",
    cta1: "How it works",
    cta2: "Get started",
    defaultAlt: "Farm2Fork guide",
  },
  contact: {
    crumb: "Contact",
    eyebrow: "Contact",
    h1: "Contact the Farm2Fork team",
    lead: "Email us about the platform, partnerships, press or a problem with your account. Farm2Fork is a student project, so replies can take a few days.",
    jsonName: "Contact Farm2Fork",
    emailHeading: "Email",
    includeHeading: "What to include",
    includeItems: [
      "Your role: buyer, farmer, transport partner or financial partner.",
      "The email address on your account.",
      "For an order problem, the order reference and what went wrong.",
    ],
    warning: "Never send passwords, card numbers or your CNIC by email.",
  },
};

const ur: Ui = {
  skip: "مرکزی مواد پر جائیں",
  home: "ہوم",
  signIn: "سائن اِن",
  getStarted: "شروع کریں",
  menu: "مینو",
  openMenu: "مینو کھولیں",
  brandAria: "Farm2Fork ہوم",
  mainNav: "مرکزی نیویگیشن",
  mobileNav: "موبائل نیویگیشن",
  breadcrumb: "صفحے کا راستہ",
  onThisPage: "اس صفحے پر",
  commonQuestions: "عام سوالات",
  sources: "حوالہ جات",
  keepReading: "مزید پڑھیں",
  relatedPages: "متعلقہ صفحات",
  relatedGuides: "متعلقہ گائیڈز",
  keyTakeaways: "اہم نکات",
  table: "جدول",
  lastReviewed: "آخری جائزہ",
  published: "اشاعت",
  updated: "تازہ کاری",
  byTeam: "Farm2Fork ٹیم کی طرف سے",
  minRead: (minutes) => `${minutes} منٹ کا مطالعہ`,
  readMore: "مزید پڑھیں",
  categories: { Buying: "خریداری", Traceability: "ٹریس ایبلٹی", Farming: "کاشتکاری", "Supply chain": "سپلائی چین" },
  switchLabel: "English",
  switchAria: "Read in English (انگریزی میں پڑھیں)",
  footer: {
    product: "پلیٹ فارم",
    learn: "سیکھیں",
    company: "ادارہ",
    about: "شفاف زراعت، کھیت سے دسترخوان تک۔ پاکستان کے لیے براہِ راست اور قابلِ سراغ پیداواری منڈی۔",
    note: "یونیورسٹی آف سینٹرل پنجاب کی فیکلٹی آف انفارمیشن ٹیکنالوجی اینڈ کمپیوٹر سائنس کا فائنل ایئر پروجیکٹ۔ فی الحال پائلٹ مرحلے میں۔",
    legal: (year) => `© ${year} Farm2Fork۔ جملہ حقوق محفوظ ہیں۔`,
  },
  faq: {
    crumb: "عام سوالات",
    eyebrow: "عام سوالات",
    h1: "Farm2Fork کے بارے میں اکثر پوچھے جانے والے سوالات",
    lead: "Farm2Fork پر پیداوار خریدنے اور بیچنے، ڈیلیوری اور فیس، ادائیگی، QR ٹریس ایبلٹی اور پرائیویسی کے بارے میں سیدھے جوابات۔ یہ پاکستانی کسانوں کے لیے ایک پائلٹ مارکیٹ پلیس ہے۔",
    jsonName: "Farm2Fork کے بارے میں اکثر پوچھے جانے والے سوالات",
    ctaTitle: "کوئی اور سوال ہے؟",
    ctaText: "پڑھیں کہ پلیٹ فارم کیسے کام کرتا ہے، یا لغت میں کوئی اصطلاح دیکھیں۔",
    cta1: "کیسے کام کرتا ہے",
    cta2: "لغت",
  },
  glossary: {
    crumb: "لغت",
    eyebrow: "لغت",
    h1: "کھیت سے دسترخوان تک کی لغت: منڈی، آڑھتی، ٹریس ایبلٹی اور مزید",
    lead: "Farm2Fork میں استعمال ہونے والی سپلائی چین، زراعت اور ٹیکنالوجی کی اصطلاحات کی مختصر اور سادہ تعریفیں، ساتھ میں انگریزی نام جہاں رائج ہو۔",
    jsonName: "کھیت سے دسترخوان تک کی لغت",
  },
  guides: {
    crumb: "گائیڈز",
    eyebrow: "گائیڈز",
    h1: "پاکستان کے لیے کھیت سے دسترخوان تک کی گائیڈز",
    lead: "خریداروں، کسانوں اور ہر اس شخص کے لیے عملی اور حوالہ جات والی گائیڈز جو جاننا چاہتا ہے کہ تازہ پیداوار پاکستان میں کیسے منتقل ہوتی ہے: براہِ راست خریداری، موسمی پھل اور سبزیاں، فصل کٹنے کے بعد کے نقصانات، ٹریس ایبلٹی اور آن لائن فروخت۔",
    jsonName: "Farm2Fork گائیڈز",
  },
  guide: {
    ctaTitle: "دیکھیں Farm2Fork اس پر عمل کیسے کرتا ہے",
    ctaText: "معلوم فارموں سے براہِ راست آرڈر، پہلے سے ڈیلیوری کوٹیشن، اور ہر آرڈر کے لیے QR سفر۔",
    cta1: "کیسے کام کرتا ہے",
    cta2: "شروع کریں",
    defaultAlt: "Farm2Fork گائیڈ",
  },
  contact: {
    crumb: "رابطہ",
    eyebrow: "رابطہ",
    h1: "Farm2Fork ٹیم سے رابطہ کریں",
    lead: "پلیٹ فارم، شراکت داری، میڈیا یا اپنے اکاؤنٹ کے کسی مسئلے کے بارے میں ہمیں ای میل کریں۔ Farm2Fork ایک طلبہ کا پروجیکٹ ہے، اس لیے جواب میں چند دن لگ سکتے ہیں۔",
    jsonName: "Farm2Fork سے رابطہ",
    emailHeading: "ای میل",
    includeHeading: "ای میل میں کیا لکھیں",
    includeItems: [
      "آپ کا کردار: خریدار، کسان، ٹرانسپورٹ پارٹنر یا مالیاتی پارٹنر۔",
      "آپ کے اکاؤنٹ پر درج ای میل ایڈریس۔",
      "آرڈر کے مسئلے کی صورت میں آرڈر کا حوالہ نمبر اور یہ کہ کیا غلط ہوا۔",
    ],
    warning: "پاس ورڈ، کارڈ نمبر یا شناختی کارڈ نمبر (CNIC) کبھی ای میل پر نہ بھیجیں۔",
  },
};

export const UI: Record<Locale, Ui> = { en, ur };
