import Link from "next/link";
import type { ReactNode } from "react";

const TOKENS = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;
const BOLD = /^\*\*([^*]+)\*\*$/;

/** Renders the small inline markup used in content strings: `[label](url)` and `**bold**`. */
export function RichText({ text }: { text: string }): ReactNode {
  return text.split(TOKENS).map((part, index) => {
    const link = LINK.exec(part);
    if (link) {
      const [, label, href] = link;
      if (/^https?:\/\//.test(href)) {
        return (
          <a key={index} href={href} rel="noopener noreferrer" target="_blank">
            {label}
          </a>
        );
      }
      return (
        <Link key={index} href={href}>
          {label}
        </Link>
      );
    }
    const bold = BOLD.exec(part);
    if (bold) return <strong key={index}>{bold[1]}</strong>;
    return part;
  });
}
