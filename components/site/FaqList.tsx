import type { Faq } from "@/lib/content/types";
import { RichText } from "./RichText";

/**
 * Native <details> keeps every answer in the HTML for crawlers and AI
 * assistants while staying keyboard accessible without any client JavaScript.
 */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="site-faq">
      {faqs.map((faq) => (
        <details key={faq.q}>
          <summary>{faq.q}</summary>
          <p>
            <RichText text={faq.a} />
          </p>
        </details>
      ))}
    </div>
  );
}
