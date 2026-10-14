"use client";
import { useLanguage } from "@/components/LanguageContext";
const ur: Record<string, string> = {
  pending: "زیر التوا",
  paid: "ادا شدہ",
  processing: "تیاری جاری",
  shipped: "روانہ ہو گیا",
  delivered: "پہنچا دیا گیا",
  cancelled: "منسوخ",
  success: "ادا شدہ",
  failed: "ناکام",
  refunded: "رقم واپس",
  "not initiated": "شروع نہیں ہوئی",
  "Status unavailable \u2014 refresh to retry":
    "صورتحال دستیاب نہیں — دوبارہ تازہ کریں",
  "not specified": "درج نہیں",

  "Cancel order": "آرڈر منسوخ کریں",
  "Cancel this unpaid order?": "یہ غیر ادا شدہ آرڈر منسوخ کریں؟",
  "Loading your buyer account…": "آپ کا خریدار اکاؤنٹ لوڈ ہو رہا ہے…",
  "We could not load your buyer account.":
    "آپ کا خریدار اکاؤنٹ لوڈ نہیں ہو سکا۔",
  "Return to sign in": "دوبارہ سائن ان کریں",
  "Buyer navigation": "خریدار کی رہنمائی",
  "Your account and profile": "آپ کا اکاؤنٹ اور پروفائل",
  Marketplace: "مارکیٹ",
  Orders: "آرڈرز",
  Trace: "پیداوار کا سفر",
  Community: "کمیونٹی",
  "Your cart": "آپ کی ٹوکری",
  "View cart": "ٹوکری دیکھیں",
  Dismiss: "بند کریں",
  "Dismiss message": "پیغام بند کریں",
  "Back to marketplace": "مارکیٹ میں واپس جائیں",
  "Loading product details…": "پیداوار کی تفصیلات لوڈ ہو رہی ہیں…",
  "Add to cart": "ٹوکری میں شامل کریں",
  "Search products": "پیداوار تلاش کریں",
  Category: "قسم",
  "All categories": "تمام اقسام",
  Vegetables: "سبزیاں",
  Fruits: "پھل",
  Grains: "اناج",
  Dairy: "دودھ کی مصنوعات",
  "Loading products…": "پیداوار لوڈ ہو رہی ہے…",
  "No products found": "کوئی پیداوار نہیں ملی",
  "Try another search or category.": "دوسرے الفاظ یا قسم سے تلاش کریں۔",
  "Clear filters": "تلاش اور قسم صاف کریں",
  Previous: "پچھلا",
  Next: "اگلا",
  "Try again": "دوبارہ کوشش کریں",
  "Continue shopping": "خریداری جاری رکھیں",
  Remove: "ہٹائیں",
  "Items subtotal": "پیداوار کی قیمت",
  "Review your items, then add delivery details to place your order.":
    "اپنی پیداوار دیکھیں، پھر آرڈر کے لیے ڈیلیوری کی تفصیلات درج کریں۔",
  "Refresh payment status": "ادائیگی کی صورتحال تازہ کریں",
  "Refreshing…": "تازہ ہو رہا ہے…",
  "Track payment and delivery for every order you have placed.":
    "ہر آرڈر کی ادائیگی اور ڈیلیوری کی صورتحال دیکھیں۔",
  "Loading orders and payments…": "آرڈرز اور ادائیگیاں لوڈ ہو رہی ہیں…",
  "No orders yet": "ابھی کوئی آرڈر نہیں",
  "Orders you place from the marketplace show up here with live payment and delivery status.":
    "مارکیٹ میں دیے گئے آرڈرز کی ادائیگی اور ڈیلیوری کی تازہ صورتحال یہاں نظر آئے گی۔",
  "Browse the marketplace": "مارکیٹ دیکھیں",
  "Grand total": "کل رقم",
  "Preparing checkout…": "ادائیگی کا صفحہ تیار ہو رہا ہے…",
  "Continue payment": "ادائیگی جاری رکھیں",
  "Open Safepay checkout": "Safepay پر ادائیگی کھولیں",
  "Checkout was closed. Your saved orders remain available below.":
    "ادائیگی کا صفحہ بند ہو گیا۔ آپ کے محفوظ آرڈرز نیچے موجود ہیں۔",
  "You returned from checkout. Payment status below comes from the server; confirmation may take a moment.":
    "آپ ادائیگی سے واپس آئے ہیں۔ نیچے سرور کی تصدیق شدہ صورتحال ہے؛ تصدیق میں کچھ وقت لگ سکتا ہے۔",
  Checkout: "آرڈر مکمل کریں",
  "Order placed": "آرڈر محفوظ ہو گیا",
  "Your payment is confirmed.": "آپ کی ادائیگی کی تصدیق ہو گئی۔",
  "View orders": "آرڈرز دیکھیں",
  "Your cart is empty": "آپ کی ٹوکری خالی ہے",
  "Add products from the marketplace to start an order.":
    "آرڈر کے لیے مارکیٹ سے پیداوار شامل کریں۔",
  "Placing order…": "آرڈر محفوظ ہو رہا ہے…",
  "Add your delivery details, place the order, then pay securely on Safepay.":
    "ڈیلیوری کی تفصیلات درج کریں، آرڈر دیں، پھر Safepay پر محفوظ ادائیگی کریں۔",
  "1. Delivery address": "۱۔ ڈیلیوری کا پتہ",
  Street: "گلی اور مکان",
  City: "شہر",
  Province: "صوبہ",
  "Select province": "صوبہ منتخب کریں",
  "ZIP code (optional)": "پوسٹل کوڈ (اختیاری)",
  "2. Drop-off location": "۲۔ ڈیلیوری کی جگہ",
  "Pin where the delivery should arrive. The delivery fee is calculated from this pin.":
    "ڈیلیوری کی جگہ کا پن لگائیں۔ اسی سے ڈیلیوری فیس حساب ہوگی۔",
  "Pin the drop-off to see the delivery fee":
    "ڈیلیوری فیس کے لیے جگہ کا پن لگائیں",
  "Calculating delivery…": "ڈیلیوری فیس حساب ہو رہی ہے…",
  "Could not calculate this order. Check availability and the delivery pin, then retry.":
    "آرڈر کی رقم حساب نہیں ہو سکی۔ دستیابی اور ڈیلیوری کا پن چیک کر کے دوبارہ کوشش کریں۔",
  "Retry delivery quotes": "ڈیلیوری فیس دوبارہ حساب کریں",
  Items: "پیداوار",
  "Service fee": "سروس فیس",
  "Order total": "آرڈر کی کل رقم",
  "4. Payment": "۴۔ ادائیگی",
  "Payment method": "ادائیگی کا طریقہ",
  "Wait for a delivery quote for every farmer before placing orders.":
    "آرڈر دینے سے پہلے ہر فارم کی ڈیلیوری فیس کا انتظار کریں۔",
  "Pin the drop-off location on the map first; the delivery fee is priced from it.":
    "پہلے نقشے پر ڈیلیوری کی جگہ کا پن لگائیں؛ اسی سے ڈیلیوری فیس طے ہوگی۔",
  Paid: "ادا شدہ",
  "Awaiting payment": "ادائیگی کا انتظار",
  "Payment failed": "ادائیگی ناکام",
  Refunded: "رقم واپس ہو گئی",
  "Payment not started": "ادائیگی شروع نہیں ہوئی",
  "Cart updated. Review quantities in Your cart.":
    "ٹوکری تازہ ہو گئی۔ مقدار اپنی ٹوکری میں دیکھیں۔",
  "Available stock is already in your cart.":
    "تمام دستیاب مقدار آپ کی ٹوکری میں ہے۔",
  "Cart ({count})": "ٹوکری ({count})",
  "Page {page} of {total}": "صفحہ {page} از {total}",
  "Add {name} to cart": "{name} ٹوکری میں شامل کریں",
  "Increase {name} quantity": "{name} کی مقدار بڑھائیں",
  "Decrease {name} quantity": "{name} کی مقدار کم کریں",
  "{name} quantity": "{name} کی مقدار",
  "Remove {name}": "{name} ہٹائیں",
  "Quantity for {name}": "{name} کی مقدار",
  "{count} orders placed": "{count} آرڈرز محفوظ ہو گئے",
  "Place order": "آرڈر دیں",
  "Place {count} orders": "{count} آرڈرز دیں",
  "{quantity} {unit} available": "{quantity} {unit} دستیاب",
  "Grade {grade}": "گریڈ {grade}",
  "Your order is saved but not confirmed yet. Pay now to confirm it. Payment opens on Safepay's secure page.":
    "آپ کا آرڈر محفوظ ہے لیکن ابھی تصدیق نہیں ہوئی۔ تصدیق کے لیے ادائیگی کریں۔ Safepay کا محفوظ ادائیگی صفحہ کھلے گا۔",
  "Your orders are saved but not confirmed yet. Pay for each one to confirm it. Payment opens on Safepay's secure page.":
    "آپ کے آرڈرز محفوظ ہیں لیکن ابھی تصدیق نہیں ہوئی۔ ہر آرڈر کی ادائیگی کریں۔ Safepay کا محفوظ ادائیگی صفحہ کھلے گا۔",
  "We couldn't open payment for this order. Open Orders and choose Pay to try again.":
    "اس آرڈر کی ادائیگی نہیں کھل سکی۔ آرڈرز میں جائیں اور دوبارہ ادائیگی کریں۔",
  "You'll pay on Safepay's secure page with a card or mobile wallet. Farm2Fork never sees your card details.":
    "آپ Safepay کے محفوظ صفحے پر کارڈ یا موبائل والٹ سے ادائیگی کریں گے۔ Farm2Fork کو آپ کے کارڈ کی تفصیلات نہیں ملتیں۔",
  "Next, you'll pay for each order on Safepay. An order isn't confirmed until it's paid.":
    "اس کے بعد Safepay پر ہر آرڈر کی ادائیگی کریں۔ ادائیگی کے بعد آرڈر کی تصدیق ہوگی۔",
  "Next, you'll pay on Safepay. Your order isn't confirmed until it's paid.":
    "اس کے بعد Safepay پر ادائیگی کریں۔ ادائیگی کے بعد آرڈر کی تصدیق ہوگی۔",
  "Your items come from {count} farms, so they're placed as separate orders. You pay for each one.":
    "آپ کی پیداوار {count} فارموں سے ہے، اس لیے الگ آرڈر ہوں گے۔ ہر آرڈر کی الگ ادائیگی ہوگی۔",
  "Your items come from {count} farms, so you'll place {count} orders and pay for each one.":
    "آپ کی پیداوار {count} فارموں سے ہے، اس لیے {count} آرڈر دیں گے اور ہر ایک کی الگ ادائیگی کریں گے۔",
  "Total for all {count} orders": "تمام {count} آرڈرز کی کل رقم",
  "Delivery ({distance} km)": "ڈیلیوری ({distance} کلومیٹر)",
  "Payment: {status}": "ادائیگی: {status}",
  "Order {id}": "آرڈر {id}",
  "3. Your order": "۳۔ آپ کا آرڈر",
  "3. Your orders": "۳۔ آپ کے آرڈرز",
  "Pay{amount} on Safepay": "Safepay پر{amount} ادا کریں",
  "Pay{amount} to {farm}": "{farm} کو{amount} ادا کریں",
};
export function useBuyerCopy() {
  const { language } = useLanguage();
  return (text: string, values: Record<string, string | number> = {}) => {
    let result = language === "ur" ? (ur[text] ?? text) : text;
    for (const [key, value] of Object.entries(values))
      result = result.replaceAll(`{${key}}`, String(value));
    return result;
  };
}
