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
  Maximize2, 
  Plus, 
  Minus, 
  Camera, 
  Bed, 
  Home, 
  Car, 
  Coffee, 
  Sparkles,
  Info,
  Building2
} from 'lucide-react';
import { AgentRecenseur, PropertyRecord } from '../types';
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
  const [selectedCity, setSelectedCity] = useState<string>('Toutes les villes');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tous les quartiers');
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState<string>('');
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [activeRoomPin, setActiveRoomPin] = useState<string>('Bedroom');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent_1');

  // Format currency
  const formatMoney = (amountXOF: number) => {
    if (currency === 'USD') {
      const usd = Math.round(amountXOF / 600);
      return `$${usd.toLocaleString('en-US')}`;
    }
    return `${amountXOF.toLocaleString('fr-FR')} FCFA`;
  };

  // 77 Communes of Benin
  const allCommunesList = useMemo(() => {
    return BENIN_TERRITORIES.flatMap(d => d.communes.map(c => ({ id: c.id, name: c.name, dept: d.name })));
  }, []);

  // Districts for selected commune
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

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
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
        prop.district.toLowerCase().includes(dashboardSearchQuery.toLowerCase());

      return matchCity && matchDistrict && matchSearch;
    });
  }, [properties, selectedCity, selectedDistrict, dashboardSearchQuery]);

  const displayedProperties = filteredProperties.length > 0 ? filteredProperties : properties;
  const featured = displayedProperties.find((p) => p.isFeatured) || displayedProperties[0];

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Filter Bar */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* City Selector */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistrict('Tous les quartiers');
              }}
              className="appearance-none bg-[#F4F6F5] hover:bg-slate-200/70 text-slate-800 font-semibold text-xs py-2 pl-3.5 pr-8 rounded-full cursor-pointer focus:outline-none transition-colors max-w-[220px] truncate"
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

          {/* District Selector */}
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="appearance-none bg-[#F4F6F5] hover:bg-slate-200/70 text-slate-700 font-medium text-xs py-2 pl-3.5 pr-8 rounded-full cursor-pointer focus:outline-none transition-colors max-w-[200px] truncate"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={dashboardSearchQuery}
              onChange={(e) => setDashboardSearchQuery(e.target.value)}
              placeholder="Rechercher une référence, un titre..."
              className="bg-[#F4F6F5] text-xs py-2 pl-8 pr-4 rounded-full text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FA3055] w-56"
            />
          </div>

        </div>

        {/* Currency Switcher & CTA Recensement */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center bg-[#F4F6F5] p-0.5 rounded-full text-xs font-semibold text-slate-700">
            <button
              onClick={() => setCurrency('FCFA')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                currency === 'FCFA' ? 'bg-[#FA3055] text-white shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              FCFA (XOF)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                currency === 'USD' ? 'bg-[#FA3055] text-white shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              USD ($)
            </button>
          </div>

          <button
            onClick={onOpenCensus}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#d3902e] text-white font-bold text-xs shadow-sm cursor-pointer transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nouveau recensement terrain</span>
          </button>

        </div>
      </div>

      {/* Main Grid: Left Contacts + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Contacts Sidebar (3 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            
            {/* Contacts Title & Filter */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Contacts</h2>
              <button 
                title="Filtrer les contacts"
                className="w-8 h-8 rounded-full bg-[#F4F6F5] hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Pills */}
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

            {/* Sub-header city */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1 mb-2">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <span className="w-5 h-5 rounded-full bg-[#FA3055] text-white flex items-center justify-center text-[10px]">
                  {agents.length}
                </span>
                <span>{selectedCity}</span>
              </div>
              <span className="text-[11px]">Recenseurs</span>
            </div>

            {/* Contacts Cards List */}
            <div className="space-y-2.5">
              {agents.map((agent, index) => {
                const isSelected = selectedAgentId === agent.id;
                const isFirst = index === 0;

                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                      isSelected || isFirst
                        ? 'bg-[#FA3055] border-[#E02045] text-white shadow-sm'
                        : 'bg-[#F9FAF9] hover:bg-[#F2F6F5] border-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/60"
                        />
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isSelected || isFirst ? 'text-white' : 'text-slate-900'}`}>
                            {agent.name}
                          </h4>
                          <p className={`text-[10px] truncate ${isSelected || isFirst ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {agent.propertiesCount} biens • {agent.city}
                          </p>
                        </div>
                      </div>

                      {/* Rating pill */}
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-2xs ${
                        isSelected || isFirst ? 'bg-white/20 text-white' : 'bg-white text-slate-900'
                      }`}>
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{agent.rating}</span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-white/10">
                      <a
                        href={`tel:${agent.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        title={`Appeler ${agent.name}`}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                          isSelected || isFirst ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                      <a
                        href={`mailto:${agent.email}`}
                        onClick={(e) => e.stopPropagation()}
                        title={`Envoyer un email à ${agent.name}`}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                          isSelected || isFirst ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <Mail className="w-3 h-3" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Fiche agent: ${agent.name} (${agent.city}) - ${agent.propertiesCount} recensements`);
                        }}
                        title="Détails"
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                          isSelected || isFirst ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Offline-First sync notice */}
            <div className="mt-4 p-3 rounded-2xl bg-[#FA3055]/5 border border-[#FA3055]/15 text-[11px] text-[#FA3055] leading-relaxed">
              <span className="font-bold">Base SQLite Drift :</span> les recensements effectués par les agents sont stockés localement sur le smartphone avant synchronisation vers le Cloud Hostinger (MySQL).
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT AREA: Featured Properties, Metric Curve & 3D Floor Plan (9 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-9 space-y-5">
          {!featured ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-2xs text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-[#FA3055]/10 text-[#FA3055] mx-auto flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Base foncière de production prête
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Toutes les données de test ont été purgées. Aucun recensement foncier n'est enregistré pour le moment. Vous pouvez démarrer la collecte terrain ou synchroniser l'application mobile SQLite Drift.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onOpenCensus}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nouveau recensement terrain</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-left max-w-2xl mx-auto">
                <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Recensement GPS</p>
                  <p className="text-[11px] text-slate-500 mt-1">Coordonnées WGS84 précises et photos géoréférencées.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Mode Hors-Ligne</p>
                  <p className="text-[11px] text-slate-500 mt-1">Stockage local Drift puis synchronisation vers MySQL.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Validation Admin</p>
                  <p className="text-[11px] text-slate-500 mt-1">Contrôle central par SMB (Super Admin).</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Top Row: Horizontal Carousel of Property Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {displayedProperties.slice(0, 4).map((prop, idx) => {
              const isFeaturedChezmoi = idx === 0;

              return (
                <div
                  key={prop.id}
                  onClick={() => onSelectProperty(prop)}
                  className={`group relative rounded-3xl p-4.5 cursor-pointer transition-all hover:-translate-y-1 ${
                    isFeaturedChezmoi
                      ? 'bg-[#FA3055] text-white border border-[#E02045] shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs hover:shadow-sm'
                  }`}
                >
                  {/* Surface badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isFeaturedChezmoi ? 'bg-[#FA3055] text-white' : 'bg-[#F4F6F5] text-slate-700'
                    }`}>
                      {prop.areaSqMeters} m²
                    </span>
                    <span className={`text-[10px] font-semibold tracking-wider uppercase ${
                      isFeaturedChezmoi ? 'text-emerald-100' : 'text-slate-400'
                    }`}>
                      {prop.city}
                    </span>
                  </div>

                  {/* Title & Address */}
                  <h3 className={`font-bold text-sm line-clamp-1 transition-colors ${
                    isFeaturedChezmoi ? 'text-white' : 'text-slate-900 group-hover:text-[#FA3055]'
                  }`}>
                    {prop.title.split('-')[0].trim()}
                  </h3>
                  <p className={`text-[11px] font-medium truncate mt-0.5 ${
                    isFeaturedChezmoi ? 'text-emerald-100' : 'text-slate-500'
                  }`}>
                    {prop.district}, {prop.city}
                  </p>

                  {/* Property Image Showcase */}
                  <div className="relative my-3 h-28 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={prop.photos[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80'}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {prop.syncStatus === 'pending' && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FA3055] text-white font-bold text-[9px] shadow-sm">
                        En attente de sync
                      </span>
                    )}
                  </div>

                  {/* Agent Footer */}
                  <div className={`flex items-center justify-between pt-1 border-t ${
                    isFeaturedChezmoi ? 'border-white/10' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                        alt="Emily Davis"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="leading-tight">
                        <p className={`text-[11px] font-bold ${isFeaturedChezmoi ? 'text-white' : 'text-slate-900'}`}>
                          {prop.assignedAgentName}
                        </p>
                        <p className={`text-[9px] ${isFeaturedChezmoi ? 'text-emerald-100' : 'text-slate-400'}`}>
                          Agent référent
                        </p>
                      </div>
                    </div>
                    <span className={`font-extrabold text-xs ${isFeaturedChezmoi ? 'text-[#FA3055]' : 'text-slate-900'}`}>
                      {formatMoney(prop.priceAmount)}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Middle Row: Valuation Curve & Property Focus Card */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            
            {/* Left Big Card: Valuation Curve (8 cols) */}
            <div className="xl:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {featured.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F4F6F5] text-slate-700 text-[11px] font-semibold">
                      {featured.roomsCount} pièces
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F4F6F5] text-slate-700 text-[11px] font-semibold">
                      {featured.areaSqMeters} m²
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F4F6F5] text-slate-700 text-[11px] font-semibold">
                      {featured.category.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectProperty(featured)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F6F5] hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Détails de la fiche</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#FA3055]" />
                  </button>
                </div>
              </div>

              {/* Valuation Curve Graph */}
              <div className="relative pt-6 pb-2">
                <div className="h-32 w-full relative flex items-end">
                  
                  {/* SVG Wave curve with Chezmoi.bj gradient fill */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chezmoiCurveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FA3055" stopOpacity="0.4" />
                        <stop offset="70%" stopColor="#FA3055" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#FA3055" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                      d="M 0,90 Q 100,70 200,80 T 350,30 T 500,75 T 700,60 L 700,120 L 0,120 Z"
                      fill="url(#chezmoiCurveGradient)"
                    />

                    {/* Stroke line */}
                    <path
                      d="M 0,90 Q 100,70 200,80 T 350,30 T 500,75 T 700,60"
                      fill="none"
                      stroke="#FA3055"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Highlighted point */}
                    <circle cx="350" cy="30" r="5" fill="#FA3055" stroke="#ffffff" strokeWidth="2.5" />
                  </svg>

                  {/* Floating price indicator */}
                  <div className="absolute left-[45%] top-1 -translate-x-1/2 flex items-center gap-1 text-[11px] font-bold">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-500 shadow-2xs">
                      {formatMoney(featured.priceAmount * 0.95)}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#FA3055] text-white rounded-full shadow-2xs">
                      {formatMoney(featured.priceAmount)}
                    </span>
                  </div>

                </div>

                {/* Month labels under curve */}
                <div className="flex justify-between text-[11px] font-semibold text-slate-400 uppercase pt-2 px-1">
                  <span>Jan</span>
                  <span>Fév</span>
                  <span>Mar</span>
                  <span className="text-white bg-[#FA3055] px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Mai
                  </span>
                  <span>Juin</span>
                  <span>Juil</span>
                  <span>Août</span>
                </div>
              </div>

              {/* Bottom 3 Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Valeur estimée du marché</p>
                  <p className="text-lg font-bold text-slate-900">{formatMoney(featured.priceAmount)}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">+5.4% sur la zone Cotonou</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Niveau de finition</p>
                  <p className="text-lg font-bold text-slate-900">Grand standing</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Domotique & piscine</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Prix au mètre carré</p>
                  <p className="text-lg font-bold text-[#FA3055]">
                    {formatMoney(Math.round(featured.priceAmount / featured.areaSqMeters))} / m²
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Taux de commission 5%</p>
                </div>
              </div>

            </div>

            {/* Right Card: Quick Property Highlight & CTA (4 cols) */}
            <div className="xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">Arasaka Tower</h4>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      title="Localiser sur la carte"
                      className="w-7 h-7 rounded-full bg-[#F4F6F5] hover:bg-slate-200 flex items-center justify-center text-slate-600"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500">Haie-Vive, Cotonou littoral</p>

                {/* Highlighted Chezmoi Box */}
                <div className="mt-4 p-4 rounded-2xl bg-[#FA3055] text-white relative shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-emerald-100">Appartement F4 prestige</p>
                      <h4 className="text-xl font-bold mt-1 text-[#FA3055]">
                        {formatMoney(featured.priceAmount)}
                      </h4>
                    </div>
                    <button 
                      title="Ouvrir la fiche complète"
                      onClick={() => onSelectProperty(featured)}
                      className="w-8 h-8 rounded-full bg-[#FA3055] text-white flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                      3 chambres
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                      105 m²
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                      Meublé
                    </span>
                  </div>
                </div>
              </div>

              {/* Field Agent Badge */}
              <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                  alt="Emily Davis"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">Emily Davis (recenseur)</p>
                  <p className="text-[11px] text-slate-500">Validation terrain effectuée</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

            </div>

          </div>

          {/* Bottom Row: 3D Architectural Floor Plan Interactive Showcase */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            
            {/* Floor Plan Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                
                {/* Floor dropdown */}
                <div className="relative">
                  <select
                    value={activeFloor}
                    onChange={(e) => setActiveFloor(Number(e.target.value))}
                    className="appearance-none bg-[#F4F6F5] hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 pl-3.5 pr-8 rounded-full cursor-pointer focus:outline-none"
                  >
                    <option value={1}>1er étage (niveau 1)</option>
                    <option value={2}>2ème étage (penthouse)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* All Photo Pill */}
                <button
                  onClick={() => alert('Affichage de toutes les photos haute résolution du bien (12 clichés)')}
                  className="px-3.5 py-2 rounded-full bg-[#F4F6F5] hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#FA3055]" />
                  <span>Toutes les photos (12)</span>
                </button>

                {/* Satellite Pin */}
                <button
                  onClick={() => alert(`Coordonnées GPS terrain : ${featured.coordinates.latitude}, ${featured.coordinates.longitude}`)}
                  className="w-8 h-8 rounded-full bg-[#F4F6F5] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                  title="Afficher le point GPS"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>

              </div>

              {/* Zoom & View Controls */}
              <div className="flex items-center gap-1 bg-[#F4F6F5] p-1 rounded-full text-slate-700">
                <button 
                  title="Agrandir"
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button 
                  title="Réduire"
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button 
                  title="Plein écran"
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Floor Plan Cutaway Canvas with Interactive Room Pins */}
            <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
              
              {/* Architectural 3D Rendering of Floor Plan */}
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80"
                alt="Plan architectural 3D"
                className="absolute inset-0 w-full h-full object-cover opacity-75 filter contrast-105"
              />

              {/* Overlay Vignette */}
              <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />

              {/* Left quick-nav tool pills */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                <button 
                  title="8 pièces"
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#FA3055] font-black text-xs flex items-center justify-center shadow-lg hover:bg-white"
                >
                  8
                </button>
                <button 
                  title="Parking / garage"
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-slate-800 flex items-center justify-center shadow-lg hover:bg-white"
                >
                  <Car className="w-4 h-4" />
                </button>
                <button 
                  title="Salon / réception"
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-slate-800 flex items-center justify-center shadow-lg hover:bg-white"
                >
                  <Coffee className="w-4 h-4" />
                </button>
              </div>

              {/* Interactive Room Pin: Bedroom */}
              <div 
                className="absolute top-[38%] left-[46%] z-20 transition-all cursor-pointer group"
                onClick={() => setActiveRoomPin('Bedroom')}
              >
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-2xl transition-all ${
                  activeRoomPin === 'Bedroom'
                    ? 'bg-[#FA3055] text-white font-bold scale-110 ring-4 ring-[#FA3055]/40'
                    : 'bg-white/90 text-slate-800 font-semibold hover:bg-white'
                }`}>
                  <Bed className={`w-3.5 h-3.5 ${activeRoomPin === 'Bedroom' ? 'text-[#FA3055]' : 'text-slate-900'}`} />
                  <span className="text-xs">Chambre principale</span>
                  <span className="text-[10px] opacity-80">5 photos</span>
                </div>
              </div>

              {/* Interactive Room Pin: Living room */}
              <div 
                className="absolute top-[60%] right-[32%] z-20 transition-all cursor-pointer group"
                onClick={() => setActiveRoomPin('Living')}
              >
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-2xl transition-all ${
                  activeRoomPin === 'Living'
                    ? 'bg-[#FA3055] text-white font-bold scale-110 ring-4 ring-[#FA3055]/40'
                    : 'bg-white/90 text-slate-800 font-semibold hover:bg-white'
                }`}>
                  <Home className={`w-3.5 h-3.5 ${activeRoomPin === 'Living' ? 'text-[#FA3055]' : 'text-slate-900'}`} />
                  <span className="text-xs">Grand séjour</span>
                </div>
              </div>

              {/* Interactive Room Pin: Terrace */}
              <div 
                className="absolute bottom-[18%] left-[28%] z-20 transition-all cursor-pointer group"
                onClick={() => setActiveRoomPin('Terrace')}
              >
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-2xl transition-all ${
                  activeRoomPin === 'Terrace'
                    ? 'bg-[#FA3055] text-white font-bold scale-110 ring-4 ring-[#FA3055]/40'
                    : 'bg-white/90 text-slate-800 font-semibold hover:bg-white'
                }`}>
                  <Sparkles className={`w-3.5 h-3.5 ${activeRoomPin === 'Terrace' ? 'text-[#FA3055]' : 'text-slate-900'}`} />
                  <span className="text-xs">Terrasse sur l'océan</span>
                </div>
              </div>

              {/* Active Room Floating Details Pill */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-4 py-2 rounded-2xl text-xs z-10 flex items-center gap-3">
                <div>
                  <p className="font-bold text-[#FA3055]">{activeRoomPin === 'Bedroom' ? 'Suite parentale (32 m²)' : activeRoomPin === 'Living' ? 'Salon & cuisine ouverte (68 m²)' : 'Terrasse vue mer (45 m²)'}</p>
                  <p className="text-[10px] text-slate-400">Relevé terrain SQLite géoréférencé</p>
                </div>
                <button
                  onClick={() => alert(`Relevé de mesures pour ${activeRoomPin}`)}
                  className="px-2.5 py-1 bg-[#FA3055] text-white font-bold rounded-lg text-[10px] hover:bg-[#E02045]"
                >
                  Voir le plan
                </button>
              </div>

            </div>

          </div>
          </>
          )}

        </div>

      </div>

    </div>
  );
};
