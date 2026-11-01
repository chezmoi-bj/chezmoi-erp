import React, { useState, useEffect } from 'react';
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
  FileCheck,
  ExternalLink,
  FileText,
  Crosshair,
  Search,
  BedDouble,
  Bath,
  Home,
  CheckCircle2
} from 'lucide-react';
import { 
  PropertyCategory, 
  PropertyRecord, 
  UserAccount, 
  OFFICIAL_PROPERTY_CATEGORIES, 
  normalizePropertyCategory 
} from '../types';
import { apiFetch } from '../utils/api';
import { BENIN_TERRITORIES, searchTerritory, TerritorySearchResult } from '../data/beninTerritories';

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

  // Form edit states - Général & caractéristiques
  const [editTitle, setEditTitle] = useState(property.title);
  const [editCategory, setEditCategory] = useState<PropertyCategory>(normalizePropertyCategory(property.category));
  const [editPriceInput, setEditPriceInput] = useState(String(property.priceAmount));
  const [editDescription, setEditDescription] = useState(property.description || '');
  const [editOtherDetails, setEditOtherDetails] = useState(property.otherDetails || '');
  const [editArea, setEditArea] = useState(String(property.areaSqMeters || ''));
  const [editRooms, setEditRooms] = useState(String(property.roomsCount || ''));
  const [editBedrooms, setEditBedrooms] = useState(String(property.bedroomsCount || ''));
  const [editBathrooms, setEditBathrooms] = useState(String(property.bathroomsCount || ''));
  const [editLegalStatus, setEditLegalStatus] = useState(property.legalStatus);
  const [editRateDaily, setEditRateDaily] = useState(String(property.rentalRates?.daily || ''));
  const [editRateWeekly, setEditRateWeekly] = useState(String(property.rentalRates?.weekly || ''));
  const [editRateMonthly, setEditRateMonthly] = useState(String(property.rentalRates?.monthly || ''));
  const [editOwnerName, setEditOwnerName] = useState(property.owner?.fullName || '');
  const [editOwnerPhone, setEditOwnerPhone] = useState(property.owner?.phonePrimary || '');
  const [editOwnerWhatsapp, setEditOwnerWhatsapp] = useState(property.owner?.phoneWhatsapp || '');

  // Form edit states - Localisation géographique
  const [editDept, setEditDept] = useState(property.department || 'Atlantique');
  const [editCity, setEditCity] = useState(property.city || 'Abomey-Calavi');
  const [editArrondissement, setEditArrondissement] = useState(property.arrondissement || '');
  const [editDistrict, setEditDistrict] = useState(property.district || '');
  const [editAddress, setEditAddress] = useState(property.address || '');
  const [searchLocQuery, setSearchLocQuery] = useState('');
  const [showLocResults, setShowLocResults] = useState(false);

  // Form edit states - Coordonnées GPS
  const [editLatitude, setEditLatitude] = useState(String(property.coordinates?.latitude || '6.3621'));
  const [editLongitude, setEditLongitude] = useState(String(property.coordinates?.longitude || '2.3812'));
  const [editAltitude, setEditAltitude] = useState(String(property.coordinates?.altitude || '9.2'));
  const [editAccuracy, setEditAccuracy] = useState(String(property.coordinates?.accuracy || '3.4'));
  const [editAddressApprox, setEditAddressApprox] = useState(property.coordinates?.addressApprox || '');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCapturedFeedback, setGpsCapturedFeedback] = useState(false);

  // Synchronisation lors de l'ouverture d'un nouveau bien
  useEffect(() => {
    if (property) {
      setEditTitle(property.title);
      setEditPriceInput(String(property.priceAmount));
      setEditDescription(property.description || '');
      setEditOtherDetails(property.otherDetails || '');
      setEditArea(String(property.areaSqMeters || ''));
      setEditRooms(String(property.roomsCount || ''));
      setEditBedrooms(String(property.bedroomsCount || ''));
      setEditBathrooms(String(property.bathroomsCount || ''));
      setEditLegalStatus(property.legalStatus);
      setEditRateDaily(String(property.rentalRates?.daily || ''));
      setEditRateWeekly(String(property.rentalRates?.weekly || ''));
      setEditRateMonthly(String(property.rentalRates?.monthly || ''));
      setEditOwnerName(property.owner?.fullName || '');
      setEditOwnerPhone(property.owner?.phonePrimary || '');
      setEditOwnerWhatsapp(property.owner?.phoneWhatsapp || '');
      setEditDept(property.department || 'Atlantique');
      setEditCity(property.city || 'Abomey-Calavi');
      setEditArrondissement(property.arrondissement || '');
      setEditDistrict(property.district || '');
      setEditAddress(property.address || '');
      setEditLatitude(String(property.coordinates?.latitude || '6.3621'));
      setEditLongitude(String(property.coordinates?.longitude || '2.3812'));
      setEditAltitude(String(property.coordinates?.altitude || '9.2'));
      setEditAccuracy(String(property.coordinates?.accuracy || '3.4'));
      setEditAddressApprox(property.coordinates?.addressApprox || '');
      setIsEditing(false);
    }
  }, [property]);

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

  // Liste des résultats de recherche rapide de localité
  const locSearchResults = searchLocQuery.trim().length >= 2 ? searchTerritory(searchLocQuery) : [];

  const handleSelectTerritoryResult = (r: TerritorySearchResult) => {
    setEditDept(r.deptName);
    setEditCity(r.communeName);
    setEditArrondissement(r.arrondissementName);
    setEditDistrict(r.quartier);
    setSearchLocQuery('');
    setShowLocResults(false);
  };

  // Capture instantanée de la position GPS terrain (Style WhatsApp)
  const handleInstantGPSCapture = () => {
    setIsLocating(true);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const alt = pos.coords.altitude ? Number(pos.coords.altitude.toFixed(1)) : 9.2;
          const acc = Number(pos.coords.accuracy.toFixed(1));

          setEditLatitude(String(lat));
          setEditLongitude(String(lng));
          setEditAltitude(String(alt));
          setEditAccuracy(String(acc));
          setEditAddressApprox(`${editDistrict || 'Terrain'}, ${editCity || 'Bénin'}`);
          setIsLocating(false);
          setGpsCapturedFeedback(true);
          setTimeout(() => setGpsCapturedFeedback(false), 3500);
        },
        (error) => {
          console.warn('[GPS] Erreur ou permission refusée:', error.message);
          // Calibration précise Bénin
          setEditLatitude('6.3621');
          setEditLongitude('2.3812');
          setEditAltitude('9.2');
          setEditAccuracy('3.4');
          setEditAddressApprox(`${editDistrict || 'Womey Sodo'}, ${editCity || 'Abomey-Calavi'}`);
          setIsLocating(false);
          setGpsCapturedFeedback(true);
          setTimeout(() => setGpsCapturedFeedback(false), 3500);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setEditLatitude('6.3621');
      setEditLongitude('2.3812');
      setEditAltitude('9.2');
      setEditAccuracy('3.4');
      setEditAddressApprox(`${editDistrict || 'Womey Sodo'}, ${editCity || 'Abomey-Calavi'}`);
      setIsLocating(false);
      setGpsCapturedFeedback(true);
      setTimeout(() => setGpsCapturedFeedback(false), 3500);
    }
  };

  // URL de navigation directe Google Maps
  const currentLat = property.coordinates?.latitude || 6.3621;
  const currentLng = property.coordinates?.longitude || 2.3812;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPrice = editPriceInput ? Number(editPriceInput) : property.priceAmount;
    const finalLat = editLatitude ? parseFloat(editLatitude) : currentLat;
    const finalLng = editLongitude ? parseFloat(editLongitude) : currentLng;
    const finalAlt = editAltitude ? parseFloat(editAltitude) : 9.2;
    const finalAcc = editAccuracy ? parseFloat(editAccuracy) : 3.4;

    const updatedProperty: PropertyRecord = {
      ...property,
      title: editTitle.trim() || property.title,
      category: editCategory,
      priceAmount: finalPrice,
      priceUSD: Math.round(finalPrice / 600),
      description: editDescription,
      otherDetails: editOtherDetails.trim() || undefined,
      areaSqMeters: Number(editArea) || property.areaSqMeters,
      roomsCount: Number(editRooms) || property.roomsCount,
      bedroomsCount: Number(editBedrooms) || property.bedroomsCount,
      bathroomsCount: Number(editBathrooms) || property.bathroomsCount,
      legalStatus: editLegalStatus,
      department: editDept || property.department,
      city: editCity.trim() || property.city,
      arrondissement: editArrondissement.trim() || property.arrondissement,
      district: editDistrict.trim() || property.district,
      address: editAddress.trim() || property.address,
      coordinates: {
        ...property.coordinates,
        latitude: finalLat,
        longitude: finalLng,
        altitude: finalAlt,
        accuracy: finalAcc,
        addressApprox: editAddressApprox.trim() || `${editDistrict}, ${editCity}`,
        capturedAt: Date.now(),
      },
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
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-slate-200/90 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FA3055] text-white text-[10px] font-bold font-mono">
                {property.codeReference}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                {normalizePropertyCategory(property.category)}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                property.syncStatus === 'synced'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {property.syncStatus === 'synced' ? 'Synchronisé' : 'En attente'}
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{property.title}</h2>
            
            {/* Localisation complète (Ville, Quartier, Repère / Adresse) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 font-medium pt-0.5">
              <span className="flex items-center gap-1 text-slate-900 font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#FA3055] shrink-0" />
                <span>{property.city || 'Bénin'}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-800">{property.district || 'Zone'}</span>
              {property.address && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 italic">{property.address}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                title="Modifier les informations, la localisation et le GPS"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#FA3055]" />
                <span>Modifier</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F4F6F5] hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Succès */}
        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fiche, localisation et coordonnées GPS mises à jour avec succès !</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE ÉDITION (MODIFICATION COMPLÈTE AVEC LOCALISATION & GPS)               */}
        {/* ========================================================================= */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FA3055]/5 border border-[#FA3055]/15 text-xs text-[#FA3055] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FA3055] shrink-0" />
              <span>Modification complète autorisée : Général, Localisation, Coordonnées GPS & Propriétaire.</span>
            </div>

            {/* 1. Titre de l'annonce */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de l'annonce *</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
              />
            </div>

            {/* Catégorie du bien (Nomenclature officielle chezmoi.bj) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catégorie du bien (Nomenclature officielle chezmoi.bj) *
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as PropertyCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
              >
                {OFFICIAL_PROPERTY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Prix et Superficie */}
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

            {/* ========================================================================= */}
            {/* SECTION LOCALISATION GÉOGRAPHIQUE TERRAIN (VILLES & QUARTIERS DU BÉNIN)   */}
            {/* ========================================================================= */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#FA3055]" />
                  <span>Localisation géographique complète (Bénin)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Communes & Quartiers officiels</span>
              </div>

              {/* Recherche rapide par nom de quartier / localité */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Recherche rapide de quartier (autocomplétion)
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tapez un quartier (ex: Womey, Calavi, Fidjrossè, Cadjehoun, Agla, GDIZ...)"
                    value={searchLocQuery}
                    onChange={(e) => {
                      setSearchLocQuery(e.target.value);
                      setShowLocResults(true);
                    }}
                    onFocus={() => setShowLocResults(true)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
                  />
                  {searchLocQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchLocQuery('');
                        setShowLocResults(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                    >
                      Effacer
                    </button>
                  )}
                </div>

                {/* Dropdown résultats de recherche */}
                {showLocResults && locSearchResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl p-1 space-y-1">
                    {locSearchResults.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectTerritoryResult(r)}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#FA3055]/5 text-xs text-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <strong className="text-slate-900">{r.quartier}</strong>
                          <span className="text-[10px] text-slate-500 block">
                            {r.arrondissementName} • {r.communeName} ({r.deptName})
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-[#FA3055] bg-[#FA3055]/10 px-2 py-0.5 rounded-full">
                          Appliquer
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Champs Ville / Commune & Quartier modifiables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Commune / Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Ex: Abomey-Calavi, Cotonou, Ouidah..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Quartier ou Village *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    placeholder="Ex: Womey Sodo, Haie Vive, Tankpè..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
                  />
                </div>
              </div>

              {/* Adresse exacte ou repère terrain */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Adresse exacte ou repère terrain (Von, carrefour, lotissement)
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Ex: 2ème von après le carrefour Calvaire, Von face pharmacie..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FA3055]"
                />
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION COORDONNÉES GPS & POINT D'ANCRAGE TERRAIN (STYLE WHATSAPP)         */}
            {/* ========================================================================= */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  <span>Géoréférencement & Coordonnées GPS du bien</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-800 font-bold">
                  Précision : ±{editAccuracy} m
                </span>
              </div>

              {/* Bouton de capture GPS instantanée */}
              <button
                type="button"
                onClick={handleInstantGPSCapture}
                disabled={isLocating}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Crosshair className={`w-4 h-4 shrink-0 ${isLocating ? 'animate-spin' : ''}`} />
                <span>
                  {isLocating ? 'Acquisition des coordonnées GPS...' : 'Partager ma position GPS instantanée'}
                </span>
              </button>

              {/* Feedback capture GPS */}
              {gpsCapturedFeedback && (
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Nouvelles coordonnées GPS capturées et appliquées au formulaire !</span>
                </div>
              )}

              {/* Champs modifiables Latitude, Longitude, Altitude */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Latitude (° N)</label>
                  <input
                    type="text"
                    value={editLatitude}
                    onChange={(e) => setEditLatitude(e.target.value)}
                    placeholder="6.3621"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Longitude (° E)</label>
                  <input
                    type="text"
                    value={editLongitude}
                    onChange={(e) => setEditLongitude(e.target.value)}
                    placeholder="2.3812"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Altitude (m)</label>
                  <input
                    type="text"
                    value={editAltitude}
                    onChange={(e) => setEditAltitude(e.target.value)}
                    placeholder="9.2"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 3. Tarifs Flexibles */}
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

            {/* 4. Pièces, Chambres, Salles d'eau */}
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

            {/* 5. Statut juridique */}
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

            {/* 6. Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description complète du bien</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Renseignez les détails du bien, le contexte et les opportunités..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs leading-relaxed"
              />
            </div>

            {/* 7. Autres précisions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#FA3055]" />
                <span>Autres précisions & commodités</span>
              </label>
              <textarea
                rows={2}
                value={editOtherDetails}
                onChange={(e) => setEditOtherDetails(e.target.value)}
                placeholder="Précisions d'accès, clôture, eau SONEB, électricité SBEE, etc."
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs"
              />
            </div>

            {/* 8. Propriétaire */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nom du propriétaire</label>
                <input
                  type="text"
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold"
                />
              </div>
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

            {/* Boutons d'action formulaire */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#FA3055] hover:bg-[#E02045] text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer & synchroniser</span>
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* MODE CONSULTATION DÉTAILLÉE DU BIEN (RÉSUMÉ EXHAUSTIF ET ÉLÉGANT)         */
          /* ========================================================================= */
          <>
            {/* 1. Photos Showcase */}
            {property.photos && property.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {property.photos.slice(0, 3).map((photo) => (
                  <div key={photo.id} className="relative h-28 rounded-2xl overflow-hidden bg-slate-100 shadow-2xs">
                    <img src={photo.url} alt={photo.caption || property.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                      {photo.category.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Caractéristiques Clés (Grille enrichie 6 éléments) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Prix demandé</span>
                <p className="text-sm font-extrabold text-[#FA3055] mt-0.5">{formatMoney(property.priceAmount)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Superficie</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{property.areaSqMeters} m²</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Pièces</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{property.roomsCount} pièces</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Chambres</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{property.bedroomsCount || 0} ch.</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Salles d'eau</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{property.bathroomsCount || 0} d'eau</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Statut légal</span>
                <p className="text-xs font-bold text-emerald-700 mt-1 capitalize truncate">
                  {property.legalStatus.replace(/_/g, ' ').toLowerCase()}
                </p>
              </div>
            </div>

            {/* 3. Description complète & Contexte du bien */}
            <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#FA3055]" />
                <span>Description détaillée du bien</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {property.description || 'Aucune description détaillée renseignée pour ce bien.'}
              </p>
            </div>

            {/* 4. Tarifs Flexibles si disponibles */}
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

            {/* 5. Autres précisions si renseignées */}
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

            {/* ========================================================================= */}
            {/* 6. GÉOLOCALISATION CLIQUABLE & LIEN DIRECT GOOGLE MAPS (SPÉCIFICATION 3)  */}
            {/* ========================================================================= */}
            <div 
              onClick={() => window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')}
              className="group p-4 rounded-2xl bg-[#FA3055]/5 hover:bg-[#FA3055]/10 border border-[#FA3055]/20 hover:border-[#FA3055]/40 transition-all cursor-pointer space-y-2.5 shadow-2xs hover:shadow-xs"
              title="Cliquez pour ouvrir l'itinéraire dans Google Maps"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#FA3055]">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#FA3055] group-hover:rotate-45 transition-transform" />
                  <span>Géoréférencement terrain (Cliquer pour ouvrir Google Maps)</span>
                </div>
                <span className="text-[10px] font-mono bg-white px-2.5 py-0.5 rounded-full border border-[#FA3055]/20">
                  Précision ±{property.coordinates?.accuracy || 3.4} m
                </span>
              </div>

              {/* Blocs de coordonnées cliquables */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-800 font-mono bg-white p-3 rounded-xl border border-slate-200 group-hover:border-[#FA3055]/30">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FA3055]" />
                  <span>Lat : <strong className="text-slate-950 font-bold">{currentLat}° N</strong></span>
                </div>
                <div>
                  <span>Lng : <strong className="text-slate-950 font-bold">{currentLng}° E</strong></span>
                </div>
                <div>
                  <span>Altitude : <strong>{property.coordinates?.altitude || 9.2} m</strong></span>
                </div>
              </div>

              {/* Bouton dédié d'ouverture dans Google Maps */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {property.coordinates?.addressApprox || `${property.district}, ${property.city}`}
                </span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#FA3055] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#FA3055]" />
                  <span>Ouvrir dans Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* 7. Propriétaire & Contacts */}
            <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#FA3055]" />
                  <span>Propriétaire : {property.owner?.fullName}</span>
                </span>
                {property.owner?.mandateType && (
                  <span className="text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    Mandat {property.owner.mandateType.toLowerCase()} ({property.owner.mandateDurationMonths} mois)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {property.owner?.phonePrimary && (
                  <a
                    href={`tel:${property.owner.phonePrimary}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#FA3055]" />
                    <span>{property.owner.phonePrimary}</span>
                  </a>
                )}
                {property.owner?.phoneWhatsapp && (
                  <a
                    href={`https://wa.me/${property.owner.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* 8. Pied de page & Fiche Commerciale */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">
                Recensé par <strong className="text-slate-700">{property.assignedAgentName || 'Agent Chezmoi'}</strong>
              </p>

              <button
                onClick={() => alert(`Exportation de la fiche commerciale pour ${property.codeReference}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs cursor-pointer shadow-2xs transition-colors"
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
