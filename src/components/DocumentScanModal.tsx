import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  FileText, 
  Check, 
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Building,
  User
} from 'lucide-react';
import { LegalDocument, DocumentType } from '../types';

interface DocumentScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (doc: LegalDocument) => void;
  propertiesList?: { id: string; title: string; codeReference: string }[];
}

export const DocumentScanModal: React.FC<DocumentScanModalProps> = ({
  isOpen,
  onClose,
  onSaveDocument,
  propertiesList = [],
}) => {
  const [docType, setDocType] = useState<DocumentType>('TITRE_FONCIER');
  const [title, setTitle] = useState('');
  const [propertyName, setPropertyName] = useState(propertiesList[0]?.title || 'Villa duplex - Fidjrossè plage');
  const [propertyCode, setPropertyCode] = useState(propertiesList[0]?.codeReference || 'CM-COT-2026-088');
  const [ownerName, setOwnerName] = useState('M. Dossou Bio');
  const [fileData, setFileData] = useState<{ name: string; size: string; dataUrl: string; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const sizeInMo = (file.size / (1024 * 1024)).toFixed(1);
    const isPdf = file.type === 'application/pdf';

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFileData({
        name: file.name,
        size: `${sizeInMo} Mo (${isPdf ? 'PDF certifié' : 'Image haute résolution'})`,
        dataUrl,
        type: file.type,
      });

      // Auto-remplissage du titre si vide
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setTitle(cleanName);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Veuillez saisir un intitulé pour le document.');
      return;
    }

    const newDoc: LegalDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      type: docType,
      propertyCode: propertyCode.trim() || `CM-COT-2026-${Math.floor(100 + Math.random() * 900)}`,
      propertyName: propertyName.trim() || 'Bien foncier recensé',
      ownerName: ownerName.trim() || 'Propriétaire certifié',
      fileSize: fileData?.size || '2.4 Mo (Numérisation certifiée)',
      status: 'VALIDE',
      uploadedAt: 'À l’instant',
    };

    onSaveDocument(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#12151B] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-[#161B22]">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#FA3055] text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Numériser / Importer un document foncier
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Archivage certifié et rattaché à la fiche du bien
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type de Document */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Type de pièce légale *
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAF9] dark:bg-[#161B22] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
            >
              <option value="TITRE_FONCIER">Titre foncier personnel (ANDF Bénin)</option>
              <option value="MANDAT_GESTION">Mandat de vente ou de gestion locative</option>
              <option value="ATTESTATION_RECASEMENT">Attestation de recasement officielle</option>
              <option value="PLAN_TOPOGRAPHIQUE">Plan topographique ou levé parcellaire</option>
              <option value="CONVENTION_VENTE">Convention de vente notariée ou sous seing privé</option>
              <option value="CNI_PROPRIETAIRE">Pièce d'identité (CIP / CNI / Passeport)</option>
            </select>
          </div>

          {/* Titre du Document */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Intitulé / Nom du document *
            </label>
            <input
              type="text"
              required
              placeholder="ex : Titre Foncier N° 1420 Cotonou Littoral"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAF9] dark:bg-[#161B22] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
            />
          </div>

          {/* Rapprochement Bien / Propriétaire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bien associé
              </label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="ex : Villa Fidjrossè plage"
                className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] dark:bg-[#161B22] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Propriétaire
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="ex : M. Dossou Bio"
                className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] dark:bg-[#161B22] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Zone de téléchargement / Caméra */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Fichier numérisé (PDF ou image HD) *
            </label>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {!fileData ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-white/15 rounded-2xl p-6 text-center space-y-3 bg-slate-50/50 dark:bg-[#161B22]/50">
                <div className="w-12 h-12 rounded-2xl bg-[#FA3055]/10 text-[#FA3055] mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Glissez un fichier ou sélectionnez une action
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Formats acceptés : PDF, JPG, PNG (Max 25 Mo)
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs cursor-pointer transition-all shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir un fichier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scanner avec caméra</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-xs">
                      {fileData.name}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      {fileData.size} • Prêt pour archivage
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFileData(null)}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                >
                  Changer
                </button>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FA3055] hover:bg-[#E02045] text-white font-bold cursor-pointer shadow-sm transition-all"
            >
              Enregistrer dans la GED
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
