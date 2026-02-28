import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface StreamingRendererProps {
  content: string;
  isStreaming?: boolean;
}

const CodeBlock = ({ code, language }: { code: string, language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs font-mono text-gray-400 ml-2">{language || 'code'}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-[#d4d4d4]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export const StreamingRenderer: React.FC<StreamingRendererProps> = ({ content, isStreaming }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    setDisplayedContent(content);
  }, [content]);

  // Helper to format bold text and tables
  const formatText = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    formatted = formatted.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-white/10 text-accent font-mono text-sm">$1</code>');
    return formatted;
  };

  const renderContent = () => {
    if (!displayedContent) return null;

    // Split by code blocks
    const parts = displayedContent.split(/```/);
    
    return parts.map((part, index) => {
      // Even indices are normal text, odd indices are code blocks
      if (index % 2 === 1) {
        // It's a code block
        const lines = part.split('\n');
        const language = lines[0].trim();
        const code = lines.slice(1).join('\n').trimEnd();
        
        // If the code block is currently being typed and not closed yet
        if (index === parts.length - 1 && isStreaming) {
           return (
             <div key={index} className="my-4 p-4 rounded-xl bg-[#0d1117] border border-white/10 font-mono text-sm text-gray-300 whitespace-pre-wrap">
               {part}
             </div>
           );
        }
        
        return <CodeBlock key={index} code={code} language={language} />;
      }

      // Normal text processing
      const lines = part.split('\n');
      let inTable = false;
      let tableRows: React.ReactNode[] = [];
      const elements: React.ReactNode[] = [];

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
              ? "px-4 py-2 bg-white/5 border border-white/10 font-semibold text-left text-gray-200"
              : "px-4 py-2 border border-white/10 text-gray-300";

            tableRows.push(
              <tr key={key} className="hover:bg-white/5 transition-colors">
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
          // End of table
          inTable = false;
          elements.push(
            <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full border-collapse text-sm">
                <tbody>{tableRows}</tbody>
              </table>
            </div>
          );
          tableRows = [];
        }

        // Handle bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
          const text = line.replace(/^[•\-*]\s*/, '');
          elements.push(
            <li key={key} className="ml-4 mb-2 list-disc marker:text-accent">
              <span dangerouslySetInnerHTML={{ __html: formatText(text) }} />
            </li>
          );
          return;
        }
        
        // Handle empty lines
        if (line.trim() === '') {
          elements.push(<div key={key} className="h-4" />);
          return;
        }

        // Handle regular paragraphs
        elements.push(
          <p key={key} className="mb-3 last:mb-0 leading-relaxed text-[15px]">
            <span dangerouslySetInnerHTML={{ __html: formatText(line) }} />
          </p>
        );
      });

      // Flush remaining table if any
      if (inTable && tableRows.length > 0) {
        elements.push(
          <div key={`table-end-${index}`} className="my-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full border-collapse text-sm">
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        );
      }

      return elements;
    });
  };

  return (
    <div className="prose-custom max-w-none">
      {renderContent()}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
};
