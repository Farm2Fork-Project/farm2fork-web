import type { Article } from "../types";

export const MIDDLEMEN: Article = {
  slug: "middlemen-in-pakistan-produce-supply-chain",
  title: "Middlemen in Pakistan's produce supply chain, explained",
  metaTitle: "Middlemen in Pakistan's Produce Chain",
  description:
    "How fresh produce moves from farm to buyer in Pakistan, the role of commission agents and mandis, where farmers lose out, and what direct selling can change.",
  category: "Supply chain",
  publishedAt: "2026-10-12",
  updatedAt: "2026-10-12",
  summary:
    "In Pakistan, fresh produce commonly moves from the farmer through a commission agent (arhti) and wholesale market (mandi) to retailers before it reaches consumers. These intermediaries provide credit, aggregation and logistics, but they can also concentrate market power, which leaves small farmers with limited price visibility. Direct selling changes the information flow more than the physical journey.",
  takeaways: [
    "Intermediaries exist because they solve real problems: credit, aggregation, transport and market access.",
    "The difficulty for small farmers is limited price information and weak bargaining power, not the existence of traders as such.",
    "Direct platforms can add price transparency and a named-buyer relationship, but they still need transport, grading and trust.",
    "Fair outcomes need better information, access to credit and reliable logistics together.",
  ],
  sections: [
    {
      id: "traditional-chain",
      heading: "How produce usually moves today",
      blocks: [
        {
          type: "p",
          text: "A typical fresh produce journey in Pakistan runs from the farm to a commission agent, known as an arhti, who sells the produce at a wholesale market, the mandi. Wholesalers and retailers then buy from the mandi and sell on to households, shops and restaurants. Variations exist for every crop and region, and some produce is sold through contract buyers or processors instead.",
        },
        {
          type: "table",
          caption: "Roles in the traditional chain",
          headers: ["Role", "What they typically do", "Why farmers use them"],
          rows: [
            ["Farmer", "Grows and harvests the crop", "n/a"],
            ["Arhti (commission agent)", "Sells the crop at the mandi for a commission and may advance credit", "Market access, immediate cash, credit"],
            ["Wholesaler", "Buys in volume and redistributes", "n/a"],
            ["Retailer", "Sells to households and businesses", "n/a"],
          ],
        },
      ],
    },
    {
      id: "pain-points",
      heading: "Where small farmers lose out",
      blocks: [
        {
          type: "p",
          text: "The Asian Development Bank has described concentrated market power as one of the structural constraints on Pakistan's fruit and vegetable sector, alongside weak storage, packing and transport. For a smallholder these show up in practical ways.",
        },
        {
          type: "ul",
          items: [
            "**Limited price information.** The farmer may not know what the produce sells for further down the chain.",
            "**Weak bargaining position.** A farmer who has borrowed against the crop has less room to wait for a better price.",
            "**Perishability.** Fresh produce cannot wait, which pushes sellers to accept the first workable offer.",
            "**No credit record.** Without formal records, banks are hard to approach, so informal credit fills the gap.",
          ],
        },
        {
          type: "p",
          text: "Agriculture contributed about 23.5% of GDP in FY2025 and employs roughly 37% of the labour force, per the Pakistan Economic Survey 2024-25, so how these outcomes are shaped affects a very large number of households.",
        },
      ],
    },
    {
      id: "fair",
      heading: "A fair view of intermediaries",
      blocks: [
        {
          type: "p",
          text: "It would be wrong to treat every trader as exploitative. Many arhtis provide credit when no bank will, aggregate small lots into marketable quantities, and carry the risk of unsold produce. Any alternative has to replace those services, not just remove the person who performs them.",
        },
      ],
    },
    {
      id: "direct",
      heading: "What direct selling changes",
      blocks: [
        {
          type: "table",
          caption: "What a direct platform can and cannot change",
          headers: ["Problem", "How a direct platform can help", "Still needed"],
          rows: [
            ["Price visibility", "Farmers see and set the price buyers see", "Good market information"],
            ["Bargaining power", "Farmers can choose between buyers", "Enough buyer demand"],
            ["Transport", "Delivery partners are matched to orders", "Reliable roads and drivers"],
            ["Trust in quality", "Grades and traceable records", "Honest grading and inspection"],
            ["Credit", "Order history and loan applications", "Lenders willing to say yes"],
          ],
        },
        {
          type: "p",
          text: "Farm2Fork is built around that table. Farmers set prices, orders are tied to named farms, delivery is handled by claimed transport jobs, and a loan application route is provided for farmers. It is a pilot, so these are goals being tested rather than proven results. See [how it works](/how-it-works).",
        },
      ],
    },
    {
      id: "for-buyers",
      heading: "What this means for buyers",
      blocks: [
        {
          type: "p",
          text: "If you buy directly, you gain a known source and fewer handoffs, and you take on some of the planning the mandi does for you. The [buying guide](/guides/buy-fresh-vegetables-directly-from-farmers-pakistan) explains how to do that sensibly.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "What is an arhti?",
      a: "An arhti is a commission agent at a Pakistani wholesale market (mandi) who sells a farmer's produce to buyers in return for a commission, and often advances money or inputs to farmers against the crop.",
    },
    {
      q: "Does selling directly mean farmers always earn more?",
      a: "Not automatically. Direct selling can remove some intermediary margins and gives farmers price visibility, but farmers also take on tasks such as grading and arranging transport, which platforms try to support.",
    },
  ],
  sources: [
    {
      label: "Pakistan's fruit and vegetable sector underperforming due to various constraints: ADB (ProPakistani)",
      url: "https://propakistani.pk/2022/11/30/pakistans-fruit-and-vegetable-sector-underperforming-due-to-various-constraints-adb/",
    },
    {
      label: "Pakistan Economic Survey 2024-25, Agriculture chapter",
      url: "https://www.finance.gov.pk/survey/chapter_25/2_Agriculture.pdf",
    },
  ],
  related: [
    "post-harvest-losses-pakistan-fruit-vegetables",
    "how-farmers-sell-produce-online-pakistan",
    "what-is-farm-to-fork-traceability",
  ],
};

export const POST_HARVEST: Article = {
  slug: "post-harvest-losses-pakistan-fruit-vegetables",
  title: "Post-harvest losses in Pakistan: why so much produce never reaches the plate",
  metaTitle: "Post-Harvest Losses in Pakistan Explained",
  description:
    "Pakistan loses an estimated 20% to 40% of its fruit and vegetables after harvest. Here are the causes, the crop-level figures, and the practical fixes.",
  category: "Supply chain",
  publishedAt: "2026-10-12",
  updatedAt: "2026-10-12",
  summary:
    "Post-harvest losses of fruit and vegetables in Pakistan are commonly estimated at 20% to 40%, according to the Pakistan Economic Survey 2025-26. Causes include manual and improper handling, weak grading and packing, limited cold storage, poor farm-to-market roads and slow transport. Better handling, packing and shorter, tracked journeys reduce the losses.",
  takeaways: [
    "Estimates vary by crop, region and year, but 20% to 40% is the range cited in the 2025-26 Economic Survey.",
    "An ADB report put losses at 25% for apples, 20% for potatoes and 15% for chillies.",
    "Most losses happen between harvest and sale, through handling, packing, storage and transport.",
    "Shorter chains and better data on transit time help to find where freshness is lost.",
  ],
  sections: [
    {
      id: "scale",
      heading: "How big is the problem",
      blocks: [
        {
          type: "p",
          text: "Post-harvest loss is produce that is grown but never eaten, because it spoils, is damaged or is rejected somewhere between the field and the buyer. The Pakistan Economic Survey 2025-26, as reported by FreshPlaza, estimates post-harvest losses of fruit and vegetable crops at 20% to 40%. Earlier research cited by Geo News put the figure at about 35% to 40%. The range is wide because losses depend on the crop, the season, the region and how each study measured them.",
        },
        {
          type: "p",
          text: "Crop-level figures are easier to pin down. A report by the Asian Development Bank, covered by ProPakistani in 2022, found losses of about 25% for apples, 20% for potatoes and 15% for chillies.",
        },
        {
          type: "table",
          caption: "Reported post-harvest loss estimates",
          headers: ["Crop or group", "Estimated loss", "Source"],
          rows: [
            ["Fruit and vegetables (overall)", "20% to 40%", "Pakistan Economic Survey 2025-26, via FreshPlaza"],
            ["Apples", "About 25%", "ADB, via ProPakistani"],
            ["Potatoes", "About 20%", "ADB, via ProPakistani"],
            ["Chillies", "About 15%", "ADB, via ProPakistani"],
          ],
        },
      ],
    },
    {
      id: "causes",
      heading: "Why the losses happen",
      blocks: [
        {
          type: "p",
          text: "The ADB attributed losses mainly to manual and improper post-harvest management and named several farm-level causes:",
        },
        {
          type: "ul",
          items: [
            "Poor harvesting and packing practices that bruise or crush produce.",
            "Inadequate grading, so damaged items travel with sound ones.",
            "Limited cold storage, and unreliable electricity that undermines the cold storage that exists.",
            "Poor, narrow roads linking farms to urban markets.",
            "Inefficient transport, including long waits and multiple handoffs.",
            "A lack of good-quality packaging, such as corrugated boxes.",
          ],
        },
      ],
    },
    {
      id: "fixes",
      heading: "What helps",
      blocks: [
        {
          type: "p",
          text: "No single fix removes the problem, but the same measures recur across the evidence:",
        },
        {
          type: "ol",
          items: [
            "**Better handling and packing at the farm,** using crates and boxes rather than bulk piling.",
            "**Grading at the source,** so damaged produce is sold or used separately.",
            "**Shorter chains.** Fewer handoffs mean less time and less rough handling.",
            "**Cold chain access,** especially for perishable fruit and leafy vegetables.",
            "**Data on where time is lost.** If delivery steps are recorded, slow steps become visible.",
          ],
        },
      ],
    },
    {
      id: "farm2fork",
      heading: "Where Farm2Fork fits",
      blocks: [
        {
          type: "p",
          text: "Farm2Fork cannot build cold storage or roads. What it can do is shorten the chain by letting a farmer sell straight to a named buyer, record collection, transit and delivery so slow steps are visible, and give each listing a quality grade. Whether that reduces losses is something a pilot has to demonstrate, not assume. See [traceability](/traceability) for what is recorded.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "How much food does Pakistan lose after harvest?",
      a: "Estimates for fruit and vegetables range from about 20% to 40%, according to the Pakistan Economic Survey 2025-26. Individual crops and studies differ, so treat the figure as a range rather than an exact number.",
    },
    {
      q: "What is the main cause of post-harvest loss?",
      a: "No single cause dominates. The ADB points to manual and improper post-harvest practices, inadequate grading and packing, limited cold storage, and poor roads and transport together.",
    },
  ],
  sources: [
    {
      label: "Water scarcity and post-harvest losses pressure Pakistan's produce sector (FreshPlaza)",
      url: "https://www.freshplaza.com/asia/article/9847999/water-scarcity-and-post-harvest-losses-pressure-pakistan-s-produce-sector/",
    },
    {
      label: "Pakistan faces 40% post-harvest losses due to cold storage gap (FreshPlaza)",
      url: "https://www.freshplaza.com/north-america/article/9822648/pakistan-faces-40-post-harvest-losses-due-to-cold-storage-gap/",
    },
    {
      label: "Vanishing harvest (Geo News)",
      url: "https://www.geo.tv/latest/631222-vanishing-harvest",
    },
    {
      label: "Pakistan's fruit and vegetable sector underperforming due to various constraints: ADB (ProPakistani)",
      url: "https://propakistani.pk/2022/11/30/pakistans-fruit-and-vegetable-sector-underperforming-due-to-various-constraints-adb/",
    },
  ],
  related: [
    "middlemen-in-pakistan-produce-supply-chain",
    "how-to-store-fresh-produce-after-delivery",
    "what-is-farm-to-fork-traceability",
  ],
};
