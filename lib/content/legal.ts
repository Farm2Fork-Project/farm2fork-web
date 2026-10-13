import { CONTACT_EMAIL } from "../seo/site";
import type { ContentPageData } from "./types";

export const LEGAL_UPDATED = "2026-10-12";

export const PRIVACY: ContentPageData = {
  path: "/privacy",
  eyebrow: "Legal",
  h1: "Privacy policy",
  lead: "This policy explains what personal information Farm2Fork collects, why, who it is shared with, and the choices you have. Farm2Fork is a final year project at the University of Central Punjab, currently in pilot, and this policy describes how the pilot platform handles data.",
  sections: [
    {
      id: "collect",
      heading: "Information we collect",
      blocks: [
        {
          type: "ul",
          items: [
            "**Account details:** name, email address, phone number and role (buyer, farmer, transporter or financial partner).",
            "**Sign-in data:** handled by Firebase Authentication, including email and password sign-in or Google sign-in. Farm2Fork does not see your Google password.",
            "**Identity details:** a Pakistani CNIC is requested at registration for every role. Buyers also give a business name and business type, and farmers give the farm's address, city, province and map location.",
            "**Delivery and pickup locations:** addresses and map coordinates you enter for orders or farm pickup.",
            "**Orders and payments:** items, quantities, prices, order and payment status, and delivery progress.",
            "**Supply chain records:** events recorded for traceability, such as listing, collection, transit and delivery.",
            "**Notifications:** if you enable push notifications, a device token so we can send them.",
            "**Preferences:** language and display settings, stored in your browser.",
          ],
        },
      ],
    },
    {
      id: "use",
      heading: "How we use it",
      blocks: [
        {
          type: "ul",
          items: [
            "To create and secure your account and confirm your role.",
            "To process orders, quote delivery and coordinate pickup and shipment.",
            "To show buyers the traceable journey of the produce they ordered.",
            "To send order, payment and delivery notifications you have enabled.",
            "To review farmer loan applications when you submit one.",
            "To keep the platform secure and fix problems.",
          ],
        },
      ],
    },
    {
      id: "share",
      heading: "Who we share it with",
      blocks: [
        {
          type: "p",
          text: "We share only what each party needs. Farmers see the buyer and delivery details for orders placed with them. Transport partners see pickup and drop-off details for shipments they claim. Financial partners see a farmer's loan application. Payments are completed on Safepay's hosted checkout page, so card and wallet details go to Safepay, not to Farm2Fork. Our service providers include Firebase (authentication and push notifications) and our database and hosting providers.",
        },
        {
          type: "p",
          text: "We do not sell personal information.",
        },
      ],
    },
    {
      id: "ledger",
      heading: "Records on the blockchain ledger",
      blocks: [
        {
          type: "p",
          text: "Supply chain events are written to a Hyperledger Fabric ledger, which is designed so that entries cannot be silently altered. The ledger holds record identifiers, event types and payment status for orders and shipments. It does not hold CNICs or phone numbers.",
        },
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      blocks: [
        {
          type: "p",
          text: "We keep account and order information while your account is active and as long as needed to resolve disputes and meet legal obligations. During the pilot, data may be reset or removed as the platform is tested.",
        },
      ],
    },
    {
      id: "rights",
      heading: "Your choices",
      blocks: [
        {
          type: "ul",
          items: [
            "You can update your profile details in the app.",
            "You can switch push notifications off in your browser or in the app's notification settings.",
            "You can ask us to correct or delete your account information, subject to records we must keep.",
          ],
        },
        {
          type: "p",
          text: CONTACT_EMAIL
            ? "To make a request, use the details on the [contact page](/contact)."
            : "To make a request, contact the project team through the University of Central Punjab.",
        },
      ],
    },
    {
      id: "children-cookies",
      heading: "Children, cookies and changes",
      blocks: [
        {
          type: "p",
          text: "Farm2Fork is not intended for children under 18. We use a session cookie and browser storage to keep you signed in and to remember language and display choices; we do not use advertising cookies. If this policy changes we will update the date at the top of the page.",
        },
        {
          type: "callout",
          title: "Draft policy",
          text: "This policy was written by the student project team to describe the pilot's actual behaviour. It has not been reviewed by a lawyer and should be before any commercial launch.",
        },
      ],
    },
  ],
  cta: {
    title: "Questions about your data?",
    text: "Read the FAQ or learn how the platform works.",
    primary: { label: "Read the FAQ", href: "/faq" },
    secondary: { label: "About Farm2Fork", href: "/about" },
  },
  related: ["/terms", "/faq", "/about"],
};

export const TERMS: ContentPageData = {
  path: "/terms",
  eyebrow: "Legal",
  h1: "Terms of use",
  lead: "These terms explain the rules for using Farm2Fork, a pilot marketplace connecting Pakistani farmers, buyers and transport partners. By creating an account or placing an order you agree to them.",
  sections: [
    {
      id: "pilot",
      heading: "A pilot service",
      blocks: [
        {
          type: "p",
          text: "Farm2Fork is a final year project at the University of Central Punjab. It is provided as a pilot, features may change or be unavailable, and it is not a licensed commercial service. We do not guarantee that produce will be available in any area or that any particular feature will keep working.",
        },
      ],
    },
    {
      id: "accounts",
      heading: "Accounts",
      blocks: [
        {
          type: "ul",
          items: [
            "You must give accurate information and keep your sign-in details secure.",
            "Each email address has one role. You are responsible for activity on your account.",
            "Farmers must provide a valid Pakistani CNIC and an accurate farm location.",
          ],
        },
      ],
    },
    {
      id: "listings",
      heading: "Listings and orders",
      blocks: [
        {
          type: "ul",
          items: [
            "Farmers must describe produce, quantity, grade and price honestly and only list what they can supply.",
            "Each order is placed with a single farmer. The price, platform fee, delivery fee and total are shown in a quote before you pay.",
            "Payment is made on Safepay's hosted checkout page and is subject to Safepay's own terms.",
          ],
        },
      ],
    },
    {
      id: "transport",
      heading: "Deliveries",
      blocks: [
        {
          type: "p",
          text: "Transport partners must update shipment status accurately. Delivery estimates are estimates, and delays caused by weather, roads or other factors can occur.",
        },
      ],
    },
    {
      id: "conduct",
      heading: "Acceptable use",
      blocks: [
        {
          type: "p",
          text: "Do not post false listings, misuse another person's identity, interfere with the platform, or use it for anything unlawful. We may suspend accounts that break these rules.",
        },
      ],
    },
    {
      id: "traceability",
      heading: "Traceability records",
      blocks: [
        {
          type: "p",
          text: "Traceability records show the journey recorded by participants. They support trust but do not guarantee that produce is safe or of a particular quality. See [traceability](/traceability) for what the records do and do not prove.",
        },
      ],
    },
    {
      id: "liability",
      heading: "Liability and changes",
      blocks: [
        {
          type: "p",
          text: "To the extent allowed by law, the project team is not liable for losses arising from use of the pilot platform. We may update these terms and will change the date on this page when we do. Your data is handled as described in the [privacy policy](/privacy).",
        },
        {
          type: "callout",
          title: "Draft terms",
          text: "These terms were written by the student project team for the pilot and have not been reviewed by a lawyer. They should be reviewed before any commercial launch.",
        },
      ],
    },
  ],
  cta: {
    title: "Questions?",
    text: "Read the FAQ or find out more about the project.",
    primary: { label: "Read the FAQ", href: "/faq" },
    secondary: { label: "About Farm2Fork", href: "/about" },
  },
  related: ["/privacy", "/faq", "/about"],
};
