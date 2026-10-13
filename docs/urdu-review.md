# Urdu text: what needs a native-speaker review

The Urdu pages under `/ur` (see README, "Urdu pages") are a careful first
translation, not a reviewed one. English remains the authoritative text. Before
the Urdu pages are promoted (Search Console submission, linking from the app),
have a fluent Urdu reader go through the items below. Files are in
`lib/content/ur/`, `lib/seo/pages-ur.ts` and `lib/seo/ui.ts`.

## Highest priority

1. **Legal text** (`lib/content/ur/legal.ts`: privacy policy, terms). Wording
   needs a native reader, ideally with the English draft reviewed by a lawyer
   first. I also added one sentence that is *not* in the English draft, to both
   "Draft policy" and "Draft terms" callouts: «انگریزی متن ہی مستند ہے» ("the
   English text is the authoritative one"). Keep or drop it as a project
   decision.
2. **Coined or transliterated terms.** Check these are what Pakistani readers
   would actually say and search for:
   - ٹریس ایبلٹی for *traceability*, with «قابلِ سراغ» ("traceable") as the
     adjective and «سراغ لگانا» for the verb. Alternatives: «سراغ لگانے کی
     صلاحیت», «ماخذ کا سراغ».
   - پرمیشنڈ بلاک چین for *permissioned blockchain* (glossed as «اجازت پر مبنی» on
     `/ur/traceability`).
   - کھیت سے دسترخوان تک for *farm-to-fork*.
   - کولڈ چین, فارم گیٹ قیمت, کٹائی کے بعد کا نقصان (post-harvest loss),
     درمیانی واسطے (middlemen), مالیاتی پارٹنر (financial partner).
   - Loan-words used as-is: لسٹنگ / لسٹ کرنا, کوٹیشن (delivery quote), پک اپ,
     ڈراپ آف, ٹرانسپورٹ پارٹنر, پلیٹ فارم فیس, ڈیش بورڈ, شپمنٹ, کلیم کرنا.
   - «مخصوص / نامزد فارم» for *named farm* (an identified, registered farm).
   - Glossary heading «ہائپر لیجر فیبرک» (transliterated) while every other page
     keeps *Hyperledger Fabric* in Latin; pick one.
3. **Crop and food names** in `lib/content/ur/guides/farming.ts` (seasonal
   table) and `buying-and-storing.ts` (storage table): جاپانی پھل (persimmon),
   فالسہ, اروی, ٹنڈا, آلو بخارا (plum), لوکاٹ, "بیل دار سبزیاں" (gourds).

## Also worth a look

- Register: everything uses the polite آپ form; confirm the tone suits farmers
  as well as urban buyers.
- Idioms translated more or less literally: «فون نہیں گھمانا پڑتا», «اندازے
  بازی», «ہاتھ سے اور غلط طریقے سے ... انتظام» (manual and improper
  post-harvest management), «بِکری سے رہ جانے والی پیداوار».
- Numbers are written in Latin digits (20 سے 40 فیصد, 23.5 فیصد) so they stay
  searchable and match the sources. Change if Urdu-Indic digits are preferred.
- Titles are 60 characters or fewer and descriptions 70 to 160 characters
  (counted in characters, as the English ones are). Google truncates by pixel
  width, and Nastaliq can be wider or narrower than that; check the snippets in
  Search Console after indexing.
- Interface strings in `lib/seo/ui.ts` (nav, "On this page", footer note,
  contact page).
- Source titles under "حوالہ جات" are the original English publication titles
  and are deliberately left in English.
- The `/ur` home page is a content page, not a translation of the interactive
  English `/`; its copy is in `lib/content/ur/home.ts`.

## Honesty rules still apply

The Urdu copy follows PRODUCT.md: pilot, no user counts, no testimonials, no
claims that payments or the AI advisor are production-ready. `test/seo.test.ts`
checks the Urdu text for invented social proof and for the same statistics as
the English pages (20 to 40% post-harvest loss, 23.5% of GDP, 37% of labour).

## App screens: sign-in, sign-up and account

`lib/dictionaries-auth.ts` and `lib/dictionaries-account.ts` hold the Urdu for the
sign-in, sign-up, verify-email, forgot-password, account and inline-confirm screens.
They are a first translation too. Worth a native read: the plain-language error
messages (`authError.*`, `signup.err.*`), the CNIC and phone hints, and the form
labels (`signup.*`), which should match the terms the mobile app uses for the same
fields. The English-and-Urdu key parity and placeholders are tested in
`test/i18n-auth.test.ts`.
