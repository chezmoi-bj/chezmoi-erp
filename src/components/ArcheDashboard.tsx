import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Phone,
  Mail,
  Star,
  MapPin,
  SlidersHorizontal,
  Plus,
  Building2,
  Home,
  Store,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  Eye,
  Trash2,
  Tag,
  KeyRound,
  Coins,
  LayoutGrid,
  List,
  RotateCcw,
} from 'lucide-react';
import {
  AgentRecenseur,
  PropertyRecord,
  UserAccount,
  OFFICIAL_PROPERTY_CATEGORIES,
  normalizePropertyCategory,
  PropertyOperationalStatus,
  OPERATIONAL_STATUS_CONFIG,
  getPropertyStatus,
} from '../types';
import { BENIN_TERRITORIES } from '../data/beninTerritories';

interface ArcheDashboardProps {
  properties: PropertyRecord[];
  agents: AgentRecenseur[];
  onSelectProperty: (property: PropertyRecord) => void;
  onOpenCensus: () => void;
  currency: 'FCFA' | 'USD';
  setCurrency: (c: 'FCFA' | 'USD') => void;
  currentUser?: UserAccount;
  onDeleteProperty?: (id: string) => void;
  onUpdatePropertyStatus?: (id: string, status: PropertyOperationalStatus) => void;
}

export const ArcheDashboard: React.FC<ArcheDashboardProps> = ({
  properties,
  agents,
  onSelectProperty,
  onOpenCensus,
  currency,
  setCurrency,
  currentUser,
  onDeleteProperty,
  onUpdatePropertyStatus,
}) => {
  const [contactTab, setContactTab] = useState<'realtors' | 'builders' | 'clients'>('realtors');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [selectedCity, setSelectedCity] = useState<string>('Toutes les villes');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tous les quartiers');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'TOUS' | PropertyOperationalStatus>('TOUS');
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'area_desc'>('recent');
  const [listingLayout, setListingLayout] = useState<'grid' | 'list'>('grid');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'user_smb_central');
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const canUserManage = (prop: PropertyRecord) => {
    if (!currentUser) return false;
    return (
      currentUser.role === 'SUPER_ADMIN' ||
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'SECRETAIRE' ||
      currentUser.id === prop.assignedAgentId
    );
  };

  const formatMoney = (amountXOF: number) => {
    if (currency === 'USD') {
      const usd = Math.round(amountXOF / 600);
      return `$${usd.toLocaleString('en-US')}`;
    }
    return `${amountXOF.toLocaleString('fr-FR')} FCFA`;
  };

  const allCommunesList = useMemo(() => {
    return BENIN_TERRITORIES.flatMap((d) =>
      d.communes.map((c) => ({ id: c.id, name: c.name, dept: d.name }))
    );
  }, []);

  const availableDistricts = useMemo(() => {
    if (selectedCity === 'Toutes les villes') {
      return ['Tous les quartiers'];
    }
    const found = BENIN_TERRITORIES.flatMap((d) => d.communes).find(
      (c) =>
        c.name.toLowerCase() === selectedCity.toLowerCase() ||
        c.id === selectedCity.toLowerCase()
    );
    if (!found) return ['Tous les quartiers'];
    const qList = found.arrondissements.flatMap((a) => a.quartiers);
    return ['Tous les quartiers', ...Array.from(new Set(qList))];
  }, [selectedCity]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Toutes: properties.length,
      Terrains: 0,
      Appartements: 0,
      'Boutiques et Magasins': 0,
      'Maisons & Villas': 0,
      'Résidences Meublées': 0,
      Bureaux: 0,
    };
    properties.forEach((p) => {
      const cat = normalizePropertyCategory(p.category);
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, [properties]);

  const portfolioStats = useMemo(() => {
    let totalVal = 0;
    let available = 0;
    let inRent = 0;
    let sold = 0;

    properties.forEach((p) => {
      totalVal += p.priceAmount || 0;
      const status = getPropertyStatus(p);
      if (status === 'DISPONIBLE') available++;
      else if (status === 'EN_LOCATION') inRent++;
      else if (status === 'VENDU') sold++;
    });

    return {
      total: properties.length,
      available,
      inRent,
      sold,
      totalVal,
    };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const result = properties.filter((prop) => {
      const propNormCategory = normalizePropertyCategory(prop.category);

      const matchCategory =
        selectedCategory === 'Toutes' || propNormCategory === selectedCategory;

      const matchCity =
        selectedCity === 'Toutes les villes' ||
        prop.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        selectedCity.toLowerCase().includes(prop.city.toLowerCase());

      const matchDistrict =
        selectedDistrict === 'Tous les quartiers' ||
        prop.district.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
        selectedDistrict.toLowerCase().includes(prop.district.toLowerCase());

      const q = dashboardSearchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        prop.title.toLowerCase().includes(q) ||
        prop.address.toLowerCase().includes(q) ||
        prop.district.toLowerCase().includes(q) ||
        prop.codeReference.toLowerCase().includes(q) ||
        propNormCategory.toLowerCase().includes(q);

      const propStatus = getPropertyStatus(prop);
      const matchStatus =
        selectedStatusFilter === 'TOUS' || propStatus === selectedStatusFilter;

      return matchCategory && matchCity && matchDistrict && matchSearch && matchStatus;
    });

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.priceAmount - b.priceAmount);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.priceAmount - a.priceAmount);
    } else if (sortBy === 'area_desc') {
      result.sort((a, b) => b.areaSqMeters - a.areaSqMeters);
    } else {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return result;
  }, [
    properties,
    selectedCategory,
    selectedCity,
    selectedDistrict,
    selectedStatusFilter,
    dashboardSearchQuery,
    sortBy,
  ]);

  const hasActiveFilters =
    selectedCategory !== 'Toutes' ||
    selectedCity !== 'Toutes les villes' ||
    selectedDistrict !== 'Tous les quartiers' ||
    selectedStatusFilter !== 'TOUS' ||
    dashboardSearchQuery.trim() !== '';

  const resetAllFilters = () => {
    setSelectedCategory('Toutes');
    setSelectedCity('Toutes les villes');
    setSelectedDistrict('Tous les quartiers');
    setSelectedStatusFilter('TOUS');
    setDashboardSearchQuery('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Terrains':
        return <Layers className="w-4 h-4" />;
      case 'Appartements':
        return <Building2 className="w-4 h-4" />;
      case 'Boutiques et Magasins':
        return <Store className="w-4 h-4" />;
      case 'Maisons & Villas':
        return <Home className="w-4 h-4" />;
      case 'Résidences Meublées':
        return <Sparkles className="w-4 h-4" />;
      case 'Bureaux':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const renderCategoryItem = (cat: string, label: string, count: number) => {
    const isSelected = selectedCategory === cat;
    return (
      <a
        key={cat}
        href={`#categorie-${encodeURIComponent(cat)}`}
        onClick={(e) => {
          e.preventDefault();
          setSelectedCategory(cat);
        }}
        className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer group ${
          isSelected
            ? 'bg-white dark:bg-[#181C22] border-[#141414] dark:border-white/50 ring-1 ring-[#141414]/15 dark:ring-white/20 shadow-2xs'
            : 'bg-white dark:bg-[#13161B] border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/25'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isSelected
                ? 'bg-[#141414] text-white dark:bg-white dark:text-[#141414]'
                : 'bg-neutral-100 dark:bg-white/10 text-[#141414] dark:text-neutral-200 group-hover:bg-[#141414] group-hover:text-white'
            }`}
          >
            {getCategoryIcon(cat)}
          </div>
          <span className="text-xs font-bold text-[#141414] dark:text-white truncate">
            {label}
          </span>
        </div>
        <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 text-[11px] font-bold tabular-nums flex items-center justify-center shrink-0">
          {count}
        </span>
      </a>
    );
  };

  return (
    <div className="space-y-5 pb-12">
      {/* 1. LISTEO CATEGORY GRID & HEADER BAR */}
      <section className="bg-white dark:bg-[#13161B] rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-white/10">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#141414] dark:text-white tracking-tight">
              Parcourir par catégorie officielle
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Nomenclature officielle du portail national <strong className="text-[#141414] dark:text-white">chezmoi.bj</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setCurrency('FCFA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-[#141414] hover:bg-[#2C2C2C] text-white transition-all cursor-pointer whitespace-nowrap ${
                  currency === 'FCFA'
                    ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                FCFA (XOF)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-[#141414] hover:bg-[#2C2C2C] text-white transition-all cursor-pointer whitespace-nowrap ${
                  currency === 'USD'
                    ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                USD ($)
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenCensus}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Nouveau recensement terrain</span>
              <span className="sm:hidden">Recenser</span>
            </button>
          </div>
        </div>

        {/* Listeo Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2.5">
          {renderCategoryItem('Toutes', 'Toutes les offres', categoryCounts.Toutes)}
          {OFFICIAL_PROPERTY_CATEGORIES.map((cat) =>
            renderCategoryItem(cat, cat, categoryCounts[cat] || 0)
          )}
        </div>
      </section>

      {/* 2. KPI SUMMARY CARDS (Listeo Dashboard Pastel Stat Cards) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <a
          href="#statut-tous"
          onClick={(e) => {
            e.preventDefault();
            setSelectedStatusFilter('TOUS');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
            selectedStatusFilter === 'TOUS'
              ? 'bg-neutral-100 dark:bg-[#1B2028] border-[#141414] dark:border-white/40 ring-1 ring-[#141414]/15'
              : 'bg-neutral-100/70 dark:bg-[#15181E] border-neutral-200 dark:border-white/10 hover:border-neutral-300'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block truncate">
              Portefeuille total
            </span>
            <strong className="text-2xl font-extrabold text-[#141414] dark:text-white tracking-tight tabular-nums block mt-0.5">
              {portfolioStats.total}
            </strong>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              biens recensés
            </span>
          </div>
          <Building2 className="w-7 h-7 text-neutral-400 dark:text-neutral-500 shrink-0 stroke-[1.75]" />
        </a>

        <a
          href="#statut-disponible"
          onClick={(e) => {
            e.preventDefault();
            setSelectedStatusFilter('DISPONIBLE');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
            selectedStatusFilter === 'DISPONIBLE'
              ? 'bg-emerald-50 dark:bg-emerald-950/35 border-emerald-500 ring-1 ring-emerald-500/25'
              : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-500/20 hover:border-emerald-300'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block truncate">
              Disponibles
            </span>
            <strong className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 tracking-tight tabular-nums block mt-0.5">
              {portfolioStats.available}
            </strong>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              offres libres
            </span>
          </div>
          <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0 stroke-[1.75]" />
        </a>

        <a
          href="#statut-location"
          onClick={(e) => {
            e.preventDefault();
            setSelectedStatusFilter('EN_LOCATION');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
            selectedStatusFilter === 'EN_LOCATION'
              ? 'bg-amber-50 dark:bg-amber-950/35 border-amber-500 ring-1 ring-amber-500/25'
              : 'bg-amber-50/75 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-500/20 hover:border-amber-300'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block truncate">
              En location
            </span>
            <strong className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 tracking-tight tabular-nums block mt-0.5">
              {portfolioStats.inRent}
            </strong>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              occupés / gérés
            </span>
          </div>
          <KeyRound className="w-7 h-7 text-amber-500 shrink-0 stroke-[1.75]" />
        </a>

        <a
          href="#statut-vendu"
          onClick={(e) => {
            e.preventDefault();
            setSelectedStatusFilter('VENDU');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
            selectedStatusFilter === 'VENDU'
              ? 'bg-rose-50 dark:bg-rose-950/35 border-rose-500 ring-1 ring-rose-500/25'
              : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-500/20 hover:border-rose-300'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block truncate">
              Vendus
            </span>
            <strong className="text-2xl font-extrabold text-rose-900 dark:text-rose-200 tracking-tight tabular-nums block mt-0.5">
              {portfolioStats.sold}
            </strong>
            <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
              actes conclus
            </span>
          </div>
          <Tag className="w-7 h-7 text-rose-500 shrink-0 stroke-[1.75]" />
        </a>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13161B] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 block truncate">
              Valeur globale
            </span>
            <strong
              className="text-[15px] xl:text-lg font-extrabold text-[#141414] dark:text-white tracking-tight tabular-nums block mt-1 whitespace-nowrap"
              title={formatMoney(portfolioStats.totalVal)}
            >
              {currency === 'USD'
                ? `$${Math.round(portfolioStats.totalVal / 600).toLocaleString('en-US')}`
                : portfolioStats.totalVal.toLocaleString('fr-FR')}
            </strong>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium block">
              {currency === 'USD' ? 'USD · estimation active' : 'FCFA · estimation active'}
            </span>
          </div>
          <Coins className="w-6 h-6 text-neutral-400 dark:text-neutral-500 shrink-0 stroke-[1.75]" />
        </div>
      </section>

      {/* 3. BROWSE LISTINGS SHELL (Left Filters + Contacts | Right Listings Grid/List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (3 cols): Listeo Search/Territory Filters + Contacts */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters Card */}
          <div className="bg-white dark:bg-[#13161B] rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-[#141414] dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtres</span>
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-[11px] font-semibold cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            {/* Search Input */}
            <div>
              <label
                htmlFor="dashboard-search-input"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Recherche
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="dashboard-search-input"
                  type="text"
                  value={dashboardSearchQuery}
                  onChange={(e) => setDashboardSearchQuery(e.target.value)}
                  placeholder="Référence, quartier, titre..."
                  className="w-full bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs py-2.5 pl-8 pr-3 rounded-xl text-[#141414] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#141414] dark:focus:border-white/40"
                />
              </div>
            </div>

            {/* Commune */}
            <div>
              <label
                htmlFor="filter-commune"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Commune / Ville (77)
              </label>
              <div className="relative">
                <select
                  id="filter-commune"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedDistrict('Tous les quartiers');
                  }}
                  className="w-full appearance-none bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-[#141414] dark:text-white font-semibold text-xs py-2.5 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none focus:border-[#141414]"
                >
                  <option value="Toutes les villes">Toutes les 77 communes (Bénin)</option>
                  {allCommunesList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.dept})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quartier */}
            <div>
              <label
                htmlFor="filter-district"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Quartier / Village
              </label>
              <div className="relative">
                <select
                  id="filter-district"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full appearance-none bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-[#141414] dark:text-white font-semibold text-xs py-2.5 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none focus:border-[#141414]"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Statut opérationnel */}
            <div>
              <label
                htmlFor="filter-status"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Statut opérationnel
              </label>
              <div className="relative">
                <select
                  id="filter-status"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value as 'TOUS' | PropertyOperationalStatus)}
                  className="w-full appearance-none bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-[#141414] dark:text-white font-semibold text-xs py-2.5 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none focus:border-[#141414]"
                >
                  <option value="TOUS">Tous les statuts ({properties.length})</option>
                  <option value="DISPONIBLE">
                    Disponible ({portfolioStats.available})
                  </option>
                  <option value="EN_LOCATION">
                    En location ({portfolioStats.inRent})
                  </option>
                  <option value="VENDU">Vendu ({portfolioStats.sold})</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Contacts & Équipe Terrain Card */}
          <div className="bg-white dark:bg-[#13161B] rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#141414] dark:text-white">
                Contacts terrain
              </h3>
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tabular-nums">
                {agents.length} membres
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
              {(['realtors', 'builders', 'clients'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setContactTab(tab)}
                  className={`py-1.5 text-[11px] font-bold rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white transition-all cursor-pointer ${
                    contactTab === tab
                      ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  {tab === 'realtors' ? 'Agents' : tab === 'builders' ? 'Bailleurs' : 'Clients'}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {agents.map((agent) => {
                const isSelected = selectedAgentId === agent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-3 rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#FAFAFA] dark:bg-[#181C22] border-[#141414] dark:border-white/40'
                        : 'bg-white dark:bg-[#13161B] border-neutral-200 dark:border-white/10 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-white/15 shrink-0 bg-neutral-100"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#141414] dark:text-white truncate">
                            {agent.name}
                          </h4>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate tabular-nums">
                            {agent.propertiesCount} biens · {agent.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-700 dark:text-neutral-200 tabular-nums shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{agent.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-neutral-100 dark:border-white/10">
                      <a
                        href={`tel:${agent.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        title={`Appeler ${agent.name}`}
                        className="w-7 h-7 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white flex items-center justify-center transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`mailto:${agent.email}`}
                        onClick={(e) => e.stopPropagation()}
                        title={`Envoyer un email à ${agent.name}`}
                        className="w-7 h-7 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white flex items-center justify-center transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (9 cols): Listings Directory Toolbar + Cards / Empty State */}
        <div className="lg:col-span-9 space-y-4">
          {/* Directory Result & Sort Bar (164.png inspired) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#13161B] rounded-2xl px-4 py-3 border border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-[#141414] dark:text-white text-sm">
                {selectedCategory === 'Toutes' ? 'Toutes les offres immobilières' : selectedCategory}
              </span>
              <span className="text-neutral-400" aria-hidden="true">·</span>
              <span className="font-semibold text-neutral-500 dark:text-neutral-400 tabular-nums">
                {filteredProperties.length} {filteredProperties.length > 1 ? 'biens' : 'bien'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  aria-label="Trier les offres"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-[#141414] dark:text-white font-bold text-xs py-2 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none"
                >
                  <option value="recent">Plus récents</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="area_desc">Superficie décroissante</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setListingLayout('grid')}
                  title="Vue grille"
                  aria-label="Vue grille"
                  className={`w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white flex items-center justify-center cursor-pointer transition-all ${
                    listingLayout === 'grid'
                      ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setListingLayout('list')}
                  title="Vue liste"
                  aria-label="Vue liste"
                  className={`w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white flex items-center justify-center cursor-pointer transition-all ${
                    listingLayout === 'list'
                      ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty State (162.png inspired) OR Property Cards */}
          {filteredProperties.length === 0 ? (
            <div className="bg-white dark:bg-[#13161B] rounded-2xl p-10 sm:p-14 border border-neutral-200 dark:border-white/10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-white/10 text-[#141414] dark:text-white mx-auto flex items-center justify-center">
                {getCategoryIcon(selectedCategory)}
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-extrabold text-[#141414] dark:text-white">
                  Aucun bien trouvé pour ces critères
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Aucune offre ne correspond aux filtres sélectionnés ({selectedCategory}, {selectedCity}).
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Afficher toutes les offres
                </button>
                <button
                  type="button"
                  onClick={onOpenCensus}
                  className="px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Recenser un bien
                </button>
              </div>
            </div>
          ) : (
            <div
              className={
                listingLayout === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-3'
              }
            >
              {filteredProperties.map((prop) => {
                const normCat = normalizePropertyCategory(prop.category);
                const hasCoordinates =
                  prop.coordinates &&
                  prop.coordinates.latitude &&
                  prop.coordinates.longitude;
                const opStatus = getPropertyStatus(prop);
                const statusCfg = OPERATIONAL_STATUS_CONFIG[opStatus];
                const isList = listingLayout === 'list';

                return (
                  <div
                    key={prop.id}
                    onClick={() => onSelectProperty(prop)}
                    className={`group bg-white dark:bg-[#13161B] rounded-2xl p-4 border border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30 transition-all cursor-pointer ${
                      isList
                        ? 'flex flex-col sm:flex-row gap-4 items-stretch'
                        : 'flex flex-col justify-between'
                    }`}
                  >
                    {/* Media Container with Graceful CSS/SVG Fallback */}
                    <div
                      className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-[#181C22] dark:to-[#222731] shrink-0 ${
                        isList ? 'h-44 sm:h-auto sm:w-56' : 'h-44 mb-3.5'
                      }`}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 pointer-events-none">
                        <Building2 className="w-8 h-8 mb-1 opacity-60" />
                        <span className="text-[10px] font-semibold">{normCat}</span>
                      </div>
                      {prop.photos?.[0]?.url && (
                        <img
                          src={prop.photos[0].url}
                          alt={prop.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="relative z-10 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 left-2.5 z-20">
                        <span
                          className={`px-2.5 py-0.5 rounded-md ${statusCfg.badgeBg} text-white font-bold text-[10px] shadow-2xs`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Quiet unboxed metadata line */}
                        <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold mb-1">
                          <span className="truncate">{normCat}</span>
                          <span className="font-mono text-[10px] text-neutral-600 dark:text-neutral-300 shrink-0">
                            {prop.codeReference}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm text-[#141414] dark:text-white line-clamp-1">
                          {prop.title}
                        </h3>

                        <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 truncate mt-1 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">
                            {prop.district}, {prop.city}
                          </span>
                        </p>

                        {/* Specs strip */}
                        <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-100 dark:border-white/10 text-center mb-3 text-[11px]">
                          <div>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                              Surface
                            </span>
                            <strong className="text-[#141414] dark:text-white font-bold tabular-nums">
                              {prop.areaSqMeters} m²
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                              Pièces
                            </span>
                            <strong className="text-[#141414] dark:text-white font-bold tabular-nums">
                              {prop.roomsCount || '-'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                              Chambres
                            </span>
                            <strong className="text-[#141414] dark:text-white font-bold tabular-nums">
                              {prop.bedroomsCount || '-'}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Price & Action Footer */}
                      <div className="pt-3 border-t border-neutral-100 dark:border-white/10 space-y-2.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                            Prix demandé
                          </span>
                          <strong className="text-base font-extrabold text-[#141414] dark:text-white tabular-nums tracking-tight">
                            {formatMoney(prop.priceAmount)}
                          </strong>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProperty(prop);
                            }}
                            className="flex-1 min-w-[110px] py-2 px-3 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Consulter</span>
                          </button>

                          {canUserManage(prop) && onUpdatePropertyStatus && (
                            <select
                              aria-label={`Statut de ${prop.title}`}
                              value={opStatus}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                onUpdatePropertyStatus(
                                  prop.id,
                                  e.target.value as PropertyOperationalStatus
                                );
                              }}
                              title="Changer le statut en 1 clic"
                              className="py-2 px-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] text-[#141414] dark:text-white text-[11px] font-bold border border-neutral-200 dark:border-white/15 cursor-pointer focus:outline-none"
                            >
                              <option value="DISPONIBLE">Disponible</option>
                              <option value="EN_LOCATION">En location</option>
                              <option value="VENDU">Vendu</option>
                            </select>
                          )}

                          {hasCoordinates && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const gMaps = `https://www.google.com/maps/search/?api=1&query=${prop.coordinates.latitude},${prop.coordinates.longitude}`;
                                window.open(gMaps, '_blank', 'noopener,noreferrer');
                              }}
                              aria-label={`Localisation Google Maps de ${prop.title}`}
                              title="Ouvrir dans Google Maps"
                              className="p-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white transition-colors cursor-pointer"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                          )}

                          {canUserManage(prop) && onDeleteProperty && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPropertyToDelete(prop);
                              }}
                              aria-label={`Supprimer ${prop.title}`}
                              title="Supprimer ce bien"
                              className="p-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-rose-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODALE DE SÉCURITÉ DE CONFIRMATION DE SUPPRESSION D'UN BIEN */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#13161B] rounded-2xl p-6 sm:p-7 max-w-md w-full border border-neutral-200 dark:border-white/10 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-[#141414] dark:text-white leading-snug">
                Êtes-vous sûr de vouloir supprimer ce bien ?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Cette action supprimera définitivement le bien{' '}
                <strong className="text-[#141414] dark:text-white">
                  « {propertyToDelete.title} »
                </strong>{' '}
                (Réf.{' '}
                <span className="font-mono text-[#141414] dark:text-white font-bold">
                  {propertyToDelete.codeReference}
                </span>
                ) de la base de données. Les données associées seront effacées en temps réel.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-white/10">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!onDeleteProperty) return;
                  setIsDeleting(true);
                  try {
                    await onDeleteProperty(propertyToDelete.id);
                    setPropertyToDelete(null);
                  } catch (err) {
                    console.error('Erreur suppression:', err);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Suppression en cours...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Confirmer la suppression</span>
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
