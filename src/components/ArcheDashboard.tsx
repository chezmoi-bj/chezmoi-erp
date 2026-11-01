import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  Phone, 
  Mail, 
  ArrowUpRight, 
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
  ExternalLink,
  CheckCircle2,
  Filter,
  Eye
} from 'lucide-react';
import { 
  AgentRecenseur, 
  PropertyRecord, 
  OFFICIAL_PROPERTY_CATEGORIES, 
  OfficialPropertyCategory, 
  normalizePropertyCategory 
} from '../types';
import { BENIN_TERRITORIES } from '../data/beninTerritories';

interface ArcheDashboardProps {
  properties: PropertyRecord[];
  agents: AgentRecenseur[];
  onSelectProperty: (property: PropertyRecord) => void;
  onOpenCensus: () => void;
  currency: 'FCFA' | 'USD';
  setCurrency: (c: 'FCFA' | 'USD') => void;
}

export const ArcheDashboard: React.FC<ArcheDashboardProps> = ({
  properties,
  agents,
  onSelectProperty,
  onOpenCensus,
  currency,
  setCurrency,
}) => {
  const [contactTab, setContactTab] = useState<'realtors' | 'builders' | 'clients'>('realtors');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [selectedCity, setSelectedCity] = useState<string>('Toutes les villes');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tous les quartiers');
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'area_desc'>('recent');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent_1');

  // Formatage monétaire
  const formatMoney = (amountXOF: number) => {
    if (currency === 'USD') {
      const usd = Math.round(amountXOF / 600);
      return `$${usd.toLocaleString('en-US')}`;
    }
    return `${amountXOF.toLocaleString('fr-FR')} FCFA`;
  };

  // Liste des 77 Communes du Bénin
  const allCommunesList = useMemo(() => {
    return BENIN_TERRITORIES.flatMap(d => d.communes.map(c => ({ id: c.id, name: c.name, dept: d.name })));
  }, []);

  // Quartiers de la commune sélectionnée
  const availableDistricts = useMemo(() => {
    if (selectedCity === 'Toutes les villes') {
      return ['Tous les quartiers'];
    }
    const found = BENIN_TERRITORIES.flatMap(d => d.communes).find(
      c => c.name.toLowerCase() === selectedCity.toLowerCase() || c.id === selectedCity.toLowerCase()
    );
    if (!found) return ['Tous les quartiers'];
    const qList = found.arrondissements.flatMap(a => a.quartiers);
    return ['Tous les quartiers', ...Array.from(new Set(qList))];
  }, [selectedCity]);

  // Compteurs dynamiques par catégorie officielle de chezmoi.bj
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

  // Filtrage dynamique des biens
  const filteredProperties = useMemo(() => {
    let result = properties.filter((prop) => {
      const propNormCategory = normalizePropertyCategory(prop.category);

      const matchCategory =
        selectedCategory === 'Toutes' ||
        propNormCategory === selectedCategory;

      const matchCity =
        selectedCity === 'Toutes les villes' ||
        prop.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        selectedCity.toLowerCase().includes(prop.city.toLowerCase());

      const matchDistrict =
        selectedDistrict === 'Tous les quartiers' ||
        prop.district.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
        selectedDistrict.toLowerCase().includes(prop.district.toLowerCase());

      const matchSearch =
        !dashboardSearchQuery ||
        prop.title.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) ||
        prop.address.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) ||
        prop.district.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) ||
        prop.codeReference.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) ||
        propNormCategory.toLowerCase().includes(dashboardSearchQuery.toLowerCase());

      return matchCategory && matchCity && matchDistrict && matchSearch;
    });

    // Tri dynamique
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
  }, [properties, selectedCategory, selectedCity, selectedDistrict, dashboardSearchQuery, sortBy]);

  // Icône associée à chaque catégorie officielle
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Terrains':
        return <Layers className="w-3.5 h-3.5" />;
      case 'Appartements':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'Boutiques et Magasins':
        return <Store className="w-3.5 h-3.5" />;
      case 'Maisons & Villas':
        return <Home className="w-3.5 h-3.5" />;
      case 'Résidences Meublées':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Bureaux':
        return <Briefcase className="w-3.5 h-3.5" />;
      default:
        return <Building2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* 1. BARRE DE NAVIGATION PAR CATÉGORIES OFFICIELLES CHEZMOI.BJ */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FA3055]/10 text-[#FA3055]">
              <Filter className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Offres immobilières par catégories officielles
              </h2>
              <p className="text-[11px] text-slate-500">
                Nomenclature officielle du portail national <strong className="text-slate-800">chezmoi.bj</strong>
              </p>
            </div>
          </div>

          {/* Sélecteur de devise & Bouton Nouveau recensement */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F4F6F5] p-0.5 rounded-full text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => setCurrency('FCFA')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  currency === 'FCFA' ? 'bg-[#FA3055] text-white shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                FCFA (XOF)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-[#FA3055] text-white shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                USD ($)
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenCensus}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#FA3055] hover:bg-[#d82244] text-white font-bold text-xs shadow-sm cursor-pointer transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Nouveau recensement terrain</span>
              <span className="sm:hidden">Recenser</span>
            </button>
          </div>
        </div>

        {/* Boutons de filtrage par Catégories (Inspirés directement de chezmoi.bj) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 overflow-x-auto pb-1">
          {/* Toutes les catégories */}
          <button
            type="button"
            onClick={() => setSelectedCategory('Toutes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              selectedCategory === 'Toutes'
                ? 'bg-[#FA3055] text-white shadow-sm ring-2 ring-[#FA3055]/30'
                : 'bg-[#F4F6F5] hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <span>Toutes les offres</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              selectedCategory === 'Toutes' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {categoryCounts.Toutes}
            </span>
          </button>

          {/* Les 6 catégories officielles */}
          {OFFICIAL_PROPERTY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  isSelected
                    ? 'bg-[#FA3055] text-white shadow-sm ring-2 ring-[#FA3055]/30'
                    : 'bg-[#F4F6F5] hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BARRE DE RECHERCHE GÉOGRAPHIQUE & TRI */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-1">
          
          {/* Sélecteur de Commune / Ville */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistrict('Tous les quartiers');
              }}
              className="appearance-none bg-[#F4F6F5] hover:bg-slate-200/70 text-slate-800 font-semibold text-xs py-2 pl-3.5 pr-8 rounded-full cursor-pointer focus:outline-none transition-colors max-w-[210px] truncate"
            >
              <option value="Toutes les villes">Toutes les 77 communes (Bénin)</option>
              {allCommunesList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.dept})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sélecteur de Quartier */}
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="appearance-none bg-[#F4F6F5] hover:bg-slate-200/70 text-slate-700 font-medium text-xs py-2 pl-3.5 pr-8 rounded-full cursor-pointer focus:outline-none transition-colors max-w-[190px] truncate"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Recherche textuelle libre */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={dashboardSearchQuery}
              onChange={(e) => setDashboardSearchQuery(e.target.value)}
              placeholder="Rechercher référence, quartier, titre..."
              className="w-full bg-[#F4F6F5] text-xs py-2 pl-8 pr-4 rounded-full text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
            />
          </div>

        </div>

        {/* Tri des offres */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="font-semibold text-slate-500 hidden sm:inline">Trier par :</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#F4F6F5] text-slate-800 font-bold text-xs py-1.5 px-3 rounded-full cursor-pointer focus:outline-none"
          >
            <option value="recent">Plus récents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="area_desc">Superficie décroissante</option>
          </select>
        </div>
      </div>

      {/* 3. CONTENU PRINCIPAL DU TABLEAU DE BORD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ========================================================================= */}
        {/* COLONNE GAUCHE : Contacts & Personnel Terrain (3 cols)                   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            
            {/* Titre Contacts */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Contacts</h2>
              <button 
                title="Filtrer les contacts"
                className="w-8 h-8 rounded-full bg-[#F4F6F5] hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Onglets Contacts */}
            <div className="flex items-center gap-1 mb-5 bg-[#F4F6F5] p-1 rounded-full">
              {(['realtors', 'builders', 'clients'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setContactTab(tab)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-full capitalize transition-all cursor-pointer ${
                    contactTab === tab
                      ? 'bg-[#FA3055] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'realtors' ? 'Agents' : tab === 'builders' ? 'Bailleurs' : 'Clients'}
                </button>
              ))}
            </div>

            {/* En-tête recenseurs */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1 mb-2">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <span className="w-5 h-5 rounded-full bg-[#FA3055] text-white flex items-center justify-center text-[10px]">
                  {agents.length}
                </span>
                <span>{selectedCity}</span>
              </div>
              <span className="text-[11px]">Recenseurs</span>
            </div>

            {/* Liste des recenseurs réels de production */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {agents.map((agent, index) => {
                const isSelected = selectedAgentId === agent.id;
                const isFirst = index === 0;

                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                      isSelected || (isFirst && !selectedAgentId)
                        ? 'bg-[#FA3055] border-[#E02045] text-white shadow-sm'
                        : 'bg-[#F9FAF9] hover:bg-[#F2F6F5] border-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/60 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isSelected || (isFirst && !selectedAgentId) ? 'text-white' : 'text-slate-900'}`}>
                            {agent.name}
                          </h4>
                          <p className={`text-[10px] truncate ${isSelected || (isFirst && !selectedAgentId) ? 'text-rose-100' : 'text-slate-500'}`}>
                            {agent.propertiesCount} biens • {agent.city}
                          </p>
                        </div>
                      </div>

                      {/* Note */}
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-2xs shrink-0 ${
                        isSelected || (isFirst && !selectedAgentId) ? 'bg-white/20 text-white' : 'bg-white text-slate-900'
                      }`}>
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{agent.rating}</span>
                      </div>
                    </div>

                    {/* Actions d'appel et d'e-mail */}
                    <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-white/10">
                      <a
                        href={`tel:${agent.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        title={`Appeler ${agent.name}`}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                          isSelected || (isFirst && !selectedAgentId) ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                      <a
                        href={`mailto:${agent.email}`}
                        onClick={(e) => e.stopPropagation()}
                        title={`Envoyer un email à ${agent.name}`}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                          isSelected || (isFirst && !selectedAgentId) ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <Mail className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLONNE DROITE : PORTFOLIO IMMOBILIER FONCTIONNEL ÉPURÉ (9 cols)          */}
        {/* (Suppression totale d'Arasaka Tower et des plans 3D superflus)           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* En-tête des résultats de filtrage */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl px-5 py-3 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">
                {selectedCategory === 'Toutes' ? 'Toutes les offres immobilières' : `Catégorie : ${selectedCategory}`}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {filteredProperties.length} {filteredProperties.length > 1 ? 'biens disponibles' : 'bien disponible'}
              </span>
            </div>

            {selectedCategory !== 'Toutes' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('Toutes')}
                className="text-xs font-bold text-[#FA3055] hover:underline cursor-pointer"
              >
                Réinitialiser la catégorie
              </button>
            )}
          </div>

          {/* Grille de cartes réelles de biens */}
          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-2xs text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                {getCategoryIcon(selectedCategory)}
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Aucun bien disponible dans « {selectedCategory} »
                </h3>
                <p className="text-xs text-slate-500">
                  Aucune offre ne correspond aux critères sélectionnés (commune ou recherche textuelle).
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Toutes');
                    setSelectedCity('Toutes les villes');
                    setSelectedDistrict('Tous les quartiers');
                    setDashboardSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Afficher toutes les offres
                </button>
                <button
                  type="button"
                  onClick={onOpenCensus}
                  className="px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#d82244] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Recenser un bien dans cette catégorie
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProperties.map((prop) => {
                const normCat = normalizePropertyCategory(prop.category);
                const hasCoordinates = prop.coordinates && prop.coordinates.latitude && prop.coordinates.longitude;

                return (
                  <div
                    key={prop.id}
                    onClick={() => onSelectProperty(prop)}
                    className="group bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image du bien avec Tag Catégorie Officielle chezmoi.bj en Rouge (#FA3055) */}
                      <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
                        <img
                          src={prop.photos[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80'}
                          alt={prop.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Tag officiel en rouge style chezmoi.bj (identique à l'image_05f51623.png) */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-3 py-1 rounded-full bg-[#FA3055] text-white font-bold text-[11px] shadow-sm tracking-wide">
                            {normCat}
                          </span>
                        </div>

                        {/* Référence foncière */}
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white font-mono font-bold text-[10px]">
                            {prop.codeReference}
                          </span>
                        </div>

                        {/* Statut disponibilité */}
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Disponible</span>
                          </span>
                        </div>
                      </div>

                      {/* Titre & Localisation */}
                      <div className="space-y-1 mb-3">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#FA3055] transition-colors line-clamp-1">
                          {prop.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#FA3055] shrink-0" />
                          <span>{prop.district}, {prop.city}</span>
                        </p>
                      </div>

                      {/* Caractéristiques Clés */}
                      <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-2xl bg-[#F9FAF9] border border-slate-100 text-center mb-3 text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Surface</span>
                          <strong className="text-slate-900 font-bold">{prop.areaSqMeters} m²</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Pièces</span>
                          <strong className="text-slate-900 font-bold">{prop.roomsCount || '-'}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Chambres</span>
                          <strong className="text-slate-900 font-bold">{prop.bedroomsCount || '-'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Prix & Boutons d'actions directs */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Prix demandé</span>
                        <div className="text-right">
                          <strong className="text-base font-extrabold text-[#FA3055] font-mono tracking-tight block">
                            {formatMoney(prop.priceAmount)}
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Bouton Consulter la fiche */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProperty(prop);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-[#FA3055] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Consulter la fiche</span>
                        </button>

                        {/* Bouton Google Maps direct */}
                        {hasCoordinates && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const gMaps = `https://www.google.com/maps/search/?api=1&query=${prop.coordinates.latitude},${prop.coordinates.longitude}`;
                              window.open(gMaps, '_blank', 'noopener,noreferrer');
                            }}
                            title="Ouvrir dans Google Maps"
                            className="p-2 rounded-xl bg-[#F4F6F5] hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors cursor-pointer"
                          >
                            <MapPin className="w-4 h-4 text-emerald-600" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
