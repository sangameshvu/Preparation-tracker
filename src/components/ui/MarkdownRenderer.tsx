import React from 'react';
import { cn } from '../../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Inline parser for bold, italic, inline code, and links
export const renderInline = (text: string): React.ReactNode[] => {
  // Regex to split by markdown tokens: **bold**, *italic*, `code`, [text](url)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {renderInline(part.slice(2, -2))}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-foreground/90">
          {renderInline(part.slice(1, -1))}
        </em>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-purple-700 dark:text-purple-300 border border-border/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 dark:text-purple-400 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {match[1]}
          </a>
        );
      }
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  if (!content) return null;

  // Split lines
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Markdown Table Check (lines starting and ending with |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // Parse headers from line 0
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        // Line 1 is the separator (|---|---|)
        // Rows start at index 2
        const rowLines = tableLines.slice(2);

        elements.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-xl border border-border/80 shadow-sm bg-card">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/60 text-foreground">
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx} className="px-3.5 py-2.5 font-bold tracking-tight">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rowLines.map((r, rIdx) => {
                  const cells = r
                    .split('|')
                    .slice(1, -1)
                    .map((c) => c.trim());
                  return (
                    <tr
                      key={rIdx}
                      className={cn(
                        'transition-colors hover:bg-muted/40',
                        rIdx % 2 === 1 ? 'bg-muted/15' : 'bg-transparent'
                      )}
                    >
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2.5 leading-relaxed text-foreground/90">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 2. Blockquote (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      elements.push(
        <div
          key={`quote-${i}`}
          className="my-3 rounded-r-xl border-l-4 border-purple-500 bg-purple-500/10 px-4 py-3 text-xs leading-relaxed text-foreground shadow-xs"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? 'mt-1.5' : ''}>
              {renderInline(ql)}
            </p>
          ))}
        </div>
      );
      continue;
    }

    // 3. Unordered List (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().substring(2).trim());
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2.5 space-y-1.5 text-xs text-foreground/90">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600 dark:bg-purple-400" />
              <div className="flex-1">{renderInline(item)}</div>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 4. Ordered List (1. ...)
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const match = lines[i].trim().match(/^(\d+)\.\s(.*)/);
        if (match) {
          listItems.push({ num: match[1], text: match[2].trim() });
        }
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2.5 space-y-2 text-xs text-foreground/90">
          {listItems.map((item, oIdx) => (
            <li key={oIdx} className="flex items-start gap-2.5 leading-relaxed">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15 font-mono text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/25">
                {item.num}
              </span>
              <div className="flex-1 pt-0.5">{renderInline(item.text)}</div>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 5. Headings
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="mt-3.5 mb-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
          {renderInline(trimmed.substring(5))}
        </h4>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-2 text-sm font-bold text-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
          {renderInline(trimmed.substring(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-5 mb-2 text-base font-extrabold text-foreground border-b border-border/60 pb-1.5">
          {renderInline(trimmed.substring(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="mt-6 mb-3 text-lg font-black text-foreground">
          {renderInline(trimmed.substring(2))}
        </h1>
      );
      i++;
      continue;
    }

    // 6. Horizontal Rule (---)
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-border/60" />);
      i++;
      continue;
    }

    // 7. Regular Paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-xs leading-relaxed text-foreground/90">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className={cn('markdown-body space-y-1', className)}>{elements}</div>;
};

export default MarkdownRenderer;
