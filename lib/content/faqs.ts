import type { Faq } from "./types";

export type FaqGroup = { id: string; title: string; faqs: Faq[] };

/**
 * Answers lead with the direct answer so search engines and AI assistants can
 * quote them. Only describe behaviour the product actually has; this is a
 * pilot-stage project, so avoid scale claims, user counts and unverified promises.
 */
export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "general",
    title: "About Farm2Fork",
    faqs: [
      {
        q: "What is Farm2Fork?",
        a: "Farm2Fork is a Pakistani online marketplace that connects farmers directly with buyers. Farmers list produce with their own prices, buyers order from a named farm, transport partners deliver the order, and each handoff is recorded so the produce can be traced with a QR code. It is a final year project at the University of Central Punjab.",
      },
      {
        q: "Who can use Farm2Fork?",
        a: "Farm2Fork has accounts for four groups: buyers such as individuals, restaurants, retailers and wholesalers; farmers who sell produce; transport partners who deliver orders; and financial partners who review farmer loan applications. Each role signs up separately and sees its own tools.",
      },
      {
        q: "Is Farm2Fork live in my city?",
        a: "Farm2Fork is a pilot, so availability depends on which farmers and transport partners have registered near you. Browse the marketplace after signing in to see current listings. The platform is being tested and expanded in stages, so do not expect national coverage yet.",
      },
      {
        q: "Does it cost anything to join?",
        a: "Creating an account is free. Orders carry a percentage-based platform fee and a distance-based delivery fee, and both are itemised in the delivery quote you review before paying.",
      },
      {
        q: "Is there a mobile app?",
        a: "Yes. Farm2Fork has a web app and an Android app built on the same backend. Both are under active development as part of the final year project, and the web app is the quickest way to try the platform.",
      },
    ],
  },
  {
    id: "buyers",
    title: "Buying produce",
    faqs: [
      {
        q: "How do I buy fresh produce on Farm2Fork?",
        a: "Create a buyer account, browse listings from farmers, add items to your cart, enter your delivery location, review the quote, and pay through Safepay's hosted checkout. You can follow each order's status afterwards from the Orders view.",
      },
      {
        q: "Can I order from more than one farmer at once?",
        a: "Yes. Your cart groups items by farmer, and each farmer's group becomes its own order with its own delivery quote and payment. This keeps every order tied to one farm, which is what makes the produce traceable.",
      },
      {
        q: "How is the delivery fee calculated?",
        a: "The delivery fee is based on the estimated distance between the farmer's pickup location and your delivery address. You see the distance, delivery fee, platform fee and total as a quote before you pay.",
      },
      {
        q: "How do I pay?",
        a: "Payment is made online through Safepay's hosted checkout page, so card and wallet details are entered on Safepay's site rather than stored by Farm2Fork. Payment integration is still being tested, so treat the pilot as a demonstration environment.",
      },
      {
        q: "How do I know where my produce came from?",
        a: "Each listing names the farm and shows its quality grade and pickup location, and each order keeps a record of its journey. Scan the order's QR code in the Farm2Fork app to see the farm record, collection, transport and delivery steps.",
      },
    ],
  },
  {
    id: "farmers",
    title: "Selling as a farmer",
    faqs: [
      {
        q: "How do I start selling on Farm2Fork?",
        a: "Choose the farmer role when you sign up and provide your CNIC, farm address and farm location on the map. After verification of your email you can create listings with the produce, quantity, unit and price you choose, and manage incoming orders from your dashboard.",
      },
      {
        q: "Do I set my own prices?",
        a: "Yes. Farmers set their own price per unit in rupees. Farm2Fork is building an AI price advisor that will suggest a fair range, but the model is still in development and the final price is always your decision.",
      },
      {
        q: "What do I need to register as a farmer?",
        a: "You need a valid Pakistani CNIC, a working email address, and the address and map location of your farm, including city and province. The farm location is what buyers and transport partners use to plan pickup.",
      },
      {
        q: "Can I apply for a loan through Farm2Fork?",
        a: "Farmers can submit a loan application inside the platform, and it is reviewed by a financial partner. Approval is entirely the partner's decision and nothing is guaranteed, so treat it as an application channel rather than an entitlement.",
      },
      {
        q: "Which units can I sell in?",
        a: "Listings can be priced per kilogram, ton, dozen, piece or litre. Choose the unit buyers expect for that crop, such as kilograms for vegetables or dozens for citrus and eggs.",
      },
    ],
  },
  {
    id: "transporters",
    title: "Delivering as a transport partner",
    faqs: [
      {
        q: "How do I become a transport partner?",
        a: "Choose the transporter role at signup and complete the onboarding form. Once registered, you can set your delivery availability, claim open deliveries, and update each shipment's status as it moves from pickup to delivery.",
      },
      {
        q: "How do I find deliveries?",
        a: "Open deliveries appear in the transporter portal. You claim a shipment you can complete, follow the route from the farm's pickup location to the buyer, and mark each step as it happens so the buyer and farmer can follow along.",
      },
    ],
  },
  {
    id: "traceability",
    title: "Traceability and trust",
    faqs: [
      {
        q: "What is farm-to-fork traceability?",
        a: "Farm-to-fork traceability is the ability to follow a food product backwards and forwards through every stage, from the farm where it was grown to the buyer who received it. On Farm2Fork each stage creates a record, and a QR code lets a buyer view that journey.",
      },
      {
        q: "Does blockchain guarantee that produce is high quality?",
        a: "No. A blockchain ledger shows that a record was written at a certain time and has not been changed since. It cannot prove the original information was true, which is why Farm2Fork also records quality grades, farm identity and each handoff by a named participant.",
      },
      {
        q: "Which blockchain does Farm2Fork use?",
        a: "Farm2Fork records supply chain events on Hyperledger Fabric, a permissioned blockchain framework hosted by the Linux Foundation. Permissioned means only approved participants can write to the ledger, which suits a supply chain with known farmers, carriers and the platform.",
      },
      {
        q: "How do I scan a QR code?",
        a: "Open the Farm2Fork app, choose the scan option, and point your camera at the QR code on the listing or order. The journey of that produce, from farm record to delivery, is then shown on screen.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy and safety",
    faqs: [
      {
        q: "What personal data does Farm2Fork collect?",
        a: "Farm2Fork collects the account details you provide, such as name, email and phone number, a Pakistani CNIC for identity checks at registration, delivery or farm addresses, and order history. If you enable push notifications, your device token is stored too. The privacy policy lists each use in full.",
      },
      {
        q: "Does Farm2Fork store my card details?",
        a: "No. Card and wallet details are entered on Safepay's hosted checkout page. Farm2Fork receives the payment status for your order, not your card number.",
      },
      {
        q: "Who built Farm2Fork?",
        a: "Farm2Fork was built by a three-person student team at the Faculty of Information Technology and Computer Science, University of Central Punjab, as a final year project. It is not a commercial company, and the About page explains the project's status.",
      },
    ],
  },
];

export const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((group) => group.faqs);

/** A short, high-value subset for the home page. */
export const HOME_FAQS: Faq[] = [
  FAQ_GROUPS[0].faqs[0],
  FAQ_GROUPS[1].faqs[0],
  FAQ_GROUPS[2].faqs[0],
  FAQ_GROUPS[4].faqs[0],
  FAQ_GROUPS[4].faqs[1],
];
