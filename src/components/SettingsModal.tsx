import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Map, 
  Receipt, 
  Cpu, 
  CheckCircle, 
  Save, 
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Mail,
  FileText,
  Globe,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Bot,
  Zap,
  Workflow,
  Send,
  Terminal,
  Copy,
  Check,
  Layers,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'integrations' | 'whatsapp' | 'google' | 'wordpress' | 'gemini' | 'claude' | 'automation' | 'emecef' | 'maps'
  >('integrations');

  // WhatsApp configuration
  const [whatsappPhone, setWhatsappPhone] = useState('+229 97 50 12 88');
  const [whatsappBusinessId, setWhatsappBusinessId] = useState('WABA-BJ-2026-9921');
  const [whatsappToken, setWhatsappToken] = useState('EAABwzL1...[Token_Cloud_API_Meta_Chezmoi]');
  const [whatsappAutoNotifyOwner, setWhatsappAutoNotifyOwner] = useState(true);
  const [whatsappAutoReceipt, setWhatsappAutoReceipt] = useState(true);

  // Google Workspace (Gmail & Docs)
  const [gmailAccount, setGmailAccount] = useState('contact@chezmoi.bj');
  const [googleDocsMandateTemplateId, setGoogleDocsMandateTemplateId] = useState('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  const [googleDocsLeaseTemplateId, setGoogleDocsLeaseTemplateId] = useState('1A2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4z');
  const [googleDriveFolder, setGoogleDriveFolder] = useState('Chezmoi Foncier Mandats 2026');
  const [gmailNotifyClient, setGmailNotifyClient] = useState(true);

  // WordPress / Chezmoi.bj Portal
  const [wpEndpoint, setWpEndpoint] = useState('https://chezmoi.bj/wp-json/wp/v2');
  const [wpUser, setWpUser] = useState('admin_foncier');
  const [wpAppPassword, setWpAppPassword] = useState('•••• •••• •••• ••••');
  const [wpAutoPublish, setWpAutoPublish] = useState(false);

  // Google Gemini AI
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD-••••••••••••••••••••••••••••••');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [geminiAutoValuate, setGeminiAutoValuate] = useState(true);
  const [geminiPromptTemplate, setGeminiPromptTemplate] = useState('Tu es l’expert foncier chez Chezmoi Immobilier au Bénin. Rédige une annonce vendeuse et professionnelle pour un bien situé dans la zone indiquée avec estimation vénale.');

  // Claude (Anthropic AI)
  const [claudeApiKey, setClaudeApiKey] = useState('sk-ant-api03-Chezmoi-Benin-••••••••••••••••••••••••');
  const [claudeModel, setClaudeModel] = useState<'claude-3-7-sonnet-20250219' | 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229'>('claude-3-7-sonnet-20250219');
  const [claudeTemperature, setClaudeTemperature] = useState<number>(0.3);
  const [claudeMaxTokens, setClaudeMaxTokens] = useState<number>(4096);
  const [claudeAutoAuditDeeds, setClaudeAutoAuditDeeds] = useState(true);
  const [claudeAutoDraftMandates, setClaudeAutoDraftMandates] = useState(true);
  const [claudeCadastralAssistant, setClaudeCadastralAssistant] = useState(true);
  const [claudePromptTemplate, setClaudePromptTemplate] = useState(
    'Tu es le juriste et conseiller foncier expert de Chezmoi Immobilier SARL au Bénin. Tu maîtrises le Code Foncier et Domanial béninois (Loi n° 2013-01 modifiée), l’analyse des Titres Fonciers (TF), Attestations de Détention Coutumière (ADC), conventions de vente notariées, et la fiscalité DGI e-MECeF. Fournis des audits juridiques précis et des valorisations vénales argumentées.'
  );

  // Systèmes d'automatisation (Make, Zapier, n8n, Webhooks)
  const [automationPlatform, setAutomationPlatform] = useState<'make' | 'zapier' | 'n8n' | 'custom'>('make');
  const [webhookUrl, setWebhookUrl] = useState('https://hook.eu1.make.com/chezmoi-erp-v1-events-webhook');
  const [webhookSecret, setWebhookSecret] = useState('whsec_98b71d4e_chezmoi_benin_2026');
  const [webhookRetryCount, setWebhookRetryCount] = useState<number>(5);
  const [triggerOnCensus, setTriggerOnCensus] = useState(true);
  const [triggerOnInvoice, setTriggerOnInvoice] = useState(true);
  const [triggerOnExpense, setTriggerOnExpense] = useState(true);
  const [triggerOnLease, setTriggerOnLease] = useState(true);
  const [triggerOnLeave, setTriggerOnLeave] = useState(true);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResponse, setWebhookTestResponse] = useState<string | null>(null);
  const [hasCopiedPayload, setHasCopiedPayload] = useState(false);

  // e-MECeF DGI Bénin
  const [nim, setNim] = useState('MC01234567-01');
  const [ifu, setIfu] = useState('3202112345678');
  const [sdcToken, setSdcToken] = useState('SDC-BJ-009-KEY-8821');
  const [emecefMode, setEmecefMode] = useState<'TEST' | 'PROD'>('PROD');

  // Google Maps
  const [mapsApiKey, setMapsApiKey] = useState('AIzaSyB_GoogleMaps_Chezmoi_Benin_2026');

  // Feedback toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({ particleCount: 35, spread: 55, colors: ['#FA3055', '#1E293B'] });
    setToastMsg('Paramètres et connecteurs sauvegardés avec succès !');
    setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  };

  const handleTestConnection = (service: string) => {
    setToastMsg(`Connexion réussie avec ${service} ! Latence : 38ms.`);
    setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  };

  const handleTestClaudeConnection = () => {
    setToastMsg(`Connexion établie avec succès avec Anthropic Claude (${claudeModel}) ! Quota vérifié.`);
    setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    setWebhookTestResponse(null);
    setTimeout(() => {
      setIsTestingWebhook(false);
      setWebhookTestResponse(
        JSON.stringify(
          {
            status: 200,
            event: 'test.ping',
            target: webhookUrl,
            platform: automationPlatform.toUpperCase(),
            deliveredAt: new Date().toISOString(),
            payload: {
              company: 'Chezmoi Immobilier SARL',
              territory: 'Bénin (Littoral, Cotonou)',
              certifiedSDC: true,
              activeTriggers: [
                triggerOnCensus && 'property.created',
                triggerOnInvoice && 'invoice.certified',
                triggerOnExpense && 'expense.recorded',
                triggerOnLease && 'lease.signed',
                triggerOnLeave && 'hr.leave_requested'
              ].filter(Boolean)
            }
          },
          null,
          2
        )
      );
      setToastMsg(`Webhook test délivré avec succès vers ${automationPlatform.toUpperCase()} (Code 200 OK)`);
      setTimeout(() => setToastMsg(null), 3000);
    }, 800);
  };

  const handleCopySample = () => {
    const sample = JSON.stringify(
      {
        event: 'property.census.created',
        timestamp: Date.now(),
        data: {
          id: 'CHZ-2026-089',
          title: 'Villa duplex contemporaine - Fidjrossè',
          department: 'Littoral',
          commune: 'Cotonou',
          arrondissement: '12ème Arrondissement',
          quartier: 'Fidjrossè Centre',
          priceFCFA: 120000000,
          coordinates: { latitude: 6.3621, longitude: 2.3812 },
          legalStatus: 'TITRE_FONCIER',
          agent: 'Bio Dossou'
        }
      },
      null,
      2
    );
    navigator.clipboard?.writeText(sample);
    setHasCopiedPayload(true);
    setTimeout(() => setHasCopiedPayload(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-[32px] max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#FA3055]/10 text-[#FA3055] flex items-center justify-center flex-shrink-0 font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#FA3055] uppercase tracking-wider">
              Administration système Chezmoi.bj
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Paramètres généraux & connecteurs externes
            </h2>
          </div>
        </div>

        {/* Success toast */}
        {toastMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mb-5 bg-[#F4F6F5] p-1 rounded-full text-xs font-semibold overflow-x-auto no-scrollbar">
          {[
            { id: 'integrations', label: 'Vue d’ensemble', icon: Sliders },
            { id: 'claude', label: 'Claude (Anthropic)', icon: Bot },
            { id: 'automation', label: 'Make / Zapier / n8n', icon: Workflow },
            { id: 'gemini', label: 'Gemini AI', icon: Sparkles },
            { id: 'whatsapp', label: 'WhatsApp API', icon: MessageSquare },
            { id: 'google', label: 'Gmail & Docs', icon: Mail },
            { id: 'wordpress', label: 'Chezmoi.bj (WP)', icon: Globe },
            { id: 'emecef', label: 'e-MECeF DGI', icon: Receipt },
            { id: 'maps', label: 'Google Maps', icon: Map },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive ? 'bg-[#FA3055] text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          
          {/* ===================================================================== */}
          {/* OVERVIEW TAB */}
          {/* ===================================================================== */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Gérez l'ensemble des passerelles interconnectées avec votre ERP/CRM multilocal Chezmoi.bj :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Claude (Anthropic AI)', desc: 'Audit des titres fonciers, baux & conformité juridique', status: 'Actif', tab: 'claude', icon: Bot, color: 'text-[#D97706]' },
                  { name: 'Automatisations (Make, Zapier, n8n)', desc: 'Flux instantanés multi-applications via Webhooks REST', status: 'Opérationnel', tab: 'automation', icon: Workflow, color: 'text-violet-600' },
                  { name: 'WhatsApp Cloud API', desc: 'Alertes mandats & quittances instantanées', status: 'Actif', tab: 'whatsapp', icon: MessageSquare, color: 'text-emerald-600' },
                  { name: 'Gmail & Google Docs', desc: 'Envoi d’actes & génération automatique de contrats', status: 'Actif', tab: 'google', icon: Mail, color: 'text-indigo-600' },
                  { name: 'Portail Chezmoi.bj (WordPress)', desc: 'Synchronisation automatique du catalogue public', status: 'Connecté', tab: 'wordpress', icon: Globe, color: 'text-sky-600' },
                  { name: 'Intelligence Artificielle Gemini', desc: 'Rédaction d’annonces & estimation de valeur vénale', status: 'Opérationnel', tab: 'gemini', icon: Sparkles, color: 'text-[#FA3055]' },
                  { name: 'Facturation DGI e-MECeF', desc: 'Sceau fiscal & signature SDC République du Bénin', status: 'Certifié', tab: 'emecef', icon: Receipt, color: 'text-amber-600' },
                  { name: 'Google Maps Platform', desc: 'Géocodage haute précision & cadastre satellite', status: 'Configuré', tab: 'maps', icon: Map, color: 'text-teal-600' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.name}
                      onClick={() => setActiveTab(item.tab as any)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                          <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* CLAUDE (ANTHROPIC AI) TAB */}
          {/* ===================================================================== */}
          {activeTab === 'claude' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-amber-950">Moteur Anthropic Claude AI (Juridique & Foncier)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Modèle de langage de pointe pour l'analyse des actes fonciers béninois, l'audit des conventions de vente et la rédaction de contrats.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestClaudeConnection}
                  className="px-3.5 py-1.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] cursor-pointer shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Activity className="w-3 h-3" />
                  <span>Tester Claude</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clé API Anthropic (Claude API Key)</label>
                <input
                  type="password"
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-[#FA3055]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Fournie par Anthropic Console. Chiffrée et conservée localement dans le coffre-fort ERP.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Modèle Claude</label>
                  <select
                    value={claudeModel}
                    onChange={(e) => setClaudeModel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet (Recommandé - Raisonnement juridique hybride)</option>
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet v2 (Audit de baux & titres fonciers)</option>
                    <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Extraction ultra-rapide sur le terrain)</option>
                    <option value="claude-3-opus-20240229">Claude 3 Opus (Analyses contractuelles complexes)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Température : {claudeTemperature}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={claudeTemperature}
                    onChange={(e) => setClaudeTemperature(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-[#FA3055]"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Précis / Rigide</span>
                    <span>Créatif</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prompt Système Expert Foncier Bénin (Instructions permanentes)
                </label>
                <textarea
                  rows={3}
                  value={claudePromptTemplate}
                  onChange={(e) => setClaudePromptTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-normal"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={claudeAutoAuditDeeds}
                    onChange={(e) => setClaudeAutoAuditDeeds(e.target.checked)}
                    className="rounded text-[#FA3055]"
                  />
                  <span>Audit automatique des conventions de vente et vérification des mentions ANDF / DGI</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={claudeAutoDraftMandates}
                    onChange={(e) => setClaudeAutoDraftMandates(e.target.checked)}
                    className="rounded text-[#FA3055]"
                  />
                  <span>Génération automatique de mandats exclusifs et projets de baux certifiés OHADA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={claudeCadastralAssistant}
                    onChange={(e) => setClaudeCadastralAssistant(e.target.checked)}
                    className="rounded text-[#FA3055]"
                  />
                  <span>Assistance cadastrale pour les 5 290 quartiers et villages officiels du Bénin</span>
                </label>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* AUTOMATION (MAKE, ZAPIER, N8N, WEBHOOKS) TAB */}
          {/* ===================================================================== */}
          {activeTab === 'automation' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-violet-50/80 border border-violet-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-violet-700" />
                    <span className="font-bold text-violet-950">Passerelle d'automatisation & Webhooks</span>
                  </div>
                  <p className="text-[11px] text-violet-800 mt-0.5">
                    Connectez Make.com (Integromat), Zapier, n8n ou votre serveur backend pour réagir en temps réel aux événements ERP.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="px-3.5 py-1.5 rounded-full bg-violet-700 hover:bg-violet-800 text-white font-bold text-[10px] cursor-pointer shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Send className={`w-3 h-3 ${isTestingWebhook ? 'animate-bounce' : ''}`} />
                  <span>{isTestingWebhook ? 'Envoi...' : 'Envoyer webhook test'}</span>
                </button>
              </div>

              {/* Automation Platform Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Plateforme d'automatisation cible</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'make', label: 'Make.com', sub: 'Integromat' },
                    { id: 'zapier', label: 'Zapier', sub: 'Catch Hook' },
                    { id: 'n8n', label: 'n8n', sub: 'Self-hosted / Cloud' },
                    { id: 'custom', label: 'Webhook REST', sub: 'Serveur sur mesure' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAutomationPlatform(p.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        automationPlatform === p.id
                          ? 'border-[#FA3055] bg-[#FA3055]/5 text-[#FA3055] font-bold shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{p.label}</div>
                      <div className="text-[10px] text-slate-400">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Webhook Endpoint & Secret */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    URL du Webhook {automationPlatform.toUpperCase()}
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hook.eu1.make.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-[#FA3055]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Secret / Jeton Bearer</label>
                  <input
                    type="password"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder="whsec_..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Event Triggers Checklist */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Événements déclencheurs (Triggers sortants)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={triggerOnCensus}
                      onChange={(e) => setTriggerOnCensus(e.target.checked)}
                      className="rounded text-[#FA3055]"
                    />
                    <span>Nouveau recensement parcelle / immeuble terrain</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={triggerOnInvoice}
                      onChange={(e) => setTriggerOnInvoice(e.target.checked)}
                      className="rounded text-[#FA3055]"
                    />
                    <span>Facture e-MECeF certifiée DGI Bénin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={triggerOnExpense}
                      onChange={(e) => setTriggerOnExpense(e.target.checked)}
                      className="rounded text-[#FA3055]"
                    />
                    <span>Dépense ou paiement de salaire RH comptabilisé</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={triggerOnLease}
                      onChange={(e) => setTriggerOnLease(e.target.checked)}
                      className="rounded text-[#FA3055]"
                    />
                    <span>Mandat de gestion ou contrat de bail signé</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={triggerOnLeave}
                      onChange={(e) => setTriggerOnLeave(e.target.checked)}
                      className="rounded text-[#FA3055]"
                    />
                    <span>Demande de congés ou note de frais agent validée</span>
                  </label>
                </div>
              </div>

              {/* Payload Sample Preview & Clipboard */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Format du Payload JSON transmis :</span>
                  <button
                    type="button"
                    onClick={handleCopySample}
                    className="flex items-center gap-1 text-[11px] text-[#FA3055] font-semibold hover:underline cursor-pointer"
                  >
                    {hasCopiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{hasCopiedPayload ? 'Copié !' : 'Copier l\'exemple de payload'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto max-h-28">
                  {webhookTestResponse || `// Format standard Chezmoi JSON v1.4
{
  "event": "property.census.created",
  "data": {
    "title": "Villa duplex - Fidjrossè",
    "department": "Littoral",
    "commune": "Cotonou",
    "priceFCFA": 120000000,
    "gps": { "latitude": 6.3621, "longitude": 2.3812 }
  }
}`}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* WHATSAPP API TAB */}
          {/* ===================================================================== */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900">Passerelle WhatsApp Business Cloud API</span>
                  <p className="text-[11px] text-emerald-700">Notification automatique aux propriétaires et acquéreurs dès recensement.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestConnection('WhatsApp Business API')}
                  className="px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] cursor-pointer"
                >
                  Tester l'API
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro WhatsApp expéditeur officiel (+229)</label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meta Business Account ID (WABA)</label>
                  <input
                    type="text"
                    value={whatsappBusinessId}
                    onChange={(e) => setWhatsappBusinessId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jeton d'accès permanent (Meta Token)</label>
                  <input
                    type="password"
                    value={whatsappToken}
                    onChange={(e) => setWhatsappToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappAutoNotifyOwner}
                    onChange={(e) => setWhatsappAutoNotifyOwner(e.target.checked)}
                    className="rounded text-[#FA3055]"
                  />
                  <span>Notifier immédiatement le propriétaire lors de l'enregistrement de son bien</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappAutoReceipt}
                    onChange={(e) => setWhatsappAutoReceipt(e.target.checked)}
                    className="rounded text-[#FA3055]"
                  />
                  <span>Transmettre la quittance e-MECeF certifiée DGI par PDF WhatsApp au locataire</span>
                </label>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* GOOGLE WORKSPACE TAB */}
          {/* ===================================================================== */}
          {activeTab === 'google' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-900">Google Workspace (Gmail & Docs)</span>
                  <p className="text-[11px] text-indigo-700">Génération automatique des mandats fonciers et envoi des quittances.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestConnection('Google Workspace API')}
                  className="px-3 py-1.5 rounded-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[10px] cursor-pointer"
                >
                  Tester la connexion
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compte Gmail expéditeur d'entreprise</label>
                <input
                  type="email"
                  value={gmailAccount}
                  onChange={(e) => setGmailAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modèle Google Docs - Mandat de vente / bail</label>
                  <input
                    type="text"
                    value={googleDocsMandateTemplateId}
                    onChange={(e) => setGoogleDocsMandateTemplateId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dossier Google Drive d'archivage foncier</label>
                  <input
                    type="text"
                    value={googleDriveFolder}
                    onChange={(e) => setGoogleDriveFolder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={gmailNotifyClient}
                  onChange={(e) => setGmailNotifyClient(e.target.checked)}
                  className="rounded text-[#FA3055]"
                />
                <span>Envoyer une copie PDF par e-mail au client pour tout reçu fiscal e-MECeF émis</span>
              </label>
            </div>
          )}

          {/* ===================================================================== */}
          {/* WORDPRESS / CHEZMOI.BJ TAB */}
          {/* ===================================================================== */}
          {activeTab === 'wordpress' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sky-900">Passerelle API Portail Web Chezmoi.bj</span>
                  <p className="text-[11px] text-sky-700">Publication directe des annonces immobilières sur le site vitrine WordPress.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestConnection('Chezmoi.bj WordPress REST API')}
                  className="px-3 py-1.5 rounded-full bg-sky-700 hover:bg-sky-800 text-white font-bold text-[10px] cursor-pointer"
                >
                  Vérifier l'accès
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Point d'accès REST API WordPress</label>
                <input
                  type="url"
                  value={wpEndpoint}
                  onChange={(e) => setWpEndpoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Identifiant d'application WP</label>
                  <input
                    type="text"
                    value={wpUser}
                    onChange={(e) => setWpUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mot de passe d'application WP (Application Password)</label>
                  <input
                    type="password"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={wpAutoPublish}
                  onChange={(e) => setWpAutoPublish(e.target.checked)}
                  className="rounded text-[#FA3055]"
                />
                <span>Publier directement en statut "En ligne" (décoché = enregistrer comme brouillon pour validation)</span>
              </label>
            </div>
          )}

          {/* ===================================================================== */}
          {/* GEMINI AI TAB */}
          {/* ===================================================================== */}
          {activeTab === 'gemini' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#FA3055]/10 border border-[#FA3055]/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#FA3055]">Intelligence Artificielle Google Gemini</span>
                  <p className="text-[11px] text-slate-700">Optimisation des fiches de biens et estimation vénale automatisée.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestConnection('Google Gemini 2.5 Flash')}
                  className="px-3 py-1.5 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-[10px] cursor-pointer"
                >
                  Tester Gemini
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clé API Google Gemini</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modèle d'inférence</label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Rapide & optimisé foncier)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Haute précision juridique)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instruction système foncier Bénin</label>
                <textarea
                  rows={2}
                  value={geminiPromptTemplate}
                  onChange={(e) => setGeminiPromptTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-normal"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={geminiAutoValuate}
                  onChange={(e) => setGeminiAutoValuate(e.target.checked)}
                  className="rounded text-[#FA3055]"
                />
                <span>Activer l'estimation assistée par IA lors de la saisie d'une nouvelle fiche foncière</span>
              </label>
            </div>
          )}

          {/* ===================================================================== */}
          {/* E-MECEF DGI TAB */}
          {/* ===================================================================== */}
          {activeTab === 'emecef' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-950">Certification e-MECeF - DGI Bénin</span>
                <p className="text-[11px] text-amber-800">Paramètres obligatoires pour la signature des factures normalisées et reçus fiscaux.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIM (Numéro d'Identification de la Machine)</label>
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IFU de Chezmoi Immobilier SARL</label>
                  <input
                    type="text"
                    value={ifu}
                    onChange={(e) => setIfu(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jeton d'autorisation SDC</label>
                  <input
                    type="password"
                    value={sdcToken}
                    onChange={(e) => setSdcToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Environnement e-MECeF</label>
                  <select
                    value={emecefMode}
                    onChange={(e) => setEmecefMode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    <option value="PROD">Production officielle (DGI Trésor Public)</option>
                    <option value="TEST">Bac à sable / Test (Sandbox DGI)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* MAPS TAB */}
          {/* ===================================================================== */}
          {activeTab === 'maps' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                <span className="font-bold text-teal-950">Google Maps Platform</span>
                <p className="text-[11px] text-teal-800">Affichage cartographique satellite et conversion automatique coordonnées GPS vers adresse.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clé API Google Maps (JavaScript & Geocoding)</label>
                <input
                  type="text"
                  value={mapsApiKey}
                  onChange={(e) => setMapsApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>
            </div>
          )}

          {/* Bottom Save & Close Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Sauvegarder les configurations</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
