import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Server, 
  Database, 
  Smartphone 
} from 'lucide-react';
import { FLUTTER_CODE_SNIPPETS } from '../data/flutterCodeSnippets';

export const CodeExplorer: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(FLUTTER_CODE_SNIPPETS[0].id);
  const [copied, setCopied] = useState(false);

  const activeSnippet =
    FLUTTER_CODE_SNIPPETS.find((s) => s.id === selectedSnippetId) || FLUTTER_CODE_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeSnippet.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeSnippet.fileName.split('/').pop() || 'snippet.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FA3055] text-white flex items-center justify-center font-bold">
                <Code2 className="w-4 h-4 text-[#FA3055]" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Livrables d'architecture & code source
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Schémas MySQL / MariaDB (Hostinger Cloud / Prisma) & Drift (SQLite), arborescence Clean Architecture Flutter et code du moteur de synchronisation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#FA3055]" /> : <Copy className="w-4 h-4 text-[#FA3055]" />}
              <span>{copied ? 'Code copié !' : 'Copier le fichier'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-[#F4F6F5] hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Télécharger ce fichier"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector for all deliverables */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          {FLUTTER_CODE_SNIPPETS.map((snippet) => {
            const isSelected = selectedSnippetId === snippet.id;
            return (
              <button
                key={snippet.id}
                onClick={() => setSelectedSnippetId(snippet.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FA3055] text-white shadow-sm font-bold'
                    : 'bg-[#F4F6F5] text-slate-600 hover:bg-slate-200'
                }`}
              >
                {snippet.category.includes('MySQL') || snippet.category.includes('PostgreSQL') ? (
                  <Server className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FA3055]' : ''}`} />
                ) : snippet.category.includes('Drift') ? (
                  <Database className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FA3055]' : ''}`} />
                ) : snippet.category.includes('Architecture') ? (
                  <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FA3055]' : ''}`} />
                ) : (
                  <Smartphone className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FA3055]' : ''}`} />
                )}
                <span>{snippet.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        
        {/* Editor Top Bar */}
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-3 font-mono font-bold text-slate-300">
              {activeSnippet.fileName}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-[#FA3055] font-mono font-bold">
              {activeSnippet.language.toUpperCase()}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 hidden sm:block">
            {activeSnippet.description}
          </p>
        </div>

        {/* Code Pre Block */}
        <div className="p-6 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[600px] selection:bg-[#FA3055] selection:text-white">
          <pre>{activeSnippet.content}</pre>
        </div>

      </div>

    </div>
  );
};
