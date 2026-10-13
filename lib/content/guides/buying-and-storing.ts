import type { Article } from "../types";

export const BUY_DIRECT: Article = {
  slug: "buy-fresh-vegetables-directly-from-farmers-pakistan",
  title: "How to buy fresh vegetables directly from farmers in Pakistan",
  metaTitle: "Buy Fresh Vegetables Directly from Farmers",
  description:
    "A practical guide to buying vegetables and fruit direct from Pakistani farmers: what to check, how pricing and delivery work, and how to avoid common mistakes.",
  category: "Buying",
  publishedAt: "2026-10-12",
  updatedAt: "2026-10-12",
  summary:
    "To buy vegetables directly from a farmer in Pakistan, choose a named farm, confirm the crop, grade and price per unit, agree who handles delivery, and pay through a traceable method. Online platforms such as Farm2Fork bundle these steps and show a delivery quote before you pay.",
  takeaways: [
    "Buy from a named farm so you know the source and can raise a problem with someone specific.",
    "Compare the price per unit including delivery, not only the farm-gate price.",
    "Order produce that is in season; it is fresher and usually cheaper.",
    "Group orders by farm and plan quantities you can store or use within days.",
  ],
  sections: [
    {
      id: "why-direct",
      heading: "Why buy directly from a farm",
      blocks: [
        {
          type: "p",
          text: "Most fresh produce in Pakistan reaches households through several hands: a farmer, a commission agent, a wholesaler at the mandi, a retailer. Each step can add handling time and margin, and the buyer at the end rarely knows which farm the produce came from. Buying directly shortens that chain.",
        },
        {
          type: "p",
          text: "A shorter chain does not automatically mean a lower price. What it reliably gives you is a known source, fewer handling steps between harvest and your kitchen, and a person to ask when something is wrong. The wider supply chain context is covered in [middlemen in Pakistan's produce supply chain](/guides/middlemen-in-pakistan-produce-supply-chain).",
        },
      ],
    },
    {
      id: "what-to-check",
      heading: "What to check before you order",
      blocks: [
        {
          type: "ul",
          items: [
            "**The farm.** Who grows it and where? A named farm with a location is more accountable than an anonymous seller.",
            "**The crop and grade.** A quality grade such as A, B or C tells you how the farmer rates the lot. Ask what the grade means if it is not explained.",
            "**The unit and price.** Check whether the price is per kilogram, per dozen or per piece, then compare like with like.",
            "**Harvest timing.** Leafy vegetables and berries lose quality quickly; ask when the crop was or will be picked.",
            "**Delivery terms.** Who delivers, how far, and what does it cost? Distance-based delivery can outweigh a small price saving.",
          ],
        },
      ],
    },
    {
      id: "steps",
      heading: "How to buy step by step",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Pick what is in season",
              text: "Seasonal crops are fresher and usually cheaper. The [seasonal calendar](/guides/seasonal-fruits-vegetables-pakistan-calendar) shows what to look for each month.",
            },
            {
              title: "Choose a farm and read the listing",
              text: "Confirm the crop, quantity available, unit, grade and pickup location. Farm2Fork shows these on every listing.",
            },
            {
              title: "Group your order sensibly",
              text: "Order only what you can use or store within a few days. If you need several crops, ordering from one farm that grows them saves on delivery.",
            },
            {
              title: "Review the full price",
              text: "Add up item cost, any platform fee and the delivery fee. Farm2Fork lists each line in the quote before you pay.",
            },
            {
              title: "Pay in a traceable way",
              text: "Use a payment method that leaves a record. On Farm2Fork payment is handled on Safepay's hosted checkout.",
            },
            {
              title: "Check on delivery",
              text: "Inspect the produce when it arrives and compare it with the listing. Scanning the order's QR code on Farm2Fork shows the journey so you can see where it was collected and delivered.",
            },
          ],
        },
      ],
    },
    {
      id: "compare",
      heading: "Direct buying compared with the mandi",
      blocks: [
        {
          type: "table",
          caption: "Typical differences between buying direct and buying through a traditional chain",
          headers: ["Factor", "Direct from a farm", "Through the mandi and retail"],
          rows: [
            ["Source", "Named farm", "Often pooled or unknown"],
            ["Handling steps", "Fewer", "Several"],
            ["Price visibility", "Farm price plus fees you can see", "Retail price only"],
            ["Choice", "Limited to what registered farms list", "Wide selection in one place"],
            ["Effort", "Planning ahead, delivery scheduling", "Walk in and choose"],
          ],
        },
        {
          type: "p",
          text: "Neither is always better. Direct buying suits regular, plannable purchases; the mandi suits one-off, wide-ranging shopping.",
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common mistakes to avoid",
      blocks: [
        {
          type: "ul",
          items: [
            "Ordering more than you can store, especially of leafy greens and soft fruit.",
            "Comparing the farm price with a supermarket price without including delivery.",
            "Ignoring the unit, for example comparing a per-dozen price with a per-kilogram one.",
            "Skipping inspection on delivery, which is when problems are easiest to raise.",
          ],
        },
        {
          type: "p",
          text: "Once the produce arrives, [store it correctly](/guides/how-to-store-fresh-produce-after-delivery) to keep it fresh for longer.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Is it cheaper to buy vegetables directly from farmers?",
      a: "Not always. You can avoid some intermediary margins, but delivery and any platform fee are added. Compare the final delivered price per unit, and buy seasonal produce for the best value.",
    },
    {
      q: "How do I know the vegetables are fresh?",
      a: "Ask when the crop was harvested, buy in season, and inspect the produce on arrival. On Farm2Fork you can also scan the order's QR code to see when it was collected and delivered.",
    },
  ],
  related: [
    "seasonal-fruits-vegetables-pakistan-calendar",
    "how-to-store-fresh-produce-after-delivery",
    "what-is-farm-to-fork-traceability",
  ],
};

export const STORE_PRODUCE: Article = {
  slug: "how-to-store-fresh-produce-after-delivery",
  title: "How to store fresh produce after delivery so it lasts longer",
  metaTitle: "How to Store Fresh Produce After Delivery",
  description:
    "Simple, practical rules for storing vegetables and fruit after they arrive: what to refrigerate, what to keep out, and how to cut waste at home.",
  category: "Buying",
  publishedAt: "2026-10-12",
  updatedAt: "2026-10-12",
  summary:
    "Store leafy greens, herbs, carrots and most soft fruit in the refrigerator; keep onions, potatoes, garlic and unripe fruit in a cool, dry, ventilated place; and keep ethylene-producing fruit such as ripe mangoes and bananas away from sensitive vegetables. Wash produce just before use, not before storing.",
  takeaways: [
    "Sort produce on arrival and remove anything damaged; one bad piece spoils its neighbours.",
    "Refrigerate leafy greens, herbs and berries; keep onions and potatoes cool, dry and apart.",
    "Do not wash before storing, because moisture speeds up rot.",
    "Plan meals so the most perishable items are eaten first.",
  ],
  sections: [
    {
      id: "first-hour",
      heading: "The first hour after delivery",
      blocks: [
        {
          type: "p",
          text: "Produce is freshest the day it arrives, so what you do in the first hour decides how long it lasts. Unpack everything, check it against your order, and remove damaged, bruised or mouldy items. Damaged pieces release moisture and spoil the produce around them.",
        },
        {
          type: "p",
          text: "If something is wrong with the order, raise it now. Farm2Fork's order record and QR journey show when and where each handoff happened, which gives you a precise starting point. See [how traceability works](/traceability).",
        },
      ],
    },
    {
      id: "where",
      heading: "Where each kind of produce belongs",
      blocks: [
        {
          type: "table",
          caption: "General storage guide for common produce",
          headers: ["Produce", "Where to keep it", "Notes"],
          rows: [
            ["Spinach, methi, coriander, mint", "Refrigerator", "Wrap loosely in a dry cloth or paper towel inside a container"],
            ["Carrots, radish, turnips", "Refrigerator", "Trim leafy tops; store dry"],
            ["Cauliflower, cabbage", "Refrigerator", "Keep whole until use"],
            ["Tomatoes", "Room temperature, away from sun", "Refrigerate only when fully ripe and to be eaten soon"],
            ["Onions, garlic", "Cool, dry, ventilated spot", "Keep away from potatoes"],
            ["Potatoes", "Cool, dark, dry spot", "Light turns them green; discard green parts"],
            ["Okra, bitter gourd, bottle gourd", "Refrigerator", "Use within a few days"],
            ["Mangoes, bananas, unripe fruit", "Room temperature until ripe", "Then refrigerate ripe mangoes to slow ageing"],
            ["Citrus such as kinnow", "Cool place or refrigerator", "Lasts longest in the refrigerator"],
          ],
        },
      ],
    },
    {
      id: "rules",
      heading: "Five rules that prevent most waste",
      blocks: [
        {
          type: "ol",
          items: [
            "**Wash just before using.** Water left on produce in storage encourages mould.",
            "**Keep ethylene producers apart.** Ripe bananas, mangoes and tomatoes give off ethylene gas, which makes leafy greens and other produce age faster.",
            "**Let air move.** Do not seal produce in airtight bags unless it is very dry; use perforated bags or loosely closed containers.",
            "**Eat the delicate things first.** Leafy greens and soft fruit go before roots and citrus.",
            "**Check every few days.** Remove anything starting to spoil before it spreads.",
          ],
        },
      ],
    },
    {
      id: "plan",
      heading: "Plan orders around storage",
      blocks: [
        {
          type: "p",
          text: "The easiest way to cut waste is to order what you will use. Leafy greens and berries suit small, frequent orders; potatoes, onions and citrus suit larger ones. If you buy from the same farm regularly, a short, regular order is better than a large occasional one. For choosing what to buy each month, see the [seasonal produce calendar](/guides/seasonal-fruits-vegetables-pakistan-calendar).",
        },
        {
          type: "callout",
          title: "A note on food safety",
          text: "These are general household guidelines. If produce smells off, shows mould or is slimy, discard it. Pregnant people, young children and anyone with a weakened immune system should follow local food-safety advice for raw produce.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Should tomatoes go in the refrigerator?",
      a: "Usually not until they are fully ripe. Cold stops unripe tomatoes from developing flavour. Once ripe, refrigerate them only if you will not eat them within a day or two.",
    },
    {
      q: "How long do fresh vegetables last after delivery?",
      a: "Leafy greens last about two to four days, soft vegetables like okra a few days, and roots such as carrots a week or more, depending on freshness at delivery and storage. Check them regularly.",
    },
  ],
  related: [
    "buy-fresh-vegetables-directly-from-farmers-pakistan",
    "seasonal-fruits-vegetables-pakistan-calendar",
    "post-harvest-losses-pakistan-fruit-vegetables",
  ],
};
