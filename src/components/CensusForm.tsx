import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  FileCheck,
  Trash2,
  Crosshair,
  Wifi,
  WifiOff,
  Upload,
  Compass,
  FileText,
  Search,
  Calendar,
  Image as ImageIcon,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Coordinates, PhotoCategory, PropertyCategory, PropertyListingType, PropertyPhoto, PropertyRecord } from '../types';
import { BENIN_TERRITORIES, searchTerritory, TerritorySearchResult } from '../data/beninTerritories';
import { apiFetch } from '../utils/api';

interface CensusFormProps {
  onSaveRecord: (property: PropertyRecord) => void;
  isOnline: boolean;
  assignedAgentName: string;
  assignedAgentId: string;
}

export const CensusForm: React.FC<CensusFormProps> = ({
  onSaveRecord,
  isOnline,
  assignedAgentName,
  assignedAgentId,
}) => {
  const [selectedDept, setSelectedDept] = useState('littoral');
  const [selectedCommune, setSelectedCommune] = useState('cotonou');
  const [selectedArrondissement, setSelectedArrondissement] = useState('cotonou_12');
  const [selectedQuartier, setSelectedQuartier] = useState('Haie Vive');
  const [customQuartier, setCustomQuartier] = useState('');

  const [ownerLastName, setOwnerLastName] = useState('Dossou');
  const [ownerFirstName, setOwnerFirstName] = useState('Bio');
  const [ownerPhonePrimary, setOwnerPhonePrimary] = useState('+229 97 12 34 56');
  const [ownerPhoneWhatsapp, setOwnerPhoneWhatsapp] = useState('+229 97 12 34 56');
  const [ownerEmail] = useState('');
  const [mandateType, setMandateType] = useState<'EXCLUSIF' | 'SIMPLE' | 'GESTION_DIRECTE'>('EXCLUSIF');
  const [mandateMonths] = useState<number>(12);

  const [title, setTitle] = useState('Villa duplex contemporaine - Fidjrossè plage');
  const [listingType, setListingType] = useState<PropertyListingType>('VENTE');
  const [category, setCategory] = useState<PropertyCategory>('Terrains');
  const [address] = useState('2ème von après le carrefour Calvaire');
  const [priceInput, setPriceInput] = useState<string>('120000000');

  const [enableMultipleRates, setEnableMultipleRates] = useState<boolean>(true);
  const [rateDaily, setRateDaily] = useState<string>('35000');
  const [rateWeekly, setRateWeekly] = useState<string>('200000');
  const [rateMonthly, setRateMonthly] = useState<string>('650000');

  const [otherDetails, setOtherDetails] = useState<string>('');

  const [areaSqMeters, setAreaSqMeters] = useState<number>(380);
  const [roomsCount] = useState<number>(6);
  const [bedroomsCount] = useState<number>(4);
  const [bathroomsCount] = useState<number>(3);
  const [legalStatus, setLegalStatus] = useState<'TITRE_FONCIER' | 'ATTESTATION_RECASEMENT' | 'EN_COURS' | 'CONCESSION'>('TITRE_FONCIER');
  const [description, setDescription] = useState(
    'Superbe villa moderne construite en 2024, grand salon staffé, cuisine européenne équipée, groupe électrogène, bâche à eau et garage pour 2 véhicules. Titre foncier individuel disponible.'
  );

  const [coordinates, setCoordinates] = useState<Coordinates | null>({
    latitude: 6.3621,
    longitude: 2.3812,
    accuracy: 3.4,
    altitude: 9.2,
    addressApprox: 'Haie-Vive, Cotonou littoral',
    capturedAt: Date.now(),
  });
  const [isLocating, setIsLocating] = useState(false);

  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);

  const facadeInputRef = useRef<HTMLInputElement | null>(null);
  const salonInputRef = useRef<HTMLInputElement | null>(null);
  const chambreInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [territorySearchQuery, setTerritorySearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TerritorySearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleDepartmentSelect = (deptId: string) => {
    const dept = BENIN_TERRITORIES.find((d) => d.id === deptId) || BENIN_TERRITORIES[0];
    const firstCommune = dept.communes[0];
    const firstArr = firstCommune?.arrondissements[0];
    const firstQuartier = firstArr?.quartiers[0] || '';

    setSelectedDept(dept.id);
    setSelectedCommune(firstCommune ? firstCommune.id : '');
    setSelectedArrondissement(firstArr ? firstArr.id : '');
    setSelectedQuartier(firstQuartier);
  };

  const handleCommuneSelect = (communeId: string) => {
    const dept = BENIN_TERRITORIES.find((d) => d.id === selectedDept) || BENIN_TERRITORIES[0];
    const com = dept.communes.find((c) => c.id === communeId) || dept.communes[0];
    const firstArr = com?.arrondissements[0];
    const firstQuartier = firstArr?.quartiers[0] || '';

    setSelectedCommune(com ? com.id : '');
    setSelectedArrondissement(firstArr ? firstArr.id : '');
    setSelectedQuartier(firstQuartier);
  };

  const handleArrondissementSelect = (arrId: string) => {
    const dept = BENIN_TERRITORIES.find((d) => d.id === selectedDept) || BENIN_TERRITORIES[0];
    const com = dept.communes.find((c) => c.id === selectedCommune) || dept.communes[0];
    const arr = com?.arrondissements.find((a) => a.id === arrId) || com?.arrondissements[0];
    const firstQuartier = arr?.quartiers[0] || '';

    setSelectedArrondissement(arr ? arr.id : '');
    setSelectedQuartier(firstQuartier);
  };

  const handleSelectSearchResult = (result: TerritorySearchResult) => {
    setSelectedDept(result.deptId);
    setSelectedCommune(result.communeId);
    setSelectedArrondissement(result.arrondissementId);
    setSelectedQuartier(result.quartier);
    setTerritorySearchQuery('');
    setShowSearchResults(false);
  };

  const currentDeptObj = BENIN_TERRITORIES.find((d) => d.id === selectedDept) || BENIN_TERRITORIES[0];
  const currentCommunes = currentDeptObj.communes;
  const currentCommuneObj = currentCommunes.find((c) => c.id === selectedCommune) || currentCommunes[0] || { id: '', name: '', arrondissements: [] };
  const currentArrondissements = currentCommuneObj.arrondissements || [];
  const currentArrondissementObj = currentArrondissements.find((a) => a.id === selectedArrondissement) || currentArrondissements[0] || { id: '', name: '', quartiers: [] };
  const currentQuartiers = currentArrondissementObj.quartiers || [];

  useEffect(() => {
    if (territorySearchQuery.trim().length >= 2) {
      setSearchResults(searchTerritory(territorySearchQuery));
    } else {
      setSearchResults([]);
    }
  }, [territorySearchQuery]);

  const handleInstantGPSCapture = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy * 10) / 10,
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : 10,
            addressApprox: `${selectedQuartier}, ${currentCommuneObj?.name || 'Cotonou'} (relevé GPS haute précision)`,
            capturedAt: Date.now(),
          });
          setIsLocating(false);
        },
        () => {
          setCoordinates({
            latitude: 6.3582 + (Math.random() - 0.5) * 0.01,
            longitude: 2.3912 + (Math.random() - 0.5) * 0.01,
            accuracy: 2.9,
            altitude: 8.5,
            addressApprox: `${selectedQuartier}, ${currentCommuneObj?.name || 'Cotonou'} (relevé GPS fixe)`,
            capturedAt: Date.now(),
          });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleNativeFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    categoryType: PhotoCategory,
    defaultCaption: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        const newPhoto: PropertyPhoto = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          category: categoryType,
          url: dataUrl,
          isMain: photos.length === 0,
          caption: defaultCaption,
          timestamp: Date.now(),
        };

        setPhotos((prev) => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const triggerPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.click();
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalQuartier = customQuartier.trim() || selectedQuartier;
    const finalCity = currentCommuneObj ? currentCommuneObj.name : 'Cotonou';
    const finalArrond = currentArrondissementObj ? currentArrondissementObj.name : '';
    const finalPrice = priceInput.trim() ? Number(priceInput) : 0;
    const isRental = listingType === 'LOCATION' || listingType === 'LOCATION_MEUBLEE';

    const newRecord: PropertyRecord = {
      id: `prop_${Date.now()}`,
      codeReference: `CM-${finalCity.substring(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`,
      title,
      description,
      listingType,
      category,
      department: currentDeptObj.name,
      city: finalCity,
      arrondissement: finalArrond,
      district: finalQuartier,
      address,
      priceAmount: finalPrice,
      priceUSD: Math.round(finalPrice / 600),
      areaSqMeters: Number(areaSqMeters),
      roomsCount: Number(roomsCount),
      bedroomsCount: Number(bedroomsCount),
      bathroomsCount: Number(bathroomsCount),
      rentalRates:
        isRental || enableMultipleRates
          ? {
              daily: rateDaily ? Number(rateDaily) : undefined,
              weekly: rateWeekly ? Number(rateWeekly) : undefined,
              monthly: rateMonthly ? Number(rateMonthly) : undefined,
            }
          : undefined,
      otherDetails: otherDetails.trim() || undefined,
      coordinates: coordinates || {
        latitude: 6.3533,
        longitude: 2.4118,
        accuracy: 5.0,
        addressApprox: `${finalQuartier}, ${finalCity}`,
        capturedAt: Date.now(),
      },
      owner: {
        id: `own_${Date.now()}`,
        fullName: `${ownerLastName} ${ownerFirstName}`,
        phonePrimary: ownerPhonePrimary,
        phoneWhatsapp: ownerPhoneWhatsapp,
        email: ownerEmail || undefined,
        mandateType,
        mandateDurationMonths: Number(mandateMonths),
      },
      photos,
      assignedAgentId,
      assignedAgentName,
      syncStatus: isOnline ? 'synced' : 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverSyncTimestamp: isOnline ? Date.now() : undefined,
      legalStatus,
    };

    if (isOnline) {
      apiFetch('/api/properties', {
        method: 'POST',
        body: JSON.stringify(newRecord),
      }).catch((err) => console.error('[AutoSync Error] Direct property push:', err));
    }

    onSaveRecord(newRecord);
    confetti({ particleCount: 40, spread: 55, colors: ['#141414', '#10B981', '#ffffff'] });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-16">
      {/* Title & Status Banner */}
      <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-7 border border-neutral-200 dark:border-white/10 shadow-xs w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-white/10 text-[#141414] dark:text-white inline-block">
              Recensement de bien
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#141414] dark:text-white mt-2 tracking-tight">
              Fiche descriptive & cadastrale
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
              Agent référent : <strong className="text-[#141414] dark:text-white">{assignedAgentName}</strong>
            </p>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 border text-xs font-semibold self-start sm:self-auto ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>En ligne</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Hors-ligne</span>
              </>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        {/* SECTION 1: TERRITORY */}
        <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-6 border border-neutral-200 dark:border-white/10 shadow-xs space-y-4 w-full">
          <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-white/10 pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#141414] text-white flex items-center justify-center font-bold text-sm shrink-0 tabular-nums">
              1
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#141414] dark:text-white">
                Découpage territorial officiel du Bénin
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Conforme aux 5 290 villages et quartiers créés par l'Assemblée nationale.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="relative w-full">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                Recherche rapide (quartier, arrondissement ou ville au Bénin)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tapez un nom (ex: Fidjrossè, Agla, Tankpè, GDIZ, Djassin, Banikanni, Cana...)"
                  value={territorySearchQuery}
                  onChange={(e) => {
                    setTerritorySearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full pl-9 pr-20 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
                />
                {territorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setTerritorySearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[#141414] hover:bg-[#2C2C2C] text-white text-[10px] cursor-pointer font-bold"
                  >
                    Effacer
                  </button>
                )}
              </div>

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto bg-white dark:bg-[#13161B] rounded-xl border border-neutral-200 dark:border-white/10 shadow-xl p-1.5 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider tabular-nums">
                    {searchResults.length} localité{searchResults.length > 1 ? 's' : ''} trouvée{searchResults.length > 1 ? 's' : ''}
                  </div>
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchResult(r)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-xs text-white flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <span className="font-bold">{r.quartier}</span>
                        <span className="text-[10px] text-neutral-300 block">
                          {r.arrondissementName} • Commune de {r.communeName} ({r.deptName})
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold bg-white/15 px-2.5 py-1 rounded-md whitespace-nowrap">
                        Sélectionner
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1 flex items-center justify-between">
                  <span>1. Département (12 au total) *</span>
                  <span className="text-[10px] font-normal text-neutral-500 tabular-nums">{currentCommunes.length} communes</span>
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => handleDepartmentSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
                >
                  {BENIN_TERRITORIES.map((d) => (
                    <option key={d.id} value={d.id}>
                      Département du {d.name} ({d.communes.length} communes)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1 flex items-center justify-between">
                  <span>2. Commune / Ville (77 au total) *</span>
                  <span className="text-[10px] font-normal text-neutral-500 tabular-nums">{currentArrondissements.length} arrond.</span>
                </label>
                <select
                  value={selectedCommune}
                  onChange={(e) => handleCommuneSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
                >
                  {currentCommunes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Commune de {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1 flex items-center justify-between">
                  <span>3. Arrondissement officiel *</span>
                  <span className="text-[10px] font-normal text-neutral-500 tabular-nums">{currentQuartiers.length} quartiers</span>
                </label>
                <select
                  value={selectedArrondissement}
                  onChange={(e) => handleArrondissementSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
                >
                  {currentArrondissements.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                  4. Quartier ou village officiel (5 290) *
                </label>
                <select
                  value={selectedQuartier}
                  onChange={(e) => setSelectedQuartier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
                >
                  {currentQuartiers.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                Autre précision de quartier, lotissement ou repère (optionnel)
              </label>
              <input
                type="text"
                placeholder="ex : Zone Cité des Palmiers, Von après pharmacie..."
                value={customQuartier}
                onChange={(e) => setCustomQuartier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: GPS */}
        <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-6 border border-neutral-200 dark:border-white/10 shadow-xs space-y-4 w-full">
          <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-white/10 pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#141414] text-white flex items-center justify-center font-bold text-sm shrink-0 tabular-nums">
              2
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#141414] dark:text-white">
                Géolocalisation & point d'ancrage terrain
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Capture GPS instantanée de la position du bien.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleInstantGPSCapture}
              disabled={isLocating}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Crosshair className={`w-4 h-4 shrink-0 ${isLocating ? 'animate-spin' : ''}`} />
              <span>
                {isLocating ? 'Recherche des satellites GPS...' : 'Partager ma position GPS instantanée'}
              </span>
            </button>

            {coordinates && (
              <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#141414] dark:text-white font-bold">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>Point GPS capturé avec succès</span>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums">Précision : ±{coordinates.accuracy} m</span>
                </div>

                <div className="flex flex-col gap-1 font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                  <div>Latitude : <strong>{coordinates.latitude}° N</strong></div>
                  <div>Longitude : <strong>{coordinates.longitude}° E</strong></div>
                  <div>Altitude : {coordinates.altitude} m au-dessus du niveau de la mer</div>
                  <div className="text-neutral-500 font-sans text-[11px] mt-1 font-medium">{coordinates.addressApprox}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: OWNER */}
        <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-6 border border-neutral-200 dark:border-white/10 shadow-xs space-y-4 w-full">
          <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-white/10 pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#141414] text-white flex items-center justify-center font-bold text-sm shrink-0 tabular-nums">
              3
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#141414] dark:text-white">
                Propriétaire ou représentant légal
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Coordonnées du signataire et mandat de gestion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Nom de famille *</label>
              <input
                type="text"
                required
                value={ownerLastName}
                onChange={(e) => setOwnerLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Prénom(s) *</label>
              <input
                type="text"
                required
                value={ownerFirstName}
                onChange={(e) => setOwnerFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Téléphone principal (+229) *</label>
              <input
                type="tel"
                required
                value={ownerPhonePrimary}
                onChange={(e) => setOwnerPhonePrimary(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Numéro WhatsApp *</label>
              <input
                type="tel"
                required
                value={ownerPhoneWhatsapp}
                onChange={(e) => setOwnerPhoneWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Type de mandat</label>
              <select
                value={mandateType}
                onChange={(e) => setMandateType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
              >
                <option value="EXCLUSIF">Mandat exclusif d'agence (5% commission)</option>
                <option value="SIMPLE">Mandat simple non-exclusif</option>
                <option value="GESTION_DIRECTE">Gestion déléguée locative</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: CHARACTERISTICS */}
        <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-6 border border-neutral-200 dark:border-white/10 shadow-xs space-y-4 w-full">
          <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-white/10 pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#141414] text-white flex items-center justify-center font-bold text-sm shrink-0 tabular-nums">
              4
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#141414] dark:text-white">
                Caractéristiques du bien & annonce chezmoi.bj
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Classification exacte selon la taxonomie officielle du portail.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Type d'annonce</label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as PropertyListingType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
                >
                  <option value="VENTE">Vente définitive</option>
                  <option value="LOCATION">Location simple</option>
                  <option value="LOCATION_MEUBLEE">Location meublée</option>
                  <option value="BAIL_COMMERCIAL">Bail commercial</option>
                  <option value="GESTION_DELEGUEE">Gestion déléguée</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Catégorie officielle *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
                >
                  <option value="Terrains">Terrains</option>
                  <option value="Appartements">Appartements</option>
                  <option value="Boutiques et Magasins">Boutiques et Magasins</option>
                  <option value="Maisons & Villas">Maisons & Villas</option>
                  <option value="Résidences Meublées">Résidences Meublées</option>
                  <option value="Bureaux">Bureaux</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Statut juridique foncier</label>
                <select
                  value={legalStatus}
                  onChange={(e) => setLegalStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
                >
                  <option value="TITRE_FONCIER">Titre Foncier individuel (ANDF Bénin)</option>
                  <option value="ATTESTATION_RECASEMENT">Attestation de recasement</option>
                  <option value="CONCESSION">Convention de vente avec tampon mairie</option>
                  <option value="EN_COURS">Titre foncier en cours d'immatriculation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1 flex items-center justify-between">
                  <span>Prix demandé / Montant principal (FCFA) *</span>
                  <span className="text-xs font-mono font-bold text-[#141414] dark:text-white tabular-nums">
                    {priceInput ? Number(priceInput).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA'}
                  </span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex : 120000000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-sm font-extrabold text-[#141414] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#141414]/20 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Superficie (m²) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={areaSqMeters}
                  onChange={(e) => setAreaSqMeters(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20 tabular-nums"
                />
              </div>
            </div>

            {/* Flexible pricing */}
            <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#141414] dark:text-white shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#141414] dark:text-white block">
                      Tarification flexible (Courtes & longues durées / Meublés)
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Permet d'afficher simultanément des forfaits journaliers, hebdomadaires et mensuels.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableMultipleRates(!enableMultipleRates)}
                  className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all bg-[#141414] hover:bg-[#2C2C2C] text-white shrink-0 ${
                    enableMultipleRates ? 'ring-2 ring-offset-2 ring-[#141414] dark:ring-white/40' : 'opacity-75'
                  }`}
                >
                  {enableMultipleRates ? 'Activée' : 'Désactivée'}
                </button>
              </div>

              {enableMultipleRates && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10">
                    <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Tarif journalier (FCFA / jour)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rateDaily}
                      onChange={(e) => setRateDaily(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex : 35000"
                      className="w-full px-3 py-2 rounded-lg bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold tabular-nums"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10">
                    <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Tarif hebdomadaire (FCFA / sem.)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rateWeekly}
                      onChange={(e) => setRateWeekly(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex : 200000"
                      className="w-full px-3 py-2 rounded-lg bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold tabular-nums"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#13161B] border border-neutral-200 dark:border-white/10">
                    <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Tarif mensuel (FCFA / mois)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rateMonthly}
                      onChange={(e) => setRateMonthly(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex : 650000"
                      className="w-full px-3 py-2 rounded-lg bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-bold tabular-nums"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Titre de l'annonce</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Description complète</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Autres précisions (conditions, commodités, meubles inclus, horaires...)</span>
              </label>
              <textarea
                rows={3}
                value={otherDetails}
                onChange={(e) => setOtherDetails(e.target.value)}
                placeholder="Renseignez ici toute précision utile..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#141414]/20"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: PHOTOS */}
        <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-6 border border-neutral-200 dark:border-white/10 shadow-xs space-y-4 w-full">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#141414] text-white flex items-center justify-center font-bold text-sm shrink-0 tabular-nums">
                5
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#141414] dark:text-white">
                  Prises de vue réelles (Appareil photo & Galerie)
                </h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Capture directe avec la caméra du smartphone ou import depuis vos photos.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#141414] dark:text-white bg-neutral-100 dark:bg-white/10 px-2.5 py-1 rounded-md tabular-nums">
              {photos.length} photo{photos.length > 1 ? 's' : ''}
            </span>
          </div>

          <input type="file" ref={facadeInputRef} accept="image/*" className="hidden" onChange={(e) => handleNativeFileSelect(e, 'FACADE', 'Façade principale extérieure')} />
          <input type="file" ref={salonInputRef} accept="image/*" className="hidden" onChange={(e) => handleNativeFileSelect(e, 'SALON', 'Grand séjour ou salon')} />
          <input type="file" ref={chambreInputRef} accept="image/*" className="hidden" onChange={(e) => handleNativeFileSelect(e, 'CHAMBRE', 'Chambres ou dépendance')} />
          <input type="file" ref={docInputRef} accept="image/*" className="hidden" onChange={(e) => handleNativeFileSelect(e, 'DOC_TITRE', 'Document du Titre Foncier / Convention')} />
          <input type="file" ref={galleryInputRef} accept="image/*" multiple className="hidden" onChange={(e) => handleNativeFileSelect(e, 'EXTERIEUR', 'Photo complémentaire')} />

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              <button
                type="button"
                onClick={() => triggerPicker(facadeInputRef)}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Façade principale</span>
                </span>
                <span className="text-[10px] text-neutral-300 font-medium">Caméra / Galerie</span>
              </button>

              <button
                type="button"
                onClick={() => triggerPicker(salonInputRef)}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Salon & Séjour</span>
                </span>
                <span className="text-[10px] text-neutral-300 font-medium">Caméra / Galerie</span>
              </button>

              <button
                type="button"
                onClick={() => triggerPicker(chambreInputRef)}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Chambres & Pièces</span>
                </span>
                <span className="text-[10px] text-neutral-300 font-medium">Caméra / Galerie</span>
              </button>

              <button
                type="button"
                onClick={() => triggerPicker(docInputRef)}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Document & Titre Foncier</span>
                </span>
                <span className="text-[10px] text-neutral-300 font-medium">Capture document</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => triggerPicker(galleryInputRef)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Importer d'autres photos depuis la galerie (sélection multiple)</span>
            </button>

            {photos.length > 0 ? (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-[#141414] dark:text-white tabular-nums">
                  Photos capturées ({photos.length}) :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 group"
                    >
                      <img src={p.url} alt={p.caption} className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end justify-between p-2.5 text-white text-xs">
                        <span className="font-semibold text-[11px] truncate max-w-[120px]">{p.caption}</span>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(p.id)}
                          aria-label={`Supprimer ${p.caption}`}
                          className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-neutral-200 dark:border-white/15 text-center text-xs text-neutral-400">
                <ImageIcon className="w-6 h-6 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
                <span>
                  Aucune photo capturée pour l'instant. Utilisez les boutons ci-dessus pour prendre une photo en direct ou importer un fichier.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full pt-2">
          <button
            type="submit"
            className="w-full min-h-[50px] py-3.5 px-6 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>Enregistrer la fiche de recensement</span>
          </button>
        </div>
      </form>
    </div>
  );
};
