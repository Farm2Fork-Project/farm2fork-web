import Link from "next/link";
import { HOME_FAQS } from "@/lib/content/faqs";
import { GUIDES, guidePath } from "@/lib/content/guides";
import { FaqList } from "./FaqList";

/**
 * Server-rendered content for the home page: a quotable definition, links into
 * the guides, and the questions people actually ask. English only, so it is
 * marked lang="en" inside the bilingual landing page.
 */
export function HomeSections() {
  return (
    <div lang="en" dir="ltr">
      <section className="market-section site-home-about" aria-labelledby="home-what-heading">
        <div className="market-section-heading">
          <p>What is Farm2Fork?</p>
          <h2 id="home-what-heading">
            A direct, traceable market for <em>Pakistani produce.</em>
          </h2>
        </div>
        <div className="site-home-about-body">
          <p>
            Farm2Fork is a Pakistani farm-to-buyer marketplace. Farmers list produce at a price they choose, buyers order
            from a named farm and see a delivery quote before paying, transport partners deliver the order, and every
            handoff is recorded on a Hyperledger Fabric ledger that a buyer can read by scanning a QR code.
          </p>
          <p>
            It is a final year project of the University of Central Punjab and is currently in pilot. Read{" "}
            <Link href="/about">about the project</Link>, see <Link href="/how-it-works">how an order works</Link>, or
            learn <Link href="/traceability">what traceability does and does not prove</Link>.
          </p>
        </div>
      </section>

      <section className="market-section site-home-guides" aria-labelledby="home-guides-heading">
        <div className="market-section-heading">
          <p>Guides</p>
          <h2 id="home-guides-heading">
            Learn how fresh produce <em>really moves.</em>
          </h2>
        </div>
        <ul className="site-guide-list site-guide-list-compact">
          {GUIDES.slice(0, 4).map((guide) => (
            <li key={guide.slug}>
              <article>
                <p className="site-card-meta">{guide.category}</p>
                <h3>
                  <Link href={guidePath(guide.slug)}>{guide.title}</Link>
                </h3>
                <p>{guide.description}</p>
              </article>
            </li>
          ))}
        </ul>
        <p className="site-home-more">
          <Link href="/guides">See all guides</Link>
        </p>
      </section>

      <section className="market-section site-home-faq" aria-labelledby="home-faq-heading">
        <div className="market-section-heading">
          <p>FAQ</p>
          <h2 id="home-faq-heading">
            Questions people ask <em>first.</em>
          </h2>
        </div>
        <FaqList faqs={HOME_FAQS} />
        <p className="site-home-more">
          <Link href="/faq">Read all questions</Link>
        </p>
      </section>
    </div>
  );
}
