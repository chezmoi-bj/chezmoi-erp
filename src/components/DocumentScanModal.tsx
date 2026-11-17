import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  FileText,
  AlertCircle,
  FileCheck,
  ShieldCheck,
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

      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Numériser ou importer un document foncier"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-[#FAFAFA] dark:bg-[#181C22]">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#141414] text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-[#141414] dark:text-white">
                Numériser / Importer un document foncier
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Archivage certifié et rattaché à la fiche du bien
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
              Type de pièce légale *
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold text-[#141414] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#141414]/25"
            >
              <option value="TITRE_FONCIER">Titre foncier personnel (ANDF Bénin)</option>
              <option value="MANDAT_GESTION">Mandat de vente ou de gestion locative</option>
              <option value="ATTESTATION_RECASEMENT">Attestation de recasement officielle</option>
              <option value="PLAN_TOPOGRAPHIQUE">Plan topographique ou levé parcellaire</option>
              <option value="CONVENTION_VENTE">Convention de vente notariée ou sous seing privé</option>
              <option value="CNI_PROPRIETAIRE">Pièce d'identité (CIP / CNI / Passeport)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Intitulé / Nom du document *
            </label>
            <input
              type="text"
              required
              placeholder="ex : Titre Foncier N° 1420 Cotonou Littoral"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-medium text-[#141414] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#141414]/25"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Bien associé
              </label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="ex : Villa Fidjrossè plage"
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs text-[#141414] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Propriétaire
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="ex : M. Dossou Bio"
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs text-[#141414] dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Fichier numérisé (PDF ou image HD) *
            </label>

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
              <div className="border-2 border-dashed border-neutral-200 dark:border-white/15 rounded-xl p-6 text-center space-y-3 bg-[#FAFAFA] dark:bg-[#181C22]">
                <div className="w-12 h-12 rounded-full bg-neutral-200/70 dark:bg-white/10 text-[#141414] dark:text-white mx-auto flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-[#141414] dark:text-white text-xs">
                    Glissez un fichier ou sélectionnez une action
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Formats acceptés : PDF, JPG, PNG (Max 25 Mo)
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir un fichier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scanner avec caméra</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#141414] text-white flex items-center justify-center shrink-0 font-bold">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#141414] dark:text-white truncate text-xs">{fileData.name}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      {fileData.size} • Prêt pour archivage
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFileData(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Changer
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold cursor-pointer shadow-xs transition-colors"
            >
              Enregistrer dans la GED
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
