import type { Block, Section } from "@/lib/content/types";
import type { Locale } from "@/lib/seo/locale";
import { UI } from "@/lib/seo/ui";
import { RichText } from "./RichText";

function BlockView({ block, locale }: { block: Block; locale: Locale }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      );
    case "steps":
      return (
        <ol className="site-steps">
          {block.items.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>
                <RichText text={item.text} />
              </p>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="site-table-wrap" role="region" aria-label={block.caption ?? UI[locale].table} tabIndex={0}>
          <table>
            {block.caption ? <caption>{block.caption}</caption> : null}
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th key={header} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) =>
                    index === 0 ? (
                      <th key={index} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={index}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <aside className="site-callout">
          {block.title ? <strong>{block.title}</strong> : null}
          <p>
            <RichText text={block.text} />
          </p>
        </aside>
      );
  }
}

export function Sections({ sections, locale = "en" }: { sections: Section[]; locale?: Locale }) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="site-section" aria-labelledby={`${section.id}-heading`}>
          <h2 id={`${section.id}-heading`}>{section.heading}</h2>
          {section.blocks.map((block, index) => (
            <BlockView key={index} block={block} locale={locale} />
          ))}
        </section>
      ))}
    </>
  );
}
