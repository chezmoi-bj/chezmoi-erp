import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Download 
} from 'lucide-react';
import { LegalDocument } from '../types';

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

  const filtered = documents.filter((doc) => {
    const matchesFilter = filterType === 'ALL' || doc.type === filterType;
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      doc.ownerName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FA3055] text-white flex items-center justify-center font-bold">
                <Layers className="w-4 h-4 text-[#FA3055]" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                GED foncière & sécurisation immobilière
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Classement électronique sécurisé : titres fonciers (ANDF Bénin), attestations de recasement et mandats légaux.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newDoc: LegalDocument = {
                  id: `doc_${Date.now()}`,
                  title: 'Convention de vente notariée Fidjrossè',
                  type: 'CONVENTION_VENTE',
                  propertyCode: 'CM-COT-2026-088',
                  propertyName: 'Villa duplex Fidjrossè plage',
                  ownerName: 'M. Dossou Bio',
                  fileSize: '3.1 Mo (PDF certifié)',
                  status: 'VALIDE',
                  uploadedAt: 'Aujourd’hui',
                };
                onUploadDoc(newDoc);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#FA3055]" />
              <span>Numériser un document</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'TITRE_FONCIER', 'MANDAT_GESTION', 'ATTESTATION_RECASEMENT', 'PLAN_TOPOGRAPHIQUE'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === t
                    ? 'bg-[#FA3055] text-white shadow-2xs font-bold'
                    : 'bg-[#F4F6F5] text-slate-600 hover:bg-slate-200'
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
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un propriétaire, un bien..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#F4F6F5] text-xs py-1.5 pl-8 pr-4 rounded-full text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FA3055] w-64"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Documents List & Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Documents Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            Pièces classées ({filtered.length})
          </h3>

          <div className="space-y-2.5">
            {filtered.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#FA3055] bg-[#FA3055]/5 shadow-2xs'
                      : 'border-slate-100 hover:border-slate-200 bg-[#F9FAF9]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#FA3055]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h4>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          Bien : <strong>{doc.propertyName}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Propriétaire : {doc.ownerName} • Ajouté le {doc.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      doc.status === 'VALIDE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {doc.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Preview Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FA3055]" />
            <span>Contrôle d'authenticité & aperçu</span>
          </h3>

          {selectedDoc ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">Réf. : {selectedDoc.propertyCode}</span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Certifié conforme
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{selectedDoc.title}</h4>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type de document :</span>
                    <strong className="text-slate-800">{selectedDoc.type.replace(/_/g, ' ').toLowerCase()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Propriétaire :</span>
                    <strong className="text-slate-800">{selectedDoc.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Taille du fichier :</span>
                    <span>{selectedDoc.fileSize}</span>
                  </div>
                  {selectedDoc.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Validité :</span>
                      <strong className="text-slate-800">{selectedDoc.expiryDate}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulated Document Preview Page */}
              <div className="p-4 rounded-2xl bg-[#F4F6F5] border border-slate-200 text-center space-y-2">
                <div className="w-16 h-20 mx-auto bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center p-2 text-[8px] text-slate-400">
                  <div className="w-8 h-1 bg-slate-300 rounded mb-1" />
                  <div className="w-10 h-1 bg-slate-200 rounded mb-1" />
                  <div className="w-6 h-1 bg-slate-200 rounded mb-2" />
                  <div className="w-6 h-6 rounded-full border border-[#FA3055] flex items-center justify-center text-[#FA3055] font-bold text-[7px]">
                    ANDF
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-800">Scellement numérique ANDF Bénin</p>
                <p className="text-[10px] text-slate-500">
                  Document horodaté et sécurisé dans la base MySQL Cloud Hostinger.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Téléchargement sécurisé de ${selectedDoc.title}`)}
                  className="flex-1 py-2.5 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#FA3055]" />
                  <span>Télécharger le PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-10">Sélectionnez un document.</p>
          )}
        </div>

      </div>

    </div>
  );
};
