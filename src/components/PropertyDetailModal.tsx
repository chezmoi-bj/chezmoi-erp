import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  User, 
  Compass, 
  Download,
  Edit3,
  Save,
  Check,
  Calendar,
  FileCheck
} from 'lucide-react';
import { PropertyRecord, UserAccount } from '../types';
import { apiFetch } from '../utils/api';

interface PropertyDetailModalProps {
  property: PropertyRecord | null;
  onClose: () => void;
  currency: 'FCFA' | 'USD';
  currentUser?: UserAccount;
  onUpdateProperty?: (updated: PropertyRecord) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  currency,
  currentUser,
  onUpdateProperty,
}) => {
  if (!property) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form edit states
  const [editTitle, setEditTitle] = useState(property.title);
  const [editPriceInput, setEditPriceInput] = useState(String(property.priceAmount));
  const [editDescription, setEditDescription] = useState(property.description);
  const [editOtherDetails, setEditOtherDetails] = useState(property.otherDetails || '');
  const [editArea, setEditArea] = useState(String(property.areaSqMeters));
  const [editRooms, setEditRooms] = useState(String(property.roomsCount));
  const [editBedrooms, setEditBedrooms] = useState(String(property.bedroomsCount));
  const [editBathrooms, setEditBathrooms] = useState(String(property.bathroomsCount));
  const [editLegalStatus, setEditLegalStatus] = useState(property.legalStatus);
  const [editRateDaily, setEditRateDaily] = useState(String(property.rentalRates?.daily || ''));
  const [editRateWeekly, setEditRateWeekly] = useState(String(property.rentalRates?.weekly || ''));
  const [editRateMonthly, setEditRateMonthly] = useState(String(property.rentalRates?.monthly || ''));
  const [editOwnerName, setEditOwnerName] = useState(property.owner.fullName);
  const [editOwnerPhone, setEditOwnerPhone] = useState(property.owner.phonePrimary);
  const [editOwnerWhatsapp, setEditOwnerWhatsapp] = useState(property.owner.phoneWhatsapp);

  // Permission de modification : Recenseur lui-même, Secrétaire ou Administrateurs
  const canEdit = currentUser ? (
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'SECRETAIRE' ||
    currentUser.id === property.assignedAgentId
  ) : false;

  const formatMoney = (amountXOF: number) => {
    if (currency === 'USD') {
      const usd = Math.round(amountXOF / 600);
      return `$${usd.toLocaleString('en-US')}`;
    }
    return `${amountXOF.toLocaleString('fr-FR')} FCFA`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPrice = editPriceInput ? Number(editPriceInput) : property.priceAmount;
    const updatedProperty: PropertyRecord = {
      ...property,
      title: editTitle.trim() || property.title,
      priceAmount: finalPrice,
      priceUSD: Math.round(finalPrice / 600),
      description: editDescription,
      otherDetails: editOtherDetails.trim() || undefined,
      areaSqMeters: Number(editArea) || property.areaSqMeters,
      roomsCount: Number(editRooms) || property.roomsCount,
      bedroomsCount: Number(editBedrooms) || property.bedroomsCount,
      bathroomsCount: Number(editBathrooms) || property.bathroomsCount,
      legalStatus: editLegalStatus,
      rentalRates: {
        daily: editRateDaily ? Number(editRateDaily) : undefined,
        weekly: editRateWeekly ? Number(editRateWeekly) : undefined,
        monthly: editRateMonthly ? Number(editRateMonthly) : undefined,
      },
      owner: {
        ...property.owner,
        fullName: editOwnerName,
        phonePrimary: editOwnerPhone,
        phoneWhatsapp: editOwnerWhatsapp,
      },
      updatedAt: Date.now(),
      syncStatus: 'synced',
    };

    if (onUpdateProperty) {
      onUpdateProperty(updatedProperty);
    }

    // Synchronisation automatique directe vers MySQL
    try {
      await apiFetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProperty),
      });
    } catch (err) {
      console.error('Erreur synchronisation mise à jour:', err);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-slate-200/90 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
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
                {property.syncStatus === 'synced' ? 'Synchronisé' : 'En attente'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{property.title}</h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.address || `${property.district}, ${property.city}`}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                title="Modifier cette fiche de recensement"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#FA3055]" />
                <span>Modifier</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F4F6F5] hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Succès */}
        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Fiche modifiée et synchronisée avec succès !</span>
          </div>
        )}

        {/* MODE ÉDITION */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FA3055]/5 border border-[#FA3055]/15 text-xs text-[#FA3055] font-semibold">
              Modification autorisée pour : Recenseur assigné, Secrétaire ou Administrateur.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de l'annonce</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Prix demandé (FCFA) *</span>
                  <span className="text-[10px] text-[#FA3055] font-mono font-bold">
                    {editPriceInput ? Number(editPriceInput).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'}
                  </span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={editPriceInput}
                  onChange={(e) => setEditPriceInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-extrabold text-[#FA3055] focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Superficie (m²)</label>
                <input
                  type="number"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
                />
              </div>
            </div>

            {/* Tarifs Flexibles */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FA3055]" />
                <span>Tarification flexible (Forfaits locations & meublés)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Journalier (FCFA)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editRateDaily}
                    onChange={(e) => setEditRateDaily(e.target.value.replace(/\D/g, ''))}
                    placeholder="35000"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Hebdomadaire (FCFA)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editRateWeekly}
                    onChange={(e) => setEditRateWeekly(e.target.value.replace(/\D/g, ''))}
                    placeholder="200000"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Mensuel (FCFA)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editRateMonthly}
                    onChange={(e) => setEditRateMonthly(e.target.value.replace(/\D/g, ''))}
                    placeholder="650000"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Pièces */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pièces</label>
                <input
                  type="number"
                  value={editRooms}
                  onChange={(e) => setEditRooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Chambres</label>
                <input
                  type="number"
                  value={editBedrooms}
                  onChange={(e) => setEditBedrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Salles d'eau</label>
                <input
                  type="number"
                  value={editBathrooms}
                  onChange={(e) => setEditBathrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Statut juridique</label>
              <select
                value={editLegalStatus}
                onChange={(e) => setEditLegalStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold text-slate-900"
              >
                <option value="TITRE_FONCIER">Titre Foncier individuel (ANDF)</option>
                <option value="ATTESTATION_RECASEMENT">Attestation de recasement</option>
                <option value="CONCESSION">Convention de vente avec tampon mairie</option>
                <option value="EN_COURS">Titre foncier en cours d'immatriculation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#FA3055]" />
                <span>Autres précisions</span>
              </label>
              <textarea
                rows={2}
                value={editOtherDetails}
                onChange={(e) => setEditOtherDetails(e.target.value)}
                placeholder="Précisions de confort, accès, équipements..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Téléphone propriétaire</label>
                <input
                  type="tel"
                  value={editOwnerPhone}
                  onChange={(e) => setEditOwnerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">WhatsApp propriétaire</label>
                <input
                  type="tel"
                  value={editOwnerWhatsapp}
                  onChange={(e) => setEditOwnerWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#FA3055] hover:bg-[#E02045] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer & synchroniser</span>
              </button>
            </div>
          </form>
        ) : (
          /* MODE AFFICHAGE */
          <>
            {/* Photos Showcase */}
            {property.photos && property.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {property.photos.slice(0, 3).map((photo) => (
                  <div key={photo.id} className="relative h-28 rounded-2xl overflow-hidden bg-slate-100">
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                      {photo.category.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}

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

            {/* Tarifs Flexibles si disponibles */}
            {property.rentalRates && (property.rentalRates.daily || property.rentalRates.weekly || property.rentalRates.monthly) && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FA3055]" />
                  <span>Tarifs flexibles & séjours modulables :</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {property.rentalRates.daily && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Par jour / nuitée</span>
                      <strong className="text-xs font-bold text-slate-800">{formatMoney(property.rentalRates.daily)}</strong>
                    </div>
                  )}
                  {property.rentalRates.weekly && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Par semaine</span>
                      <strong className="text-xs font-bold text-slate-800">{formatMoney(property.rentalRates.weekly)}</strong>
                    </div>
                  )}
                  {property.rentalRates.monthly && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Par mois</span>
                      <strong className="text-xs font-bold text-slate-800">{formatMoney(property.rentalRates.monthly)}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Autres précisions si renseignées */}
            {property.otherDetails && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#FA3055]" />
                  <span>Autres précisions & commodités :</span>
                </span>
                <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                  {property.otherDetails}
                </p>
              </div>
            )}

            {/* GPS Georeference Box */}
            <div className="p-4 rounded-2xl bg-[#FA3055]/5 border border-[#FA3055]/15 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#FA3055]">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#FA3055]" />
                  <span>Géoréférencement terrain</span>
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
                  <span>Propriétaire : {property.owner.fullName}</span>
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
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">
                Recensé par <strong className="text-slate-700">{property.assignedAgentName}</strong>
              </p>

              <button
                onClick={() => alert(`Exportation de la fiche commerciale pour ${property.codeReference}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Fiche commerciale</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
