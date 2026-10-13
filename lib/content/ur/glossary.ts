export type UrduGlossaryTerm = {
  /** Anchor id; matches the English entry so /glossary#arhti and /ur/glossary#arhti line up. */
  id: string;
  term: string;
  /** English name shown beside the Urdu term. */
  english?: string;
  definition: string;
  /** Localised internal link (a /ur path). */
  more?: string;
};

/**
 * Urdu glossary. Sorted into Urdu alphabetical order when rendered, so the
 * order here does not matter. Needs native-speaker review, especially the
 * newly coined or transliterated terms (ٹریس ایبلٹی, پرمیشنڈ بلاک چین, کولڈ چین).
 */
export const GLOSSARY_UR: UrduGlossaryTerm[] = [
  {
    id: "arhti",
    term: "آڑھتی",
    english: "Arhti",
    definition:
      "پاکستان کی تھوک منڈی میں کمیشن ایجنٹ جو کسان کی پیداوار خریداروں کو کمیشن پر بیچتا ہے اور اکثر فصل کے عوض کسان کو رقم یا کھاد بیج جیسی ضروریات پیشگی دیتا ہے۔",
    more: "/ur/guides/middlemen-in-pakistan-produce-supply-chain",
  },
  {
    id: "blockchain",
    term: "بلاک چین",
    english: "Blockchain",
    definition:
      "ایک مشترکہ ریکارڈ جس میں صرف نئے اندراجات شامل کیے جا سکتے ہیں اور ہر اندراج کرپٹوگرافی کے ذریعے پچھلے اندراج سے جڑا ہوتا ہے، اس لیے پرانے اندراج کو بدلا جائے تو تبدیلی نظر آ جاتی ہے۔",
    more: "/ur/guides/how-blockchain-food-traceability-works",
  },
  {
    id: "cold-chain",
    term: "کولڈ چین",
    english: "Cold chain",
    definition:
      "ٹھنڈے ذخیرے اور ٹھنڈی نقل و حمل کا بلا رکاوٹ سلسلہ جو جلد خراب ہونے والی پیداوار کو کٹائی سے لے کر خریدار تک محفوظ درجۂ حرارت پر رکھتا ہے۔",
    more: "/ur/guides/post-harvest-losses-pakistan-fruit-vegetables",
  },
  {
    id: "farm-gate-price",
    term: "فارم گیٹ قیمت",
    english: "Farm-gate price",
    definition:
      "وہ قیمت جو کسان کو کھیت پر پیداوار کے بدلے ملتی ہے، اس سے پہلے کہ ٹرانسپورٹ، ہینڈلنگ، تھوک اور ریٹیل کے منافع اس میں شامل ہوں۔",
  },
  {
    id: "farm-to-fork",
    term: "کھیت سے دسترخوان تک",
    english: "Farm-to-fork",
    definition:
      "پوری غذائی زنجیر کا بیان، یعنی اس کھیت سے جہاں پیداوار اگتی ہے، پیکنگ، ٹرانسپورٹ اور فروخت سے ہوتے ہوئے دسترخوان تک۔",
    more: "/ur/guides/what-is-farm-to-fork-traceability",
  },
  {
    id: "grading",
    term: "درجہ بندی",
    english: "Grading",
    definition:
      "پیداوار کو معیار، سائز اور حالت کے لحاظ سے جماعتوں میں چھانٹنا۔ Farm2Fork کی لسٹنگز میں گریڈ A، B اور C استعمال ہوتے ہیں۔",
  },
  {
    id: "hyperledger-fabric",
    term: "ہائپر لیجر فیبرک",
    english: "Hyperledger Fabric",
    definition:
      "Linux Foundation کا چلایا ہوا پرمیشنڈ بلاک چین فریم ورک جس میں صرف شناخت شدہ، منظور شدہ شرکاء لیجر پر لکھ سکتے ہیں۔ Farm2Fork اسے سپلائی چین کے واقعات ریکارڈ کرنے کے لیے استعمال کرتا ہے۔",
    more: "/ur/traceability",
  },
  {
    id: "kharif",
    term: "خریف",
    english: "Kharif",
    definition:
      "پاکستان میں گرمیوں کی فصلوں کا موسم۔ خریف کی فصلیں تقریباً جون سے بوئی جاتی ہیں اور اکتوبر یا نومبر کے قریب کٹتی ہیں۔ چاول، کپاس، گنا اور مکئی اس کی مثالیں ہیں۔",
    more: "/ur/guides/seasonal-fruits-vegetables-pakistan-calendar",
  },
  {
    id: "kinnow",
    term: "کینو",
    english: "Kinnow",
    definition:
      "مالٹے سے ملتا جلتا ترشاوہ پھل جو پنجاب میں، خاص طور پر سرگودھا کے آس پاس، بڑے پیمانے پر اگایا جاتا ہے اور زیادہ تر سردیوں میں توڑا جاتا ہے۔",
  },
  {
    id: "ledger",
    term: "لیجر (کھاتہ)",
    english: "Ledger",
    definition:
      "لین دین یا واقعات کا ریکارڈ۔ بلاک چین پر لیجر شرکاء کے درمیان مشترک ہوتا ہے اور اس کے اندراجات کو خاموشی سے بدلا نہیں جا سکتا۔",
  },
  {
    id: "mandi",
    term: "منڈی",
    english: "Mandi",
    definition:
      "پاکستان میں تھوک بازار جہاں کسانوں کی پیداوار عموماً کمیشن ایجنٹوں کے ذریعے نیلام یا تھوک فروشوں اور ریٹیلرز کو فروخت کی جاتی ہے۔",
    more: "/ur/guides/middlemen-in-pakistan-produce-supply-chain",
  },
  {
    id: "microfinance",
    term: "مائیکرو فنانس",
    english: "Microfinance",
    definition:
      "ان لوگوں کے لیے چھوٹے قرضے اور مالی خدمات جنہیں روایتی بینکاری تک رسائی حاصل نہیں، جیسے بہت سے چھوٹے کاشتکار۔",
    more: "/ur/for-farmers",
  },
  {
    id: "permissioned-blockchain",
    term: "پرمیشنڈ بلاک چین",
    english: "Permissioned blockchain",
    definition:
      "ایسا بلاک چین جس کے شرکاء پہلے سے شناخت اور منظور کیے جاتے ہیں، اس لیے صرف قابلِ بھروسا فریق ہی اس میں لکھ یا اسے پڑھ سکتے ہیں، بٹ کوائن جیسے کھلے نیٹ ورکس کے برعکس۔",
    more: "/ur/guides/how-blockchain-food-traceability-works",
  },
  {
    id: "post-harvest-loss",
    term: "کٹائی کے بعد کا نقصان",
    english: "Post-harvest loss",
    definition:
      "وہ پیداوار جو اگائی تو جاتی ہے مگر کھائی نہیں جاتی، کیونکہ کٹائی اور خریدار تک پہنچنے کے درمیان وہ خراب ہو جاتی ہے، ٹوٹ پھوٹ کا شکار ہوتی ہے یا مسترد کر دی جاتی ہے۔ پاکستانی پھلوں اور سبزیوں کے لیے اندازے 20 سے 40 فیصد کے درمیان ہیں۔",
    more: "/ur/guides/post-harvest-losses-pakistan-fruit-vegetables",
  },
  {
    id: "provenance",
    term: "پیداوار کا ماخذ",
    english: "Provenance",
    definition:
      "کسی پروڈکٹ کا دستاویزی ماخذ اور تاریخ، جس میں یہ شامل ہے کہ وہ کہاں اگائی گئی اور اسے کس کس نے سنبھالا۔",
  },
  {
    id: "qr-code",
    term: "QR کوڈ",
    english: "QR code",
    definition:
      "ایک چوکور بار کوڈ جسے فون کا کیمرا اسکین کر سکتا ہے۔ Farm2Fork کا QR کوڈ آرڈر کا ریکارڈ شدہ سفر کھولتا ہے۔",
    more: "/ur/traceability",
  },
  {
    id: "rabi",
    term: "ربیع",
    english: "Rabi",
    definition:
      "پاکستان میں سردیوں کی فصلوں کا موسم۔ ربیع کی فصلیں تقریباً نومبر سے اپریل کے دوران بوئی جاتی ہیں اور بہار میں کٹتی ہیں۔ گندم، چنا، مٹر اور سرسوں اس کی مثالیں ہیں۔",
    more: "/ur/guides/seasonal-fruits-vegetables-pakistan-calendar",
  },
  {
    id: "smallholder",
    term: "چھوٹا کاشتکار",
    english: "Smallholder",
    definition:
      "وہ کسان جو تھوڑی سی زمین پر، عموماً گھر کے افراد کی محنت سے، کاشت کرتا ہے اور جس کی قرض، ذخیرہ اندوزی اور منڈیوں تک رسائی اکثر محدود ہوتی ہے۔",
  },
  {
    id: "supply-chain",
    term: "سپلائی چین",
    english: "Supply chain",
    definition:
      "لوگوں اور مراحل کا وہ سلسلہ جو کسی پروڈکٹ کو اس کی تیاری کی جگہ سے استعمال کی جگہ تک پہنچاتا ہے، جس میں کاشتکار، کیریئر، تھوک فروش اور ریٹیلرز شامل ہیں۔",
  },
  {
    id: "traceability",
    term: "ٹریس ایبلٹی",
    english: "Traceability",
    definition:
      "ہر بیچ کی شناخت اور ہر حوالگی کا ریکارڈ رکھ کر کسی پروڈکٹ کے سفر کے ہر مرحلے میں آگے اور پیچھے کی طرف سراغ لگا سکنے کی صلاحیت۔",
    more: "/ur/guides/what-is-farm-to-fork-traceability",
  },
];
