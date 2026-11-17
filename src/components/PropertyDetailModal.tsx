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
  CheckCircle2,
  Trash2,
  Building2,
} from 'lucide-react';
import {
  PropertyCategory,
  PropertyRecord,
  UserAccount,
  OFFICIAL_PROPERTY_CATEGORIES,
  normalizePropertyCategory,
  PropertyOperationalStatus,
  OPERATIONAL_STATUS_CONFIG,
  getPropertyStatus,
} from '../types';
import { apiFetch } from '../utils/api';
import { searchTerritory, TerritorySearchResult } from '../data/beninTerritories';

interface PropertyDetailModalProps {
  property: PropertyRecord | null;
  onClose: () => void;
  currency: 'FCFA' | 'USD';
  currentUser?: UserAccount;
  onUpdateProperty?: (updated: PropertyRecord) => void;
  onDeleteProperty?: (id: string) => Promise<void> | void;
  onUpdatePropertyStatus?: (id: string, status: PropertyOperationalStatus) => Promise<void> | void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  currency,
  currentUser,
  onUpdateProperty,
  onDeleteProperty,
  onUpdatePropertyStatus,
}) => {
  if (!property) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editStatus, setEditStatus] = useState<PropertyOperationalStatus>(getPropertyStatus(property));
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Form edit states
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

  // Localisation
  const [editDept, setEditDept] = useState(property.department || 'Atlantique');
  const [editCity, setEditCity] = useState(property.city || 'Abomey-Calavi');
  const [editArrondissement, setEditArrondissement] = useState(property.arrondissement || '');
  const [editDistrict, setEditDistrict] = useState(property.district || '');
  const [editAddress, setEditAddress] = useState(property.address || '');
  const [searchLocQuery, setSearchLocQuery] = useState('');
  const [showLocResults, setShowLocResults] = useState(false);

  // GPS
  const [editLatitude, setEditLatitude] = useState(String(property.coordinates?.latitude || '6.3621'));
  const [editLongitude, setEditLongitude] = useState(String(property.coordinates?.longitude || '2.3812'));
  const [editAltitude, setEditAltitude] = useState(String(property.coordinates?.altitude || '9.2'));
  const [editAccuracy, setEditAccuracy] = useState(String(property.coordinates?.accuracy || '3.4'));
  const [editAddressApprox, setEditAddressApprox] = useState(property.coordinates?.addressApprox || '');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCapturedFeedback, setGpsCapturedFeedback] = useState(false);

  useEffect(() => {
    if (property) {
      setEditTitle(property.title);
      setEditCategory(normalizePropertyCategory(property.category));
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
      setEditStatus(getPropertyStatus(property));
      setShowDeleteModal(false);
      setIsDeleting(false);
      setStatusFeedback(null);
      setFailedImages({});
      setIsEditing(false);
    }
  }, [property]);

  const canEdit = currentUser
    ? currentUser.role === 'SUPER_ADMIN' ||
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'SECRETAIRE' ||
      currentUser.id === property.assignedAgentId
    : false;

  const formatMoney = (amountXOF: number) => {
    if (currency === 'USD') {
      const usd = Math.round(amountXOF / 600);
      return `$${usd.toLocaleString('en-US')}`;
    }
    return `${amountXOF.toLocaleString('fr-FR')} FCFA`;
  };

  const locSearchResults = searchLocQuery.trim().length >= 2 ? searchTerritory(searchLocQuery) : [];

  const handleSelectTerritoryResult = (r: TerritorySearchResult) => {
    setEditDept(r.deptName);
    setEditCity(r.communeName);
    setEditArrondissement(r.arrondissementName);
    setEditDistrict(r.quartier);
    setSearchLocQuery('');
    setShowLocResults(false);
  };

  const handleInstantGPSCapture = () => {
    setIsLocating(true);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setEditLatitude(String(Number(pos.coords.latitude.toFixed(6))));
          setEditLongitude(String(Number(pos.coords.longitude.toFixed(6))));
          setEditAltitude(String(pos.coords.altitude ? Number(pos.coords.altitude.toFixed(1)) : 9.2));
          setEditAccuracy(String(Number(pos.coords.accuracy.toFixed(1))));
          setEditAddressApprox(`${editDistrict || 'Terrain'}, ${editCity || 'Bénin'}`);
          setIsLocating(false);
          setGpsCapturedFeedback(true);
          setTimeout(() => setGpsCapturedFeedback(false), 3500);
        },
        () => {
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

  const currentLat = property.coordinates?.latitude || 6.3621;
  const currentLng = property.coordinates?.longitude || 2.3812;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  const handleQuickStatusChange = async (newStatus: PropertyOperationalStatus) => {
    if (!canEdit || !property) return;
    setEditStatus(newStatus);
    const updatedProperty: PropertyRecord = {
      ...property,
      operationalStatus: newStatus,
      updatedAt: Date.now(),
      syncStatus: 'synced',
    };

    if (onUpdateProperty) onUpdateProperty(updatedProperty);
    if (onUpdatePropertyStatus) onUpdatePropertyStatus(property.id, newStatus);

    try {
      await apiFetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        body: JSON.stringify({ operationalStatus: newStatus }),
      });
    } catch (err) {
      console.error('Erreur synchronisation statut opérationnel:', err);
    }

    setStatusFeedback(OPERATIONAL_STATUS_CONFIG[newStatus].label);
    setTimeout(() => setStatusFeedback(null), 2800);
  };

  const handleConfirmDelete = async () => {
    if (!property || !onDeleteProperty) return;
    setIsDeleting(true);
    try {
      await onDeleteProperty(property.id);
      setShowDeleteModal(false);
      onClose();
    } catch (err) {
      console.error('Erreur lors de la suppression du bien:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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
      operationalStatus: editStatus,
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

    if (onUpdateProperty) onUpdateProperty(updatedProperty);

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

  const opStatus = getPropertyStatus(property);
  const statusCfg = OPERATIONAL_STATUS_CONFIG[opStatus];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`Détails du bien ${property.title}`}
    >
      <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-7 max-w-5xl w-full border border-neutral-200 dark:border-white/10 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/10">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 text-[11px] font-bold font-mono">
                {property.codeReference}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 text-[11px] font-semibold">
                {normalizePropertyCategory(property.category)}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${statusCfg.badgeBg} text-white flex items-center gap-1.5`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>{statusCfg.label}</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                  property.syncStatus === 'synced'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {property.syncStatus === 'synced' ? 'Synchronisé' : 'En attente'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#141414] dark:text-white tracking-tight leading-snug">
              {property.title}
            </h2>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-medium">
              <span className="flex items-center gap-1 text-[#141414] dark:text-white font-semibold">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{property.city || 'Bénin'}</span>
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <span>{property.district || 'Zone'}</span>
              {property.address && (
                <>
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  <span className="text-neutral-500 dark:text-neutral-400">{property.address}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canEdit && !isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold cursor-pointer transition-colors"
                  title="Modifier les informations, la localisation et le GPS"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modifier</span>
                </button>

                {onDeleteProperty && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold cursor-pointer transition-colors"
                    title="Supprimer ce bien définitivement"
                    aria-label="Supprimer ce bien"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Fermer"
              aria-label="Fermer la fiche"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success notification */}
        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Fiche, localisation et coordonnées GPS mises à jour avec succès.</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EDIT MODE                                                                 */}
        {/* ========================================================================= */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-200 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#141414] dark:bg-white shrink-0" />
              <span>Modification complète autorisée : Général, Localisation, Coordonnées GPS & Propriétaire.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold text-[#141414] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#141414]/25"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                Catégorie du bien (Nomenclature officielle chezmoi.bj) *
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as PropertyCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold text-[#141414] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#141414]/25"
              >
                {OFFICIAL_PROPERTY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1.5">
                Statut opérationnel du bien *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['DISPONIBLE', 'EN_LOCATION', 'VENDU'] as PropertyOperationalStatus[]).map((st) => {
                  const cfg = OPERATIONAL_STATUS_CONFIG[st];
                  const isSelected = editStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#141414] hover:bg-[#2C2C2C] text-white transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-offset-2 ring-[#141414] dark:ring-white/40' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                      <span>{cfg.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1 flex items-center justify-between">
                  <span>Prix demandé (FCFA) *</span>
                  <span className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 tabular-nums">
                    {editPriceInput ? Number(editPriceInput).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'}
                  </span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={editPriceInput}
                  onChange={(e) => setEditPriceInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-extrabold text-[#141414] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#141414]/25 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                  Superficie (m²)
                </label>
                <input
                  type="number"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#141414]/25 tabular-nums"
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-2">
                <span className="text-xs font-bold text-[#141414] dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Localisation géographique complète (Bénin)</span>
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">Communes & Quartiers officiels</span>
              </div>

              <div className="relative">
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Recherche rapide de quartier (autocomplétion)
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tapez un quartier (ex: Womey, Calavi, Fidjrossè, Cadjehoun, Agla, GDIZ...)"
                    value={searchLocQuery}
                    onChange={(e) => {
                      setSearchLocQuery(e.target.value);
                      setShowLocResults(true);
                    }}
                    onFocus={() => setShowLocResults(true)}
                    className="w-full pl-8 pr-20 py-2 rounded-xl bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#141414]/25"
                  />
                  {searchLocQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchLocQuery('');
                        setShowLocResults(false);
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[#141414] hover:bg-[#2C2C2C] text-white text-[10px] font-bold cursor-pointer"
                    >
                      Effacer
                    </button>
                  )}
                </div>

                {showLocResults && locSearchResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-[#13161B] rounded-xl border border-neutral-200 dark:border-white/10 shadow-xl p-1.5 space-y-1">
                    {locSearchResults.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectTerritoryResult(r)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-xs text-white flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <strong>{r.quartier}</strong>
                          <span className="text-[10px] text-neutral-300 block">
                            {r.arrondissementName} • {r.communeName} ({r.deptName})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/15">Appliquer</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Commune / Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Ex: Abomey-Calavi, Cotonou, Ouidah..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#141414]/25"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Quartier ou Village *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    placeholder="Ex: Womey Sodo, Haie Vive, Tankpè..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#141414]/25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Adresse exacte ou repère terrain (Von, carrefour, lotissement)
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Ex: 2ème von après le carrefour Calvaire..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/25"
                />
              </div>
            </div>

            {/* GPS */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/40 pb-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Géoréférencement & Coordonnées GPS du bien</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 font-bold tabular-nums">
                  Précision : ±{editAccuracy} m
                </span>
              </div>

              <button
                type="button"
                onClick={handleInstantGPSCapture}
                disabled={isLocating}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Crosshair className={`w-4 h-4 shrink-0 ${isLocating ? 'animate-spin' : ''}`} />
                <span>
                  {isLocating ? 'Acquisition des coordonnées GPS...' : 'Partager ma position GPS instantanée'}
                </span>
              </button>

              {gpsCapturedFeedback && (
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Nouvelles coordonnées GPS capturées et appliquées au formulaire !</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 dark:text-neutral-300 mb-0.5">
                    Latitude (° N)
                  </label>
                  <input
                    type="text"
                    value={editLatitude}
                    onChange={(e) => setEditLatitude(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#13161B] border border-neutral-300 dark:border-white/15 text-xs font-mono font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 dark:text-neutral-300 mb-0.5">
                    Longitude (° E)
                  </label>
                  <input
                    type="text"
                    value={editLongitude}
                    onChange={(e) => setEditLongitude(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#13161B] border border-neutral-300 dark:border-white/15 text-xs font-mono font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 dark:text-neutral-300 mb-0.5">
                    Altitude (m)
                  </label>
                  <input
                    type="text"
                    value={editAltitude}
                    onChange={(e) => setEditAltitude(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#13161B] border border-neutral-300 dark:border-white/15 text-xs font-mono font-bold tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Tarifs flexibles */}
            <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 space-y-2">
              <span className="text-xs font-bold text-[#141414] dark:text-white block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tarification flexible (Forfaits locations & meublés)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 mb-0.5">
                    Journalier (FCFA)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editRateDaily}
                    onChange={(e) => setEditRateDaily(e.target.value.replace(/\D/g, ''))}
                    placeholder="35000"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 text-xs font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 mb-0.5">
                    Hebdomadaire (FCFA)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editRateWeekly}
                    onChange={(e) => setEditRateWeekly(e.target.value.replace(/\D/g, ''))}
                    placeholder="200000"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 text-xs font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 mb-0.5">
                    Mensuel (FCFA)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editRateMonthly}
                    onChange={(e) => setEditRateMonthly(e.target.value.replace(/\D/g, ''))}
                    placeholder="650000"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10 text-xs font-bold tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Pièces</label>
                <input
                  type="number"
                  value={editRooms}
                  onChange={(e) => setEditRooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Chambres</label>
                <input
                  type="number"
                  value={editBedrooms}
                  onChange={(e) => setEditBedrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Salles d'eau</label>
                <input
                  type="number"
                  value={editBathrooms}
                  onChange={(e) => setEditBathrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Statut juridique</label>
              <select
                value={editLegalStatus}
                onChange={(e) => setEditLegalStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold"
              >
                <option value="TITRE_FONCIER">Titre Foncier individuel (ANDF)</option>
                <option value="ATTESTATION_RECASEMENT">Attestation de recasement</option>
                <option value="CONCESSION">Convention de vente avec tampon mairie</option>
                <option value="EN_COURS">Titre foncier en cours d'immatriculation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Description complète du bien
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Autres précisions & commodités</span>
              </label>
              <textarea
                rows={2}
                value={editOtherDetails}
                onChange={(e) => setEditOtherDetails(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Nom du propriétaire</label>
                <input
                  type="text"
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Téléphone propriétaire</label>
                <input
                  type="tel"
                  value={editOwnerPhone}
                  onChange={(e) => setEditOwnerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">WhatsApp propriétaire</label>
                <input
                  type="tel"
                  value={editOwnerWhatsapp}
                  onChange={(e) => setEditOwnerWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer & synchroniser</span>
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* MODE CONSULTATION 2 COLONNES (INSPIRÉ DE LISTEO 161.png)                  */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLONNE GAUCHE (7 cols) : Galerie, Description, Caractéristiques, Tarifs, GPS */}
            <div className="lg:col-span-7 space-y-5">
              {/* Photos Showcase */}
              {property.photos && property.photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {property.photos.slice(0, 3).map((photo, idx) => (
                    <div
                      key={photo.id}
                      className={`relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 ${
                        idx === 0 ? 'sm:col-span-3 h-52 sm:h-60' : 'h-28'
                      }`}
                    >
                      {!failedImages[photo.id] ? (
                        <img
                          src={photo.url}
                          alt={photo.caption || property.title}
                          referrerPolicy="no-referrer"
                          onError={() => setFailedImages((prev) => ({ ...prev, [photo.id]: true }))}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1.5">
                          <Building2 className="w-8 h-8" />
                          <span className="text-[11px] font-medium">{photo.caption || 'Aperçu terrain'}</span>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                        {photo.category.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-44 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center text-neutral-400 gap-2">
                  <Building2 className="w-9 h-9" />
                  <span className="text-xs font-medium">Aucune photo rattachée pour ce bien</span>
                </div>
              )}

              {/* Description complète */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#141414] dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-neutral-500" />
                  <span>Description détaillée du bien</span>
                </h3>
                <p className="text-[13px] text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {property.description || 'Aucune description détaillée renseignée pour ce bien.'}
                </p>
              </div>

              {/* Checklist Caractéristiques (style 2 colonnes Listeo Features) */}
              <div className="pt-2 border-t border-neutral-200 dark:border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-[#141414] dark:text-white">Caractéristiques & spécifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {[
                    `Superficie : ${property.areaSqMeters} m²`,
                    `Nombre de pièces : ${property.roomsCount} pièces`,
                    `Chambres : ${property.bedroomsCount || 0} ch.`,
                    `Salles d'eau : ${property.bathroomsCount || 0} d'eau`,
                    `Statut juridique : ${property.legalStatus.replace(/_/g, ' ').toLowerCase()}`,
                    `Type d'offre : ${property.listingType.replace(/_/g, ' ').toLowerCase()}`,
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span className="font-medium capitalize">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarifs Flexibles */}
              {property.rentalRates &&
                (property.rentalRates.daily || property.rentalRates.weekly || property.rentalRates.monthly) && (
                  <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 space-y-2.5">
                    <span className="text-xs font-bold text-[#141414] dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Tarifs flexibles & séjours modulables</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {property.rentalRates.daily && (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10">
                          <span className="text-[10px] text-neutral-500 block font-medium">Par jour / nuitée</span>
                          <strong className="text-xs font-bold text-[#141414] dark:text-white tabular-nums">
                            {formatMoney(property.rentalRates.daily)}
                          </strong>
                        </div>
                      )}
                      {property.rentalRates.weekly && (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10">
                          <span className="text-[10px] text-neutral-500 block font-medium">Par semaine</span>
                          <strong className="text-xs font-bold text-[#141414] dark:text-white tabular-nums">
                            {formatMoney(property.rentalRates.weekly)}
                          </strong>
                        </div>
                      )}
                      {property.rentalRates.monthly && (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10">
                          <span className="text-[10px] text-neutral-500 block font-medium">Par mois</span>
                          <strong className="text-xs font-bold text-[#141414] dark:text-white tabular-nums">
                            {formatMoney(property.rentalRates.monthly)}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Autres précisions */}
              {property.otherDetails && (
                <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 space-y-1">
                  <span className="text-xs font-bold text-[#141414] dark:text-white flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Autres précisions & commodités</span>
                  </span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed pt-0.5">
                    {property.otherDetails}
                  </p>
                </div>
              )}

              {/* Géolocalisation GPS */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#141414] dark:text-white">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Géoréférencement terrain</span>
                  </div>
                  <span className="text-[11px] font-mono bg-white dark:bg-[#13161B] px-2.5 py-0.5 rounded-md border border-neutral-200 dark:border-white/10 tabular-nums">
                    Précision ±{property.coordinates?.accuracy || 3.4} m
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-mono bg-white dark:bg-[#13161B] p-3 rounded-lg border border-neutral-200 dark:border-white/10 tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Lat : <strong>{currentLat}° N</strong></span>
                  </div>
                  <div>
                    <span>Lng : <strong>{currentLng}° E</strong></span>
                  </div>
                  <div>
                    <span>Altitude : <strong>{property.coordinates?.altitude || 9.2} m</strong></span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-neutral-500 font-medium truncate">
                    {property.coordinates?.addressApprox || `${property.district}, ${property.city}`}
                  </span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold transition-colors shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Ouvrir dans Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE (5 cols) : Carte Résumé Sticky (Listeo 161.png) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-0">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 shadow-xs space-y-5">
                {/* Prix principal */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Valeur affichée
                  </span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#141414] dark:text-white tracking-tight tabular-nums">
                    {formatMoney(property.priceAmount)}
                  </p>
                </div>

                {/* Statut opérationnel 1-clic */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#141414] dark:text-white">
                      Statut opérationnel
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {canEdit ? 'Modification 1 clic' : 'Lecture seule'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {(['DISPONIBLE', 'EN_LOCATION', 'VENDU'] as PropertyOperationalStatus[]).map((st) => {
                      const cfg = OPERATIONAL_STATUS_CONFIG[st];
                      const isCurrent = opStatus === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={!canEdit}
                          onClick={() => handleQuickStatusChange(st)}
                          className={`w-full flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl text-xs font-bold bg-[#141414] hover:bg-[#2C2C2C] text-white transition-all ${
                            !canEdit ? 'opacity-60 cursor-default' : 'cursor-pointer'
                          } ${isCurrent ? 'ring-2 ring-offset-2 ring-[#141414] dark:ring-white/40' : 'opacity-85 hover:opacity-100'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                          <span>{cfg.label}</span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-white ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                  {statusFeedback && (
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-bold text-center">
                      Statut mis à jour : {statusFeedback}
                    </div>
                  )}
                </div>

                {/* Hairline key-value metadata table */}
                <div className="divide-y divide-neutral-200 dark:divide-white/10 border-t border-b border-neutral-200 dark:border-white/10 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-neutral-500">Département</span>
                    <span className="font-semibold text-[#141414] dark:text-white">{property.department || 'Atlantique'}</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-neutral-500">Commune / Ville</span>
                    <span className="font-semibold text-[#141414] dark:text-white">{property.city}</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-neutral-500">Quartier</span>
                    <span className="font-semibold text-[#141414] dark:text-white">{property.district}</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-neutral-500">Superficie</span>
                    <span className="font-semibold text-[#141414] dark:text-white tabular-nums">{property.areaSqMeters} m²</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-neutral-500">Recensé par</span>
                    <span className="font-semibold text-[#141414] dark:text-white">{property.assignedAgentName || 'Agent Chezmoi'}</span>
                  </div>
                </div>

                {/* Propriétaire & Contacts */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#141414] dark:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{property.owner?.fullName}</span>
                    </span>
                    {property.owner?.mandateType && (
                      <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                        Mandat {property.owner.mandateType.toLowerCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {property.owner?.phonePrimary && (
                      <a
                        href={`tel:${property.owner.phonePrimary}`}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{property.owner.phonePrimary}</span>
                      </a>
                    )}
                    {property.owner?.phoneWhatsapp && (
                      <a
                        href={`https://wa.me/${property.owner.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-semibold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => alert(`Exportation de la fiche commerciale pour ${property.codeReference}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter la fiche commerciale</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmation de suppression du bien"
        >
          <div className="bg-white dark:bg-[#13161B] rounded-2xl p-6 sm:p-7 max-w-md w-full border border-neutral-200 dark:border-white/10 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-white/10 text-[#141414] dark:text-white flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-[#141414] dark:text-white leading-snug">
                Êtes-vous sûr de vouloir supprimer ce bien ?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Cette action supprimera définitivement le bien <strong>« {property.title} »</strong> (Réf.{' '}
                <span className="font-mono text-[#141414] dark:text-white font-bold">{property.codeReference}</span>) de la base de données.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-white/10">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Suppression...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Confirmer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
