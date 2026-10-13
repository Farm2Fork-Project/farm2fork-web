import type { Article } from "../types";

export const WHAT_IS_TRACEABILITY: Article = {
  slug: "what-is-farm-to-fork-traceability",
  title: "What is farm-to-fork traceability? A plain-language guide",
  metaTitle: "What Is Farm-to-Fork Traceability?",
  description:
    "Farm-to-fork traceability explained: what it means, why it matters for food safety and fair pricing, what gets recorded, and how buyers can use it.",
  category: "Traceability",
  publishedAt: "2026-10-12",
  updatedAt: "2026-10-12",
  summary:
    "Farm-to-fork traceability is the ability to follow a food product forward and backward through every stage of its journey, from the farm where it was grown to the buyer who received it. It relies on recording who handled the product, when, and under what conditions, so problems can be located quickly.",
  takeaways: [
    "Traceability has two directions: tracing forward (where did this batch go) and backward (where did it come from).",
    "It depends on identifying each batch, recording each handoff, and keeping the records trustworthy.",
    "It speeds up recalls and complaints, and lets good producers be recognised.",
    "It supports trust; it does not replace testing or inspection.",
  ],
  sections: [
    {
      id: "definition",
      heading: "Traceability in one paragraph",
      blocks: [
        {
          type: "p",
          text: "Traceability, in food systems, means being able to identify the origin of a product and follow it through production, processing, transport and sale. The phrase farm-to-fork describes the full chain: farm, packing, transport, retail or kitchen, and finally the plate.",
        },
        {
          type: "p",
          text: "There are two directions. Tracing backward starts from a product in your hand and asks where it came from. Tracing forward starts from a farm or batch and asks where it went. Both matter when something goes wrong, because they tell you which batches are affected and which are not.",
        },
      ],
    },
    {
      id: "ingredients",
      heading: "What traceability needs",
      blocks: [
        {
          type: "ol",
          items: [
            "**A way to identify each batch.** A lot number, a label or a QR code that stays with the product.",
            "**A record at each handoff.** Who gave it, who received it, when, and where.",
            "**Conditions that matter.** For fresh produce, this can include grade, harvest date and transit time.",
            "**Records people can trust.** If anyone can edit the history, it is worth little.",
          ],
        },
      ],
    },
    {
      id: "why",
      heading: "Why it matters for fresh produce",
      blocks: [
        {
          type: "ul",
          items: [
            "**Faster problem solving.** If a complaint arrives, the record narrows the cause to a specific step.",
            "**Fair recognition.** Farmers who grow good produce can be identified rather than lost in a pooled lot.",
            "**Less guesswork for buyers.** Restaurants and retailers can verify what they were sold.",
            "**Better data.** Transit times and handling steps reveal where freshness is being lost. That is a real issue: Pakistan's [post-harvest losses](/guides/post-harvest-losses-pakistan-fruit-vegetables) of fruit and vegetables are commonly estimated at 20% to 40%.",
          ],
        },
      ],
    },
    {
      id: "how-farm2fork",
      heading: "How Farm2Fork approaches it",
      blocks: [
        {
          type: "p",
          text: "Every Farm2Fork order is tied to one named farmer. Listing, order, collection, transit and delivery each create a record, written to a Hyperledger Fabric ledger, and the buyer can scan a QR code to see them in order. The detail is on the [traceability page](/traceability), and the technology is explained in [how blockchain food traceability works](/guides/how-blockchain-food-traceability-works).",
        },
      ],
    },
    {
      id: "limits",
      heading: "What traceability does not do",
      blocks: [
        {
          type: "callout",
          title: "Traceability is evidence, not a guarantee",
          text: "A record can show the route a product took. It cannot by itself prove that the produce is safe or high quality. Treat it as one layer of trust alongside inspection, testing and reputation.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "What is the difference between traceability and tracking?",
      a: "Tracking follows a product forward as it moves, such as a parcel in transit. Traceability also lets you trace backward from a product to its origin and reconstruct its history. Farm-to-fork needs both.",
    },
    {
      q: "Does traceability make food safer?",
      a: "It makes problems quicker to find and contain, which reduces harm, but it does not make unsafe food safe. Food safety still depends on hygiene, storage and testing.",
    },
  ],
  related: [
    "how-blockchain-food-traceability-works",
    "post-harvest-losses-pakistan-fruit-vegetables",
    "buy-fresh-vegetables-directly-from-farmers-pakistan",
  ],
};

export const HOW_BLOCKCHAIN_WORKS: Article = {
  slug: "how-blockchain-food-traceability-works",
  title: "How blockchain food traceability works, and what it can't do",
  metaTitle: "How Blockchain Food Traceability Works",
  description:
    "A clear explanation of how a permissioned blockchain such as Hyperledger Fabric records food supply chain events, plus the limits every buyer should understand.",
  category: "Traceability",
  publishedAt: "2026-10-12",
  updatedAt: "2026-10-12",
  summary:
    "Blockchain food traceability writes each supply chain event, such as a farm listing, pickup or delivery, to a shared ledger where entries are chained together and cannot be quietly altered. A permissioned network like Hyperledger Fabric lets only approved participants write, but it can prove a record was unchanged, not that it was true.",
  takeaways: [
    "A blockchain is a shared, append-only record where each entry is cryptographically linked to the previous one.",
    "Permissioned blockchains such as Hyperledger Fabric restrict who can write, which suits supply chains with known participants.",
    "Immutability protects a record from later edits, not from being wrong when first written.",
    "Good traceability combines the ledger with identity, grading and independent checks.",
  ],
  sections: [
    {
      id: "basics",
      heading: "A blockchain in plain terms",
      blocks: [
        {
          type: "p",
          text: "A blockchain is a list of records, grouped in blocks, where each block contains a cryptographic fingerprint of the one before it. Change an old record and its fingerprint changes, which breaks every later link, so tampering is visible. Copies are held by several participants, so no single party can rewrite history on their own.",
        },
      ],
    },
    {
      id: "permissioned",
      heading: "Why a permissioned network for food",
      blocks: [
        {
          type: "p",
          text: "Public blockchains such as Bitcoin let anyone join, which makes them slow and exposes every record. Hyperledger Fabric is a permissioned framework hosted by the Linux Foundation: every participant has an identity, and the network decides who may read or write. In a food supply chain the parties are known, so permissioned access fits, and sensitive details such as farm locations need not be public.",
        },
        {
          type: "table",
          caption: "Public and permissioned blockchains compared",
          headers: ["Feature", "Public blockchain", "Permissioned (Hyperledger Fabric)"],
          rows: [
            ["Who can write", "Anyone", "Approved identities only"],
            ["Privacy", "Records visible to all", "Access can be restricted"],
            ["Speed and cost", "Slower, fees common", "Faster, no token fees"],
            ["Typical use", "Open currencies", "Enterprise and supply chains"],
          ],
        },
      ],
    },
    {
      id: "flow",
      heading: "What happens on a Farm2Fork order",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "A listing is created",
              text: "The farm, crop, quantity and grade are recorded as the first event.",
            },
            {
              title: "An order is placed",
              text: "The order links a buyer to that farm's produce.",
            },
            {
              title: "The shipment moves",
              text: "Collection, transit and delivery updates are written as separate events by the transport partner.",
            },
            {
              title: "The buyer scans a QR code",
              text: "The app reads the order's events and displays them as a journey.",
            },
          ],
        },
        {
          type: "p",
          text: "The product-level view of this is on the [traceability page](/traceability).",
        },
      ],
    },
    {
      id: "limits",
      heading: "What blockchain cannot do",
      blocks: [
        {
          type: "ul",
          items: [
            "**It cannot verify the physical world.** If a farmer enters the wrong grade, the ledger faithfully preserves the wrong grade.",
            "**It cannot guarantee safety.** Pesticide residue, contamination and spoilage need testing, not a record.",
            "**It cannot replace identity.** The value of a record depends on knowing who wrote it, which is why registration matters.",
            "**It does not fix bad data entry.** Training and simple interfaces for farmers and drivers are as important as the ledger.",
          ],
        },
        {
          type: "p",
          text: "Honest platforms say so. Farm2Fork treats the ledger as one layer of trust next to registered identities, quality grades and handoff records. For the underlying idea, read [what farm-to-fork traceability is](/guides/what-is-farm-to-fork-traceability).",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Is blockchain traceability the same as cryptocurrency?",
      a: "No. Farm2Fork uses a blockchain only as a tamper-evident record of supply chain events. There is no coin, no mining and no token for users to buy.",
    },
    {
      q: "Can records on Hyperledger Fabric be deleted?",
      a: "The ledger is append-only: new entries can be added, but earlier ones cannot be silently changed. Corrections are made by adding a new record that references the earlier one.",
    },
  ],
  sources: [
    { label: "Hyperledger Fabric documentation", url: "https://hyperledger-fabric.readthedocs.io/" },
  ],
  related: [
    "what-is-farm-to-fork-traceability",
    "post-harvest-losses-pakistan-fruit-vegetables",
    "middlemen-in-pakistan-produce-supply-chain",
  ],
};
