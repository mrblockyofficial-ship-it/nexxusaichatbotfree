import React, { useEffect, useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface StreamingRendererProps {
  content: string;
  isStreaming?: boolean;
}

// ── Code block with line numbers, language badge, copy ──
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic syntax coloring via regex
  const highlightLine = (line: string) => {
    let highlighted = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$|#.*$)/gm,
      '<span class="text-gray-500 italic">$1</span>'
    );
    // Strings
    highlighted = highlighted.replace(
      /(&quot;(?:[^&]|\\.)*&quot;|&#39;(?:[^&]|\\.)*&#39;|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
      '<span class="text-emerald-400">$1</span>'
    );
    // Keywords
    highlighted = highlighted.replace(
      /\b(const|let|var|function|return|if|else|for|while|import|export|from|class|new|this|async|await|try|catch|throw|typeof|interface|type|enum|extends|implements|public|private|protected|static|readonly|abstract|def|print|lambda|yield|with|as|in|not|and|or|True|False|None)\b/g,
      '<span class="text-purple-400">$1</span>'
    );
    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="text-amber-400">$1</span>'
    );
    return highlighted;
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/[0.08] bg-surface-0 shadow-elevation-2">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          {language && (
            <span className="text-[11px] font-mono font-medium text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-md uppercase tracking-wider">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="px-4 py-0 text-right text-[11px] font-mono text-gray-600 select-none w-[1%] whitespace-nowrap border-r border-white/[0.04]">
                  {i + 1}
                </td>
                <td className="px-4 py-0">
                  <pre className="text-[13px] font-mono leading-6 text-[#d4d4d4]">
                    <code dangerouslySetInnerHTML={{ __html: highlightLine(line) || '&nbsp;' }} />
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Thinking/reasoning collapsible block ──
const ThinkingBlock = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-violet-300 hover:bg-violet-500/[0.06] transition-colors"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="font-medium">Thinking</span>
        <span className="text-xs text-violet-400/60 ml-auto">{content.split(' ').length} words</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-3 text-sm text-gray-400 leading-relaxed border-t border-violet-500/10 pt-3 whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
};

export const StreamingRenderer: React.FC<StreamingRendererProps> = ({ content, isStreaming }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    setDisplayedContent(content);
  }, [content]);

  // Format inline markdown
  const formatText = (text: string) => {
    // Escape HTML entities first to prevent XSS
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-accent-light font-mono text-[13px]">$1</code>');
    // Links
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:text-accent-light underline underline-offset-2 transition-colors">$1</a>'
    );
    // Strikethrough
    formatted = formatted.replace(/~~(.*?)~~/g, '<del class="text-gray-500">$1</del>');
    return formatted;
  };

  const renderContent = () => {
    if (!displayedContent) return null;

    // Extract thinking blocks first
    let mainContent = displayedContent;
    const thinkingBlocks: string[] = [];
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    let thinkMatch;
    while ((thinkMatch = thinkRegex.exec(displayedContent)) !== null) {
      thinkingBlocks.push(thinkMatch[1].trim());
      mainContent = mainContent.replace(thinkMatch[0], '');
    }

    // Split by code blocks
    const parts = mainContent.split(/```/);

    const elements: React.ReactNode[] = [];

    // Render thinking blocks first
    thinkingBlocks.forEach((block, i) => {
      elements.push(<ThinkingBlock key={`think-${i}`} content={block} />);
    });

    parts.forEach((part, index) => {
      // Odd indices are code blocks
      if (index % 2 === 1) {
        const lines = part.split('\n');
        const language = lines[0].trim();
        const code = lines.slice(1).join('\n').trimEnd();

        // Currently streaming, unclosed code block
        if (index === parts.length - 1 && isStreaming) {
          elements.push(
            <div key={index} className="my-4 p-4 rounded-xl bg-surface-0 border border-white/[0.08] font-mono text-[13px] text-gray-300 whitespace-pre-wrap">
              {part}
            </div>
          );
          return;
        }

        elements.push(<CodeBlock key={index} code={code} language={language} />);
        return;
      }

      // Normal text processing
      const lines = part.split('\n');
      let inTable = false;
      let tableRows: React.ReactNode[] = [];
      let consecutiveBlankLines = 0;

      lines.forEach((line, lineIndex) => {
        const key = `${index}-${lineIndex}`;

        // Handle tables
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          inTable = true;
          const cells = line.split('|').filter(cell => cell.trim() !== '');
          const isHeaderSeparator = cells.every(cell => cell.trim().match(/^[-:]+$/));

          if (!isHeaderSeparator) {
            const isHeader = tableRows.length === 0;
            const CellTag = isHeader ? 'th' : 'td';
            const cellClasses = isHeader
              ? 'px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] font-semibold text-left text-gray-200 text-sm'
              : 'px-4 py-2.5 border border-white/[0.06] text-gray-300 text-sm';

            tableRows.push(
              <tr key={key} className="hover:bg-white/[0.02] transition-colors">
                {cells.map((cell, cellIndex) => (
                  <CellTag key={cellIndex} className={cellClasses}>
                    <span dangerouslySetInnerHTML={{ __html: formatText(cell.trim()) }} />
                  </CellTag>
                ))}
              </tr>
            );
          }
          return;
        } else if (inTable) {
          inTable = false;
          elements.push(
            <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-xl border border-white/[0.08] shadow-elevation-1">
              <table className="w-full border-collapse text-sm">
                <tbody>{tableRows}</tbody>
              </table>
            </div>
          );
          tableRows = [];
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const text = headingMatch[2];
          const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-base', 'text-sm'];
          const margins = ['mt-6 mb-3', 'mt-5 mb-2.5', 'mt-4 mb-2', 'mt-3 mb-2', 'mt-3 mb-1.5', 'mt-2 mb-1'];
          elements.push(
            <div key={key} className={`${sizes[level - 1]} ${margins[level - 1]} font-semibold text-white first:mt-0`}>
              <span dangerouslySetInnerHTML={{ __html: formatText(text) }} />
            </div>
          );
          consecutiveBlankLines = 0;
          return;
        }

        // Horizontal rule
        if (line.trim().match(/^(-{3,}|_{3,}|\*{3,})$/)) {
          elements.push(<hr key={key} className="border-white/[0.08] my-6" />);
          consecutiveBlankLines = 0;
          return;
        }

        // Blockquote
        if (line.trim().startsWith('>')) {
          const text = line.replace(/^>\s*/, '');
          elements.push(
            <blockquote key={key} className="border-l-[3px] border-accent/40 pl-4 my-3 text-gray-400 italic">
              <span dangerouslySetInnerHTML={{ __html: formatText(text) }} />
            </blockquote>
          );
          consecutiveBlankLines = 0;
          return;
        }

        // Numbered list
        const numberedMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
        if (numberedMatch) {
          elements.push(
            <li key={key} className="ml-5 mb-2 list-decimal marker:text-gray-500 marker:font-mono">
              <span dangerouslySetInnerHTML={{ __html: formatText(numberedMatch[2]) }} />
            </li>
          );
          consecutiveBlankLines = 0;
          return;
        }

        // Bullet points
        if (line.trim().match(/^[•\-*]\s/)) {
          const text = line.replace(/^[•\-*]\s*/, '');
          elements.push(
            <li key={key} className="ml-5 mb-2 list-disc marker:text-accent/60">
              <span dangerouslySetInnerHTML={{ __html: formatText(text) }} />
            </li>
          );
          consecutiveBlankLines = 0;
          return;
        }

        // Empty lines — collapse multiple
        if (line.trim() === '') {
          consecutiveBlankLines++;
          if (consecutiveBlankLines <= 1) {
            elements.push(<div key={key} className="h-3" />);
          }
          return;
        }

        consecutiveBlankLines = 0;

        // Regular paragraph
        elements.push(
          <p key={key} className="mb-3 last:mb-0 leading-relaxed text-[15px]">
            <span dangerouslySetInnerHTML={{ __html: formatText(line) }} />
          </p>
        );
      });

      // Flush remaining table
      if (inTable && tableRows.length > 0) {
        elements.push(
          <div key={`table-end-${index}`} className="my-4 overflow-x-auto rounded-xl border border-white/[0.08] shadow-elevation-1">
            <table className="w-full border-collapse text-sm">
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        );
      }
    });

    return elements;
  };

  return (
    <div className="prose-custom max-w-none">
      {renderContent()}
      {isStreaming && (
        <span className="inline-block w-[2px] h-5 ml-0.5 bg-accent animate-pulse align-middle" />
      )}
    </div>
  );
};
