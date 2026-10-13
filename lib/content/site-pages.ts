import type { ContentPageData } from "./types";

export const HOW_IT_WORKS: ContentPageData = {
  path: "/how-it-works",
  eyebrow: "How it works",
  h1: "How Farm2Fork works, from farm listing to delivery",
  lead: "Farm2Fork lets a farmer list produce at a price they choose, lets a buyer order it directly from that farm, assigns a transport partner to deliver it, and records each step so the buyer can verify the journey with a QR code. There is no wholesale middleman in the chain.",
  sections: [
    {
      id: "five-steps",
      heading: "The five steps of a Farm2Fork order",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "A farmer lists what is ready",
              text: "The farmer adds the crop, quantity, unit, quality grade and price per unit, and the farm's pickup location. Each listing is tied to one registered farm.",
            },
            {
              title: "A buyer builds a cart",
              text: "Buyers browse listings, read the farm and quality details, and add produce to a cart. The cart groups items by farmer, so every order belongs to exactly one farm.",
            },
            {
              title: "The buyer reviews a delivery quote and pays",
              text: "After entering a delivery location the buyer sees the item total, the platform fee, an estimated distance, the delivery fee and the grand total. Payment is made on Safepay's hosted checkout page.",
            },
            {
              title: "A transport partner delivers",
              text: "Transport partners claim open deliveries, collect the order from the farm's pickup location, and update the shipment status until it reaches the buyer.",
            },
            {
              title: "The journey can be verified",
              text: "Farm details, collection, transit and delivery each create a record. The buyer scans the order's QR code to see the journey that record describes.",
            },
          ],
        },
      ],
    },
    {
      id: "what-farmers-do",
      heading: "What the farmer does",
      blocks: [
        {
          type: "p",
          text: "Farmers register with a CNIC and a mapped farm location, then manage everything from one dashboard: creating listings, accepting and tracking orders, reading the community feed, and applying for financing. Prices are set by the farmer. Farm2Fork is building an AI price advisor to suggest a fair range, but the model is still in development, so it supports the decision rather than replacing it.",
        },
        {
          type: "p",
          text: "Read more on the [farmers page](/for-farmers), or follow the practical walkthrough in [how farmers sell produce online in Pakistan](/guides/how-farmers-sell-produce-online-pakistan).",
        },
      ],
    },
    {
      id: "what-buyers-do",
      heading: "What the buyer does",
      blocks: [
        {
          type: "p",
          text: "Buyers register as an individual, retailer, restaurant or wholesaler, with a CNIC and, for businesses, a business name. Because each order is tied to a named farm, buyers know who grew the produce and where to collect it from. Pricing is visible before payment, and the status of each order and payment stays in the Orders view.",
        },
        {
          type: "p",
          text: "Read more on the [buyers page](/for-buyers), or see [how to buy fresh vegetables directly from farmers in Pakistan](/guides/buy-fresh-vegetables-directly-from-farmers-pakistan).",
        },
      ],
    },
    {
      id: "what-transporters-do",
      heading: "What the transport partner does",
      blocks: [
        {
          type: "p",
          text: "Transport partners publish when they are available, claim deliveries they can complete, and move each shipment through its statuses. Every update is visible to the buyer and farmer, so no one has to phone around to find out where an order is. Details are on the [transport partners page](/for-transporters).",
        },
      ],
    },
    {
      id: "what-is-recorded",
      heading: "What gets recorded along the way",
      blocks: [
        {
          type: "table",
          caption: "Supply chain events and who creates them",
          headers: ["Stage", "What is recorded", "Who records it"],
          rows: [
            ["Listing", "Crop, quantity, grade, farm identity", "Farmer"],
            ["Order", "Buyer, farm, items, agreed price", "Platform"],
            ["Collection", "Pickup from the farm's location", "Transport partner"],
            ["In transit", "Shipment status updates", "Transport partner"],
            ["Delivery", "Handover to the buyer", "Transport partner"],
          ],
        },
        {
          type: "p",
          text: "These events are written to a Hyperledger Fabric ledger. [How traceability works](/traceability) explains what that does and does not prove.",
        },
      ],
    },
    {
      id: "status",
      heading: "What is live today",
      blocks: [
        {
          type: "callout",
          title: "Pilot status",
          text: "Farm2Fork is a final year project at the University of Central Punjab and is being rolled out in stages. Buyer, farmer and transporter onboarding, the marketplace, farmer-grouped checkout and shipment tracking are built. Payment integration and the AI price advisor are still being tested or trained, so features can change. See the [About page](/about) for details.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Do I need an account to browse?",
      a: "You can read all public pages without an account. Browsing live listings, ordering, and scanning journeys require a free account for your role.",
    },
    {
      q: "What happens if a farmer cannot fill an order?",
      a: "Every order is tied to one farmer and to the quantity in their listing. The order's status in the Orders view shows where it stands, and payment is only completed on Safepay's checkout page, so creating an order alone does not take money.",
    },
  ],
  howTo: {
    sectionId: "five-steps",
    name: "How a Farm2Fork order works",
    description: "The five steps from a farmer listing produce to a buyer verifying its delivery on Farm2Fork.",
  },
  cta: {
    title: "See it for yourself",
    text: "Create a free account for the role that fits you and walk through the flow.",
    primary: { label: "Choose your role", href: "/signup" },
    secondary: { label: "Read the FAQ", href: "/faq" },
  },
  related: ["/traceability", "/for-farmers", "/for-buyers", "/faq"],
};

export const TRACEABILITY: ContentPageData = {
  path: "/traceability",
  eyebrow: "Traceability",
  h1: "Food traceability with QR codes and blockchain, explained",
  lead: "Food traceability means being able to follow a product through every stage from farm to buyer. Farm2Fork records each stage on a Hyperledger Fabric ledger and gives every order a QR code, so a buyer can scan it and see the farm record, collection, transport and delivery steps.",
  sections: [
    {
      id: "why",
      heading: "Why traceability matters for fresh produce",
      blocks: [
        {
          type: "p",
          text: "When produce passes through several traders before it reaches a shop, the buyer often cannot tell which farm it came from, when it was picked, or how it travelled. That makes it hard to trust quality claims, hard to find the source of a problem, and hard for good farmers to be recognised for good produce.",
        },
        {
          type: "p",
          text: "Traceability answers three practical questions: where did this come from, who handled it, and what happened between harvest and delivery. For the wider picture, read [what farm-to-fork traceability is](/guides/what-is-farm-to-fork-traceability).",
        },
      ],
    },
    {
      id: "how-verify",
      heading: "How to verify produce with a QR code",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Order from a named farm",
              text: "Every Farm2Fork order is tied to a single farmer, so the origin is known from the start.",
            },
            {
              title: "Open the scan screen",
              text: "In the Farm2Fork app, open the scan option and point the camera at the order's QR code.",
            },
            {
              title: "Read the journey",
              text: "The app shows the farm record, then collection, transit and delivery in order, each with the participant who recorded it.",
            },
            {
              title: "Compare it with what arrived",
              text: "Check that the produce, quantity and delivery match the record. If something is off, the record gives you a precise starting point for a complaint.",
            },
          ],
        },
      ],
    },
    {
      id: "what-recorded",
      heading: "What Farm2Fork records",
      blocks: [
        {
          type: "ul",
          items: [
            "**Farm record:** the farm, crop, quantity and quality grade at listing time.",
            "**Order:** the buyer, the farm and the agreed items.",
            "**Collection and transit:** shipment status updates from the transport partner.",
            "**Delivery:** the final handover to the buyer.",
          ],
        },
      ],
    },
    {
      id: "blockchain",
      heading: "Why Hyperledger Fabric",
      blocks: [
        {
          type: "p",
          text: "Hyperledger Fabric is a permissioned blockchain framework hosted by the Linux Foundation. In a permissioned network only identified participants can write records, and the history cannot be quietly edited afterwards. That suits a supply chain where the farmers, carriers and platform are known parties, and it avoids the energy cost and public exposure of an open blockchain.",
        },
        {
          type: "p",
          text: "A technical explanation is in [how blockchain food traceability works](/guides/how-blockchain-food-traceability-works).",
        },
      ],
    },
    {
      id: "limits",
      heading: "What blockchain traceability cannot prove",
      blocks: [
        {
          type: "callout",
          title: "An honest limit",
          text: "A ledger can show that a record was written at a certain time and has not changed since. It cannot prove that the original entry was true. A farmer could mislabel a crop, and a driver could mark a delivery early. Farm2Fork reduces that risk by tying every record to a registered participant, recording quality grades and handoffs separately, and keeping the history auditable, but traceability supports trust; it does not replace inspection or food-safety testing.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Do I need to understand blockchain to use traceability?",
      a: "No. You scan a QR code and read the journey on screen. The ledger works in the background to keep the record from being altered.",
    },
    {
      q: "Is the traceability record public?",
      a: "Records are written to a permissioned ledger, so only approved participants can write to it. Buyers see the journey of the orders they placed through the app rather than a public blockchain explorer.",
    },
  ],
  howTo: {
    sectionId: "how-verify",
    name: "How to verify produce with a Farm2Fork QR code",
    description: "Steps for checking where a Farm2Fork order came from by scanning its QR code.",
  },
  cta: {
    title: "Trace your first order",
    text: "Create a buyer account, place an order from a named farm, and scan its QR code.",
    primary: { label: "Create a buyer account", href: "/signup" },
    secondary: { label: "How it works", href: "/how-it-works" },
  },
  related: ["/how-it-works", "/glossary", "/faq", "/for-buyers"],
};

export const FOR_FARMERS: ContentPageData = {
  path: "/for-farmers",
  eyebrow: "For farmers",
  h1: "Sell your produce directly to buyers across Pakistan",
  lead: "Farm2Fork lets farmers list produce at their own price, receive orders directly from buyers, and hand deliveries to transport partners without a wholesale middleman in between. Farmers also get order management, a community feed and a route to apply for financing.",
  sections: [
    {
      id: "benefits",
      heading: "What farmers get",
      blocks: [
        {
          type: "ul",
          items: [
            "**Your price, in the open.** You set the price per kilogram, ton, dozen, piece or litre, and buyers see it before ordering.",
            "**Orders from named buyers.** Each order comes from a registered buyer and is tied to your farm, so your name travels with your produce.",
            "**Transport arranged for you.** Delivery partners claim the shipment from your farm's pickup location; you do not need your own vehicle.",
            "**One dashboard.** Create listings, track orders and read the farmer community feed in the same place.",
            "**A route to financing.** Submit a loan application inside the platform for review by a financial partner.",
          ],
        },
      ],
    },
    {
      id: "get-started",
      heading: "How to start selling",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Register as a farmer",
              text: "Choose the farmer role and enter your details, including a valid Pakistani CNIC and a working email address.",
            },
            {
              title: "Mark your farm on the map",
              text: "Add your farm's address, city, province and map location. Buyers and transport partners use it to plan pickup and price delivery.",
            },
            {
              title: "Create a listing",
              text: "Choose the crop, quantity, unit and price, and set the quality grade honestly. Clear, accurate listings sell better and keep your record clean.",
            },
            {
              title: "Fulfil orders",
              text: "Accept orders, prepare them for collection, and watch the delivery status until the buyer receives them.",
            },
          ],
        },
      ],
    },
    {
      id: "pricing",
      heading: "Pricing guidance",
      blocks: [
        {
          type: "p",
          text: "Farm2Fork is building an AI service that estimates a fair price range from the crop, quantity, location and season, with a confidence score. The model is still in development, so today the price is entirely yours to set. A practical method for choosing it is in [how farmers sell produce online in Pakistan](/guides/how-farmers-sell-produce-online-pakistan).",
        },
      ],
    },
    {
      id: "loans",
      heading: "Applying for financing",
      blocks: [
        {
          type: "p",
          text: "Smallholders often lack the formal records that banks ask for. Farm2Fork gives farmers a place to submit a loan application that a financial partner reviews, and the farmer's order history on the platform can add context. Approval is the partner's decision and is never guaranteed.",
        },
      ],
    },
    {
      id: "cost",
      heading: "What it costs",
      blocks: [
        {
          type: "p",
          text: "Registration is free. Orders carry a percentage-based platform fee, and delivery is priced by estimated distance. Both appear as itemised lines in the buyer's quote before payment.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Do I need a smartphone?",
      a: "You need a device with a browser or the Farm2Fork Android app and an email address. Urdu and English are both supported on the screens farmers use.",
    },
    {
      q: "Can I sell if I farm only a small plot?",
      a: "Yes. Listings are by quantity and unit, so a small harvest can be listed as long as you can fill the orders you accept.",
    },
  ],
  howTo: {
    sectionId: "get-started",
    name: "How to start selling produce on Farm2Fork",
    description: "Steps for a farmer to register, add their farm location and publish a first listing.",
  },
  cta: {
    title: "Ready to list your first harvest?",
    text: "Create a farmer account with your CNIC and farm location.",
    primary: { label: "Sign up as a farmer", href: "/signup/farmer" },
    secondary: { label: "How it works", href: "/how-it-works" },
  },
  related: ["/how-it-works", "/faq", "/guides", "/for-transporters"],
};

export const FOR_BUYERS: ContentPageData = {
  path: "/for-buyers",
  eyebrow: "For buyers",
  h1: "Buy fresh produce direct from Pakistani farms",
  lead: "Farm2Fork lets individuals, restaurants, retailers and wholesalers order produce directly from named farms. You see the farm, the quality grade and the price before you pay, get a delivery quote up front, and can scan a QR code to check the produce's journey from farm to doorstep.",
  sections: [
    {
      id: "why",
      heading: "Why buy directly from the farm",
      blocks: [
        {
          type: "ul",
          items: [
            "**Know the source.** Each order is tied to a single farm, not a pooled mandi lot.",
            "**See the price build-up.** Item total, platform fee, delivery fee and grand total are listed before you pay.",
            "**Follow the order.** Order and payment statuses stay visible in your Orders view.",
            "**Verify the journey.** Scan the QR code to see collection, transit and delivery records.",
          ],
        },
        {
          type: "p",
          text: "For a step-by-step walkthrough, read [how to buy fresh vegetables directly from farmers in Pakistan](/guides/buy-fresh-vegetables-directly-from-farmers-pakistan).",
        },
      ],
    },
    {
      id: "how",
      heading: "How buying works",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Create a buyer account",
              text: "Sign up with email or Google, choose your buyer type (individual, retailer, restaurant or wholesaler), enter your CNIC, and verify your email address.",
            },
            {
              title: "Browse and add to cart",
              text: "Search listings, check the farm and grade, and add what you need. Items are grouped by farmer.",
            },
            {
              title: "Get a quote",
              text: "Enter your delivery location in Pakistan and review the quote for each farm's order.",
            },
            {
              title: "Pay and track",
              text: "Pay through Safepay's hosted checkout, then follow the order until it is delivered.",
            },
          ],
        },
      ],
    },
    {
      id: "who",
      heading: "Who buys on Farm2Fork",
      blocks: [
        {
          type: "p",
          text: "Households can order weekly vegetables and fruit in season; restaurants and retailers can source from farms they come to know. The [seasonal produce guide](/guides/seasonal-fruits-vegetables-pakistan-calendar) shows what is usually available month by month, and [how to store fresh produce after delivery](/guides/how-to-store-fresh-produce-after-delivery) helps it last.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Can I return produce?",
      a: "Farm2Fork does not yet publish a returns policy because the platform is in pilot. If an order arrives wrong or damaged, its journey record shows exactly which step to question.",
    },
  ],
  howTo: {
    sectionId: "how",
    name: "How to buy produce on Farm2Fork",
    description: "Steps for a buyer to create an account, build a cart, review a quote and pay.",
  },
  cta: {
    title: "Order from a farm near you",
    text: "Create a free buyer account and browse current listings.",
    primary: { label: "Create a buyer account", href: "/signup" },
    secondary: { label: "Read the buying guide", href: "/guides/buy-fresh-vegetables-directly-from-farmers-pakistan" },
  },
  related: ["/how-it-works", "/traceability", "/faq", "/guides"],
};

export const FOR_TRANSPORTERS: ContentPageData = {
  path: "/for-transporters",
  eyebrow: "For transport partners",
  h1: "Delivery work for transport partners moving farm produce",
  lead: "Farm2Fork transport partners claim open deliveries, collect orders from farms, and update each shipment's status until the buyer receives it. Delivery is priced by estimated distance, and every step is recorded so farmers and buyers can follow along.",
  sections: [
    {
      id: "work",
      heading: "How delivery work runs",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Register as a transporter",
              text: "Choose the transporter role and complete the onboarding form.",
            },
            {
              title: "Set your availability",
              text: "Tell the platform when you can take deliveries so you see work that fits your schedule.",
            },
            {
              title: "Claim a delivery",
              text: "Open deliveries list the pickup and drop-off locations and the distance. Claim the ones you can finish.",
            },
            {
              title: "Update every step",
              text: "Mark collection, transit and delivery as they happen. Each update becomes part of the order's traceable journey.",
            },
          ],
        },
      ],
    },
    {
      id: "why",
      heading: "Why accurate status updates matter",
      blocks: [
        {
          type: "p",
          text: "Fresh produce is time sensitive, and a clear record of when it was collected and delivered protects you as much as the buyer. Your updates are what make the QR journey meaningful, which is explained on the [traceability page](/traceability).",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "How are delivery fees set?",
      a: "Delivery fees are priced from the estimated distance between the farm's pickup location and the buyer's address, and are shown to the buyer in their quote.",
    },
  ],
  cta: {
    title: "Join as a transport partner",
    text: "Register, set your availability and claim your first delivery.",
    primary: { label: "Sign up as a transporter", href: "/transporter?signup=true" },
    secondary: { label: "How it works", href: "/how-it-works" },
  },
  related: ["/how-it-works", "/traceability", "/for-farmers", "/faq"],
};

export const ABOUT: ContentPageData = {
  path: "/about",
  eyebrow: "About",
  h1: "About Farm2Fork: a fairer, more transparent produce market",
  lead: "Farm2Fork is a student-built platform from the University of Central Punjab that connects Pakistani farmers directly to buyers and records each supply chain step so the produce can be traced. It is a final year project, currently in pilot, built to show that a fairer produce market is practical.",
  sections: [
    {
      id: "problem",
      heading: "The problem we are working on",
      blocks: [
        {
          type: "p",
          text: "Agriculture contributed about 23.5% of Pakistan's GDP in FY2025 and employs roughly 37% of the labour force, according to the Pakistan Economic Survey 2024-25. Yet small farmers often sell through chains of intermediaries and see little of the final price, while buyers cannot easily check where produce came from.",
        },
        {
          type: "p",
          text: "Losses make it worse. The Pakistan Economic Survey 2025-26 puts post-harvest losses of fruit and vegetables at 20% to 40%, with weak storage, sorting, packing and cold chain among the causes. Read more in [post-harvest losses in Pakistan](/guides/post-harvest-losses-pakistan-fruit-vegetables).",
        },
      ],
    },
    {
      id: "approach",
      heading: "Our approach",
      blocks: [
        {
          type: "ul",
          items: [
            "**Direct marketplace:** farmers list produce and set prices; buyers order from a named farm.",
            "**Traceability:** supply chain events are written to a Hyperledger Fabric ledger and surfaced as a QR journey.",
            "**Transport:** delivery partners claim and track shipments so handoffs are not guesswork.",
            "**Financial inclusion:** farmers can apply for financing reviewed by financial partners.",
            "**AI assistance:** a price and quality advisor is being developed to give farmers a fair-price signal.",
          ],
        },
      ],
    },
    {
      id: "status",
      heading: "Project status and what to expect",
      blocks: [
        {
          type: "callout",
          title: "Pilot, not a finished commercial service",
          text: "Farm2Fork was built by a three-person team at the Faculty of Information Technology and Computer Science, University of Central Punjab, as a final year project. The marketplace, onboarding, checkout and shipment tracking work; payment integration and the AI models are still being tested or trained. We do not publish user counts or testimonials because the platform has not launched commercially, and we will not invent them.",
        },
      ],
    },
    {
      id: "tech",
      heading: "How it is built",
      blocks: [
        {
          type: "p",
          text: "The web app uses Next.js, the backend is a NestJS modular monolith on MongoDB, traceability uses Hyperledger Fabric with Go chaincode, the AI services run on FastAPI, and the Android app is built in Flutter. Sign-in uses Firebase Authentication, and payments use Safepay's hosted checkout so card details never reach Farm2Fork.",
        },
      ],
    },
    {
      id: "learn",
      heading: "Learn more",
      blocks: [
        {
          type: "p",
          text: "Start with [how it works](/how-it-works) and [traceability](/traceability), browse the [guides](/guides), or read the [FAQ](/faq). The [privacy policy](/privacy) and [terms of use](/terms) describe how accounts and data are handled.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "Pakistan Economic Survey 2024-25, Agriculture chapter (Finance Division)",
      url: "https://www.finance.gov.pk/survey/chapter_25/2_Agriculture.pdf",
    },
    {
      label: "Agriculture sector share rises to 23.54% of GDP in FY25 (Pakistan Revenue)",
      url: "https://pkrevenue.com/agriculture-sector-share-rises-to-23-54-of-gdp-in-fy25/",
    },
    {
      label: "Water scarcity and post-harvest losses pressure Pakistan's produce sector (FreshPlaza)",
      url: "https://www.freshplaza.com/asia/article/9847999/water-scarcity-and-post-harvest-losses-pressure-pakistan-s-produce-sector/",
    },
  ],
  cta: {
    title: "Try the platform",
    text: "Create a free account for the role that fits you.",
    primary: { label: "Get started", href: "/signup" },
    secondary: { label: "How it works", href: "/how-it-works" },
  },
  related: ["/how-it-works", "/traceability", "/guides", "/privacy"],
};
