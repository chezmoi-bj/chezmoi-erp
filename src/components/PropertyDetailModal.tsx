import React from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  User, 
  Compass, 
  Download 
} from 'lucide-react';
import { PropertyRecord } from '../types';

interface PropertyDetailModalProps {
  property: PropertyRecord | null;
  onClose: () => void;
  currency: 'FCFA' | 'USD';
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  currency,
}) => {
  if (!property) return null;

  const formatMoney = (amountXOF: number) => {
    if (currency === 'USD') {
      const usd = Math.round(amountXOF / 600);
      return `$${usd.toLocaleString('en-US')}`;
    }
    return `${amountXOF.toLocaleString('fr-FR')} FCFA`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FA3055] text-white text-[10px] font-bold font-mono">
                {property.codeReference}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                property.syncStatus === 'synced'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {property.syncStatus === 'synced' ? 'Synchronisé Cloud (MySQL)' : 'En attente de sync (Drift)'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{property.title}</h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.address || `${property.district}, ${property.city}`}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F6F5] hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photos Showcase */}
        <div className="grid grid-cols-3 gap-2">
          {property.photos.slice(0, 3).map((photo) => (
            <div key={photo.id} className="relative h-28 rounded-2xl overflow-hidden bg-slate-100">
              <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
              <span className="absolute bottom-1.5 left-1.5 px-2 py-0.2 rounded bg-black/60 text-white text-[9px] font-bold">
                {photo.category.toLowerCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Key Features Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-semibold">Prix demandé</span>
            <p className="text-sm font-bold text-[#FA3055] mt-0.5">{formatMoney(property.priceAmount)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-semibold">Superficie</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{property.areaSqMeters} m²</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-semibold">Pièces</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{property.roomsCount} pièces</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-semibold">Statut légal</span>
            <p className="text-xs font-bold text-emerald-700 mt-1">{property.legalStatus.replace(/_/g, ' ').toLowerCase()}</p>
          </div>
        </div>

        {/* GPS Georeference Box */}
        <div className="p-4 rounded-2xl bg-[#FA3055]/5 border border-[#FA3055]/15 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#FA3055]">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#FA3055]" />
              <span>Géoréférencement satellite du relevé terrain</span>
            </span>
            <span className="text-[10px] font-mono">Précision ±{property.coordinates.accuracy} m</span>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 font-mono bg-white p-2.5 rounded-xl border border-slate-200">
            <span>Lat : {property.coordinates.latitude}° N</span>
            <span>Lng : {property.coordinates.longitude}° E</span>
            <span>Altitude : {property.coordinates.altitude || 10} m</span>
          </div>
        </div>

        {/* Owner Details */}
        <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#FA3055]" />
              <span>Propriétaire ou représentant : {property.owner.fullName}</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              Mandat {property.owner.mandateType.toLowerCase()} ({property.owner.mandateDurationMonths} mois)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${property.owner.phonePrimary}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
            >
              <Phone className="w-3.5 h-3.5 text-[#FA3055]" />
              <span>{property.owner.phonePrimary}</span>
            </a>
            <a
              href={`https://wa.me/${property.owner.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discuter sur WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Recensé par <strong className="text-slate-700">{property.assignedAgentName}</strong>
          </p>

          <button
            onClick={() => alert(`Exportation de la fiche PDF normalisée pour ${property.codeReference}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#FA3055]" />
            <span>Fiche commerciale PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
