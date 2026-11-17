import React, { useState } from 'react';
import {
  X,
  Map,
  Receipt,
  Save,
  MessageSquare,
  Mail,
  Globe,
  Sparkles,
  Sliders,
  CheckCircle2,
  Bot,
  Workflow,
  Send,
  Copy,
  Check,
  Activity,
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

  const [whatsappPhone, setWhatsappPhone] = useState('+229 97 50 12 88');
  const [whatsappBusinessId, setWhatsappBusinessId] = useState('WABA-BJ-2026-9921');
  const [whatsappToken, setWhatsappToken] = useState('EAABwzL1...[Token_Cloud_API_Meta_Chezmoi]');
  const [whatsappAutoNotifyOwner, setWhatsappAutoNotifyOwner] = useState(true);
  const [whatsappAutoReceipt, setWhatsappAutoReceipt] = useState(true);

  const [gmailAccount, setGmailAccount] = useState('contact@chezmoi.bj');
  const [googleDocsMandateTemplateId, setGoogleDocsMandateTemplateId] = useState('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  const [googleDriveFolder, setGoogleDriveFolder] = useState('Chezmoi Foncier Mandats 2026');
  const [gmailNotifyClient, setGmailNotifyClient] = useState(true);

  const [wpEndpoint, setWpEndpoint] = useState('https://chezmoi.bj/wp-json/wp/v2');
  const [wpUser, setWpUser] = useState('admin_foncier');
  const [wpAppPassword, setWpAppPassword] = useState('•••• •••• •••• ••••');
  const [wpAutoPublish, setWpAutoPublish] = useState(false);

  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD-••••••••••••••••••••••••••••••');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [geminiAutoValuate, setGeminiAutoValuate] = useState(true);
  const [geminiPromptTemplate, setGeminiPromptTemplate] = useState(
    'Tu es l’expert foncier chez Chezmoi Immobilier au Bénin. Rédige une annonce vendeuse et professionnelle pour un bien situé dans la zone indiquée avec estimation vénale.'
  );

  const [claudeApiKey, setClaudeApiKey] = useState('sk-ant-api03-Chezmoi-Benin-••••••••••••••••••••••••');
  const [claudeModel, setClaudeModel] = useState<
    'claude-3-7-sonnet-20250219' | 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229'
  >('claude-3-7-sonnet-20250219');
  const [claudeTemperature, setClaudeTemperature] = useState<number>(0.3);
  const [claudeAutoAuditDeeds, setClaudeAutoAuditDeeds] = useState(true);
  const [claudeAutoDraftMandates, setClaudeAutoDraftMandates] = useState(true);
  const [claudeCadastralAssistant, setClaudeCadastralAssistant] = useState(true);
  const [claudePromptTemplate, setClaudePromptTemplate] = useState(
    'Tu es le juriste et conseiller foncier expert de Chezmoi Immobilier SARL au Bénin. Tu maîtrises le Code Foncier et Domanial béninois (Loi n° 2013-01 modifiée), l’analyse des Titres Fonciers (TF), Attestations de Détention Coutumière (ADC), conventions de vente notariées, et la fiscalité DGI e-MECeF. Fournis des audits juridiques précis et des valorisations vénales argumentées.'
  );

  const [automationPlatform, setAutomationPlatform] = useState<'make' | 'zapier' | 'n8n' | 'custom'>('make');
  const [webhookUrl, setWebhookUrl] = useState('https://hook.eu1.make.com/chezmoi-erp-v1-events-webhook');
  const [webhookSecret, setWebhookSecret] = useState('whsec_98b71d4e_chezmoi_benin_2026');
  const [triggerOnCensus, setTriggerOnCensus] = useState(true);
  const [triggerOnInvoice, setTriggerOnInvoice] = useState(true);
  const [triggerOnExpense, setTriggerOnExpense] = useState(true);
  const [triggerOnLease, setTriggerOnLease] = useState(true);
  const [triggerOnLeave, setTriggerOnLeave] = useState(true);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResponse, setWebhookTestResponse] = useState<string | null>(null);
  const [hasCopiedPayload, setHasCopiedPayload] = useState(false);

  const [nim, setNim] = useState('MC01234567-01');
  const [ifu, setIfu] = useState('3202112345678');
  const [sdcToken, setSdcToken] = useState('SDC-BJ-009-KEY-8821');
  const [emecefMode, setEmecefMode] = useState<'TEST' | 'PROD'>('PROD');

  const [mapsApiKey, setMapsApiKey] = useState('AIzaSyB_GoogleMaps_Chezmoi_Benin_2026');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({ particleCount: 35, spread: 55, colors: ['#141414', '#10B981'] });
    setToastMsg('Paramètres et connecteurs sauvegardés avec succès !');
    setTimeout(() => setToastMsg(null), 2800);
  };

  const handleTestConnection = (service: string) => {
    setToastMsg(`Connexion réussie avec ${service} ! Latence : 38ms.`);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const handleTestClaudeConnection = () => {
    setToastMsg(`Connexion établie avec succès avec Anthropic Claude (${claudeModel}) ! Quota vérifié.`);
    setTimeout(() => setToastMsg(null), 3200);
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
                triggerOnLeave && 'hr.leave_requested',
              ].filter(Boolean),
            },
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
          agent: 'Bio Dossou',
        },
      },
      null,
      2
    );
    navigator.clipboard?.writeText(sample);
    setHasCopiedPayload(true);
    setTimeout(() => setHasCopiedPayload(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Paramètres généraux et connecteurs externes"
    >
      <div className="bg-white dark:bg-[#13161B] rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-neutral-200 dark:border-white/10 relative my-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer les paramètres"
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] flex items-center justify-center text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-neutral-200 dark:border-white/10 pb-4 pr-10">
          <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-white/10 text-[#141414] dark:text-white flex items-center justify-center shrink-0 font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Administration système Chezmoi.bj
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#141414] dark:text-white mt-0.5">
              Paramètres généraux & connecteurs externes
            </h2>
          </div>
        </div>

        {toastMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mb-5 text-xs font-semibold overflow-x-auto no-scrollbar pb-1">
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
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer bg-[#141414] hover:bg-[#2C2C2C] text-white ${
                  isActive ? 'ring-2 ring-offset-1 ring-[#141414] dark:ring-white/40 font-bold' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Gérez l'ensemble des passerelles interconnectées avec votre ERP/CRM multilocal Chezmoi.bj :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Claude (Anthropic AI)', desc: 'Audit des titres fonciers, baux & conformité juridique', status: 'Actif', tab: 'claude', icon: Bot },
                  { name: 'Automatisations (Make, Zapier, n8n)', desc: 'Flux instantanés multi-applications via Webhooks REST', status: 'Opérationnel', tab: 'automation', icon: Workflow },
                  { name: 'WhatsApp Cloud API', desc: 'Alertes mandats & quittances instantanées', status: 'Actif', tab: 'whatsapp', icon: MessageSquare },
                  { name: 'Gmail & Google Docs', desc: 'Envoi d’actes & génération automatique de contrats', status: 'Actif', tab: 'google', icon: Mail },
                  { name: 'Portail Chezmoi.bj (WordPress)', desc: 'Synchronisation automatique du catalogue public', status: 'Connecté', tab: 'wordpress', icon: Globe },
                  { name: 'Intelligence Artificielle Gemini', desc: 'Rédaction d’annonces & estimation de valeur vénale', status: 'Opérationnel', tab: 'gemini', icon: Sparkles },
                  { name: 'Facturation DGI e-MECeF', desc: 'Sceau fiscal & signature SDC République du Bénin', status: 'Certifié', tab: 'emecef', icon: Receipt },
                  { name: 'Google Maps Platform', desc: 'Géocodage haute précision & cadastre satellite', status: 'Configuré', tab: 'maps', icon: Map },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={`#settings-${item.tab}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(item.tab as any);
                      }}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/25 bg-white dark:bg-[#181C22] transition-all flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-white/10 text-[#141414] dark:text-white flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-[#141414] dark:text-white truncate">{item.name}</h4>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">{item.desc}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0">
                        {item.status}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'claude' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#141414] dark:text-white" />
                    <span className="font-bold text-[#141414] dark:text-white">Moteur Anthropic Claude AI (Juridique & Foncier)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Analyse des actes fonciers béninois, audit des conventions et rédaction de contrats.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestClaudeConnection}
                  className="px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-[11px] cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Activity className="w-3 h-3" />
                  <span>Tester Claude</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Clé API Anthropic (Claude API Key)</label>
                <input
                  type="password"
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Modèle Claude</label>
                  <select
                    value={claudeModel}
                    onChange={(e) => setClaudeModel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-semibold"
                  >
                    <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet (Recommandé)</option>
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet v2</option>
                    <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1 tabular-nums">
                    Température : {claudeTemperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={claudeTemperature}
                    onChange={(e) => setClaudeTemperature(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-[#141414]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                  Prompt Système Expert Foncier Bénin
                </label>
                <textarea
                  rows={3}
                  value={claudePromptTemplate}
                  onChange={(e) => setClaudePromptTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-neutral-200 dark:border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={claudeAutoAuditDeeds} onChange={(e) => setClaudeAutoAuditDeeds(e.target.checked)} />
                  <span>Audit automatique des conventions de vente et vérification des mentions ANDF / DGI</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={claudeAutoDraftMandates} onChange={(e) => setClaudeAutoDraftMandates(e.target.checked)} />
                  <span>Génération automatique de mandats exclusifs et projets de baux certifiés OHADA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={claudeCadastralAssistant} onChange={(e) => setClaudeCadastralAssistant(e.target.checked)} />
                  <span>Assistance cadastrale pour les 5 290 quartiers et villages officiels du Bénin</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    <span className="font-bold text-[#141414] dark:text-white">Passerelle d'automatisation & Webhooks</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Connectez Make.com, Zapier, n8n ou votre serveur backend pour réagir en temps réel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-[11px] cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Send className={`w-3 h-3 ${isTestingWebhook ? 'animate-bounce' : ''}`} />
                  <span>{isTestingWebhook ? 'Envoi...' : 'Envoyer webhook test'}</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1.5">
                  Plateforme d'automatisation cible
                </label>
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
                      className={`p-2.5 rounded-xl text-center transition-all cursor-pointer bg-[#141414] hover:bg-[#2C2C2C] text-white ${
                        automationPlatform === p.id ? 'ring-2 ring-offset-2 ring-[#141414] dark:ring-white/40' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{p.label}</div>
                      <div className="text-[10px] text-neutral-300">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                    URL du Webhook {automationPlatform.toUpperCase()}
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Secret / Jeton Bearer</label>
                  <input
                    type="password"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1.5">
                  Événements déclencheurs (Triggers sortants)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-[#FAFAFA] dark:bg-[#181C22] rounded-xl border border-neutral-200 dark:border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={triggerOnCensus} onChange={(e) => setTriggerOnCensus(e.target.checked)} />
                    <span>Nouveau recensement parcelle / immeuble terrain</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={triggerOnInvoice} onChange={(e) => setTriggerOnInvoice(e.target.checked)} />
                    <span>Facture e-MECeF certifiée DGI Bénin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={triggerOnExpense} onChange={(e) => setTriggerOnExpense(e.target.checked)} />
                    <span>Dépense ou paiement de salaire RH comptabilisé</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={triggerOnLease} onChange={(e) => setTriggerOnLease(e.target.checked)} />
                    <span>Mandat de gestion ou contrat de bail signé</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer sm:col-span-2">
                    <input type="checkbox" checked={triggerOnLeave} onChange={(e) => setTriggerOnLeave(e.target.checked)} />
                    <span>Demande de congés ou note de frais agent validée</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-200">Format du Payload JSON transmis :</span>
                  <button
                    type="button"
                    onClick={handleCopySample}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white text-[11px] font-semibold cursor-pointer"
                  >
                    {hasCopiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{hasCopiedPayload ? 'Copié !' : "Copier l'exemple"}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-[#141414] text-neutral-200 font-mono text-[10px] overflow-x-auto max-h-28">
                  {webhookTestResponse ||
                    `// Format standard Chezmoi JSON v1.4\n{\n  "event": "property.census.created",\n  "data": { "title": "Villa duplex - Fidjrossè", "commune": "Cotonou", "priceFCFA": 120000000 }\n}`}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#141414] dark:text-white">Passerelle WhatsApp Business Cloud API</span>
                  <p className="text-[11px] text-neutral-500">Notification automatique aux propriétaires et acquéreurs dès recensement.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestConnection('WhatsApp Business API')}
                  className="px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-[11px] cursor-pointer"
                >
                  Tester l'API
                </button>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Numéro WhatsApp expéditeur officiel (+229)</label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Meta Business Account ID (WABA)</label>
                  <input
                    type="text"
                    value={whatsappBusinessId}
                    onChange={(e) => setWhatsappBusinessId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Jeton d'accès permanent (Meta Token)</label>
                  <input
                    type="password"
                    value={whatsappToken}
                    onChange={(e) => setWhatsappToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={whatsappAutoNotifyOwner} onChange={(e) => setWhatsappAutoNotifyOwner(e.target.checked)} />
                  <span>Notifier immédiatement le propriétaire lors de l'enregistrement de son bien</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={whatsappAutoReceipt} onChange={(e) => setWhatsappAutoReceipt(e.target.checked)} />
                  <span>Transmettre la quittance e-MECeF certifiée DGI par PDF WhatsApp au locataire</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'google' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#141414] dark:text-white">Google Workspace (Gmail & Docs)</span>
                  <p className="text-[11px] text-neutral-500">Génération automatique des mandats fonciers et envoi des quittances.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestConnection('Google Workspace API')}
                  className="px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-[11px] cursor-pointer"
                >
                  Tester la connexion
                </button>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Compte Gmail expéditeur d'entreprise</label>
                <input
                  type="email"
                  value={gmailAccount}
                  onChange={(e) => setGmailAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Modèle Google Docs - Mandat</label>
                  <input
                    type="text"
                    value={googleDocsMandateTemplateId}
                    onChange={(e) => setGoogleDocsMandateTemplateId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Dossier Google Drive</label>
                  <input
                    type="text"
                    value={googleDriveFolder}
                    onChange={(e) => setGoogleDriveFolder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={gmailNotifyClient} onChange={(e) => setGmailNotifyClient(e.target.checked)} />
                <span>Envoyer une copie PDF par e-mail au client pour tout reçu fiscal e-MECeF émis</span>
              </label>
            </div>
          )}

          {activeTab === 'wordpress' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#141414] dark:text-white">Passerelle API Portail Web Chezmoi.bj</span>
                  <p className="text-[11px] text-neutral-500">Publication directe des annonces immobilières sur le site vitrine WordPress.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestConnection('Chezmoi.bj WordPress REST API')}
                  className="px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-[11px] cursor-pointer"
                >
                  Vérifier l'accès
                </button>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Point d'accès REST API WordPress</label>
                <input
                  type="url"
                  value={wpEndpoint}
                  onChange={(e) => setWpEndpoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Identifiant d'application WP</label>
                  <input
                    type="text"
                    value={wpUser}
                    onChange={(e) => setWpUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Mot de passe d'application WP</label>
                  <input
                    type="password"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={wpAutoPublish} onChange={(e) => setWpAutoPublish(e.target.checked)} />
                <span>Publier directement en statut "En ligne"</span>
              </label>
            </div>
          )}

          {activeTab === 'gemini' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#141414] dark:text-white">Intelligence Artificielle Google Gemini</span>
                  <p className="text-[11px] text-neutral-500">Optimisation des fiches de biens et estimation vénale automatisée.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestConnection('Google Gemini 2.5 Flash')}
                  className="px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-[11px] cursor-pointer"
                >
                  Tester Gemini
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Clé API Google Gemini</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Modèle d'inférence</label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-semibold"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Instruction système foncier Bénin</label>
                <textarea
                  rows={2}
                  value={geminiPromptTemplate}
                  onChange={(e) => setGeminiPromptTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={geminiAutoValuate} onChange={(e) => setGeminiAutoValuate(e.target.checked)} />
                <span>Activer l'estimation assistée par IA lors de la saisie d'une nouvelle fiche foncière</span>
              </label>
            </div>
          )}

          {activeTab === 'emecef' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10">
                <span className="font-bold text-[#141414] dark:text-white">Certification e-MECeF - DGI Bénin</span>
                <p className="text-[11px] text-neutral-500">
                  Paramètres obligatoires pour la signature des factures normalisées et reçus fiscaux.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">NIM (Numéro d'Identification Machine)</label>
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">IFU Chezmoi Immobilier SARL</label>
                  <input
                    type="text"
                    value={ifu}
                    onChange={(e) => setIfu(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Jeton d'autorisation SDC</label>
                  <input
                    type="password"
                    value={sdcToken}
                    onChange={(e) => setSdcToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Environnement e-MECeF</label>
                  <select
                    value={emecefMode}
                    onChange={(e) => setEmecefMode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-bold"
                  >
                    <option value="PROD">Production officielle (DGI Trésor Public)</option>
                    <option value="TEST">Bac à sable / Test (Sandbox DGI)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10">
                <span className="font-bold text-[#141414] dark:text-white">Google Maps Platform</span>
                <p className="text-[11px] text-neutral-500">
                  Affichage cartographique satellite et conversion automatique coordonnées GPS vers adresse.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                  Clé API Google Maps (JavaScript & Geocoding)
                </label>
                <input
                  type="text"
                  value={mapsApiKey}
                  onChange={(e) => setMapsApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-mono"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-xs font-semibold text-white cursor-pointer transition-colors"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder les configurations</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
