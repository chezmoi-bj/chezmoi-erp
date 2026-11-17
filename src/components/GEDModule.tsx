import React, { useState } from 'react';
import {
  Layers,
  Search,
  Upload,
  FileText,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { LegalDocument } from '../types';
import { DocumentScanModal } from './DocumentScanModal';

interface GEDModuleProps {
  documents: LegalDocument[];
  onUploadDoc: (doc: LegalDocument) => void;
}

export const GEDModule: React.FC<GEDModuleProps> = ({
  documents,
  onUploadDoc,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(documents[0] || null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const filtered = documents.filter((doc) => {
    const matchesFilter = filterType === 'ALL' || doc.type === filterType;
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      doc.ownerName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Banner */}
      <div className="bg-white dark:bg-[#13161B] rounded-2xl p-6 border border-neutral-200 dark:border-white/10 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-white/10 text-[#141414] dark:text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#141414] dark:text-white tracking-tight">
                GED foncière & sécurisation immobilière
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1.5">
              Classement électronique sécurisé : titres fonciers (ANDF Bénin), attestations de recasement et mandats légaux.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Numériser un document</span>
          </button>
        </div>

        <DocumentScanModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onSaveDocument={(doc) => {
            onUploadDoc(doc);
            setSelectedDoc(doc);
          }}
        />

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-5 border-t border-neutral-200 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'TITRE_FONCIER', 'MANDAT_GESTION', 'ATTESTATION_RECASEMENT', 'PLAN_TOPOGRAPHIQUE'] as const).map((t) => {
              const isActive = filterType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer bg-[#141414] hover:bg-[#2C2C2C] text-white ${
                    isActive ? 'ring-2 ring-offset-2 ring-[#141414] dark:ring-white/40' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {t === 'ALL'
                    ? 'Tous les documents'
                    : t === 'TITRE_FONCIER'
                    ? 'Titres fonciers'
                    : t === 'MANDAT_GESTION'
                    ? 'Mandats'
                    : t === 'ATTESTATION_RECASEMENT'
                    ? 'Recasements'
                    : 'Plans topographiques'}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un propriétaire, un bien..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs py-2 pl-8 pr-4 rounded-xl text-[#141414] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#141414]/20 w-64"
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Documents List (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#13161B] rounded-2xl p-5 border border-neutral-200 dark:border-white/10 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#141414] dark:text-white mb-2 tabular-nums">
            Pièces classées ({filtered.length})
          </h3>

          <div className="space-y-2.5">
            {filtered.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;

              return (
                <a
                  key={doc.id}
                  href={`#doc-${doc.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedDoc(doc);
                  }}
                  className={`block p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#141414] dark:border-white/40 bg-neutral-50 dark:bg-white/5 shadow-xs'
                      : 'border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 bg-white dark:bg-[#181C22]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-white/10 flex items-center justify-center text-[#141414] dark:text-white shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#141414] dark:text-white truncate">{doc.title}</h4>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium truncate mt-0.5">
                          Bien : <strong className="text-[#141414] dark:text-white">{doc.propertyName}</strong>
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Propriétaire : {doc.ownerName} • Ajouté le {doc.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                        doc.status === 'VALIDE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {doc.status.toLowerCase()}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Right Preview Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#13161B] rounded-2xl p-6 border border-neutral-200 dark:border-white/10 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#141414] dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            <span>Contrôle d'authenticité & aperçu</span>
          </h3>

          {selectedDoc ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500 font-bold">
                    Réf. : {selectedDoc.propertyCode}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                    Certifié conforme
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#141414] dark:text-white">{selectedDoc.title}</h4>

                <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Type de document :</span>
                    <strong className="text-[#141414] dark:text-white capitalize">
                      {selectedDoc.type.replace(/_/g, ' ').toLowerCase()}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Propriétaire :</span>
                    <strong className="text-[#141414] dark:text-white">{selectedDoc.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Taille du fichier :</span>
                    <span>{selectedDoc.fileSize}</span>
                  </div>
                  {selectedDoc.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Validité :</span>
                      <strong className="text-[#141414] dark:text-white">{selectedDoc.expiryDate}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-center space-y-2">
                <div className="w-16 h-20 mx-auto bg-white dark:bg-[#13161B] rounded-lg shadow-xs border border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center p-2 text-[8px] text-neutral-400">
                  <div className="w-8 h-1 bg-neutral-300 rounded mb-1" />
                  <div className="w-10 h-1 bg-neutral-200 rounded mb-1" />
                  <div className="w-6 h-1 bg-neutral-200 rounded mb-2" />
                  <div className="w-6 h-6 rounded-full border border-[#141414] dark:border-white flex items-center justify-center text-[#141414] dark:text-white font-bold text-[7px]">
                    ANDF
                  </div>
                </div>
                <p className="text-xs font-bold text-[#141414] dark:text-white">Scellement numérique ANDF Bénin</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Document horodaté et sécurisé dans la base MySQL Cloud Hostinger.
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert(`Téléchargement sécurisé de ${selectedDoc.title}`)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le PDF</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center py-10">Sélectionnez un document.</p>
          )}
        </div>
      </div>
    </div>
  );
};
