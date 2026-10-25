import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Receipt, 
  QrCode, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Printer, 
  ShieldCheck,
  PlusCircle,
  TrendingDown,
  Building,
  Filter,
  FileText,
  DollarSign,
  Fuel,
  Wifi,
  Users,
  Briefcase,
  Megaphone,
  Wrench,
  HelpCircle,
  Calendar,
  User,
  CreditCard as PaymentIcon,
  PieChart,
  BarChart3,
  Download,
  Wallet,
  Edit2,
  Trash2,
  Plus,
  X,
  Sliders,
  Eye,
  CheckSquare,
  Square,
  Info,
  Sparkles,
  RotateCcw,
  Phone,
  MapPin,
  Search,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CashTransaction, UserAccount } from '../types';
import { 
  processStandardizedInvoice, 
  StandardizedInvoiceResult,
  DgiTaxGroup,
  DGI_TAX_GROUPS,
  EMecefInvoiceItem,
  calculateInvoiceTotals,
  calculateTaxBreakdown,
  PREDEFINED_DGI_SERVICES,
  numberToFrenchWords
} from '../utils/emecef';
import { ChezmoiLogo } from './ChezmoiLogo';

interface EMecefModuleProps {
  transactions: CashTransaction[];
  onAddTransaction: (tx: CashTransaction) => void;
  currency: 'FCFA' | 'USD';
  employees?: UserAccount[];
}

export const EMecefModule: React.FC<EMecefModuleProps> = ({
  transactions,
  onAddTransaction,
  currency,
  employees = [],
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'new_expense' | 'cashbook' | 'reports'>('invoices');
  
  // =========================================================================
  // e-MECeF DGI Bénin - Facturation multi-articles / multi-lignes
  // =========================================================================
  const [invoiceItems, setInvoiceItems] = useState<EMecefInvoiceItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => `FV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceType, setInvoiceType] = useState<'FACTURE_VENTE' | 'FACTURE_NORMALISEE' | 'FACTURE_AVOIR' | 'FACTURE_PROFORMA'>('FACTURE_VENTE');
  const [invoiceDate, setInvoiceDate] = useState<string>(() => {
    const now = new Date();
    return `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`;
  });
  const [sellerName, setSellerName] = useState('SFE en ligne');
  const [additionalDescription, setAdditionalDescription] = useState('');

  // Coordonnées du Client
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientIfu, setClientIfu] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Mode de paiement & montant payé
  const [paymentMode, setPaymentMode] = useState<'ESPECES' | 'MOBILE_MONEY' | 'VIREMENT' | 'CHEQUE'>('ESPECES');
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Formats d'impression et options de sélection sélective
  const [printFormat, setPrintFormat] = useState<'A4_COULEUR' | 'A4_NB' | 'TICKET_80MM'>('A4_COULEUR');
  const [printOptions, setPrintOptions] = useState({
    showHeader: true,
    showCompanyBox: true,
    showClient: true,
    showInvoiceMeta: true,
    showAdditionalDesc: true,
    showArticlesTable: true,
    showTaxVentilation: true,
    showPaymentBreakdown: true,
    showAmountInWords: true,
    showSecurityBlock: true,
  });

  // Visibilité des modales e-SFE
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintOptionsModalOpen, setIsPrintOptionsModalOpen] = useState(false);

  // Formulaire d'édition / ajout d'article (champs conformes DGI)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemDesignation, setItemDesignation] = useState('');
  const [itemGroup, setItemGroup] = useState<DgiTaxGroup>('B');
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemSpecificTax, setItemSpecificTax] = useState<number>(0);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Sceau SDC / DGI
  const [isSealed, setIsSealed] = useState(false);
  const [sealedInvoice, setSealedInvoice] = useState<StandardizedInvoiceResult | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Calculs dynamiques de l'ensemble de la facture
  const invoiceTotals = calculateInvoiceTotals(invoiceItems);
  const taxBreakdown = calculateTaxBreakdown(invoiceItems);
  const totalInWords = numberToFrenchWords(invoiceTotals.totalTTC);

  // Calculs dynamiques pour le bloc "Sommaire" de la modale article
  const modalRawTotal = (Number(itemQuantity) || 0) * (Number(itemUnitPrice) || 0);
  const modalTS = Number(itemSpecificTax) || 0;
  const modalTotalTTC = modalRawTotal + modalTS;
  let modalBaseImposable = modalRawTotal;
  let modalTax = 0;
  if (itemGroup === 'B' || itemGroup === 'D') {
    modalBaseImposable = modalRawTotal > 0 ? Math.round(modalRawTotal / 1.18) : 0;
    modalTax = modalRawTotal - modalBaseImposable;
  }

  // Génération du QR Code officiel e-MECeF DGI Bénin
  useEffect(() => {
    const nim = 'EM01508441';
    const ifu = '0202361063128';
    const sdc = 'SDC-BJ-009';
    const code = sealedInvoice?.securityCode || '0202-3610-6312-8001';
    const payload = `${nim}*${ifu}*${sdc}*${new Date().toISOString()}*${invoiceTotals.totalTTC}*${code}`;
    QRCode.toDataURL(payload, { width: 140, margin: 1, errorCorrectionLevel: 'M' })
      .then(url => setQrCodeDataUrl(url))
      .catch(() => setQrCodeDataUrl(''));
  }, [invoiceTotals.totalTTC, sealedInvoice?.securityCode]);

  // Synchronisation du montant payé avec le total si non personnalisé
  useEffect(() => {
    if (amountPaid === 0 && invoiceTotals.totalTTC > 0) {
      setAmountPaid(invoiceTotals.totalTTC);
    }
  }, [invoiceTotals.totalTTC]);

  // Ouvrir la modale pour ajouter un nouvel article
  const handleOpenAddArticle = () => {
    setEditingItemIndex(null);
    setItemDesignation('');
    setItemGroup('B');
    setItemUnitPrice(0);
    setItemQuantity(1);
    setItemSpecificTax(0);
    setIsArticleModalOpen(true);
  };

  // Ouvrir la modale pour modifier un article existant
  const handleOpenEditArticle = (index: number) => {
    const item = invoiceItems[index];
    if (!item) return;
    setEditingItemIndex(index);
    setItemDesignation(item.designation);
    setItemGroup(item.taxGroup);
    setItemUnitPrice(item.unitPriceTTC);
    setItemQuantity(item.quantity);
    setItemSpecificTax(item.specificTax || 0);
    setIsArticleModalOpen(true);
  };

  // Enregistrer ou modifier l'article
  const handleSaveArticle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!itemDesignation.trim()) return;

    const qty = Number(itemQuantity) || 1;
    const price = Number(itemUnitPrice) || 0;
    const ts = Number(itemSpecificTax) || 0;

    const newItem: EMecefInvoiceItem = {
      id: editingItemIndex !== null ? invoiceItems[editingItemIndex].id : `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      designation: itemDesignation.trim(),
      quantity: qty,
      unitPriceTTC: price,
      specificTax: ts,
      taxGroup: itemGroup,
      selectedForPrint: editingItemIndex !== null ? (invoiceItems[editingItemIndex].selectedForPrint ?? true) : true,
    };

    if (editingItemIndex !== null) {
      const updated = [...invoiceItems];
      updated[editingItemIndex] = newItem;
      setInvoiceItems(updated);
    } else {
      setInvoiceItems([...invoiceItems, newItem]);
    }

    setIsArticleModalOpen(false);
    setIsCatalogModalOpen(false);
  };

  // Supprimer un article
  const handleDeleteArticle = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  // Basculer l'inclusion à l'impression d'un article
  const handleToggleArticlePrint = (index: number) => {
    const updated = [...invoiceItems];
    updated[index] = {
      ...updated[index],
      selectedForPrint: updated[index].selectedForPrint === false ? true : false,
    };
    setInvoiceItems(updated);
  };

  // Sceller et valider la facture aux normes DGI Bénin
  const handleSealInvoice = () => {
    if (invoiceItems.length === 0) {
      alert('Veuillez ajouter au moins un article avant de sceller la facture.');
      return;
    }

    const result = processStandardizedInvoice({
      invoiceNumber,
      invoiceType,
      clientName: clientName.trim() || 'Client au comptant',
      clientPhone: clientPhone.trim() || '+229 00 00 00 00',
      clientIFU: clientIfu.trim(),
      clientAddress: clientAddress.trim(),
      providerName: 'Chezmoi immobilier',
      sellerName,
      additionalDescription: additionalDescription.trim(),
      items: invoiceItems,
      paymentMode,
      amountPaid: amountPaid || invoiceTotals.totalTTC,
      nim: 'EM01508441',
      ifuSeller: '0202361063128',
      sdcId: 'SDC-BJ-009',
      timestamp: Date.now(),
    });

    setSealedInvoice(result);
    setIsSealed(true);

    // Enregistrement automatique de la transaction dans le journal de caisse
    const newTx: CashTransaction = {
      id: `tx_${Date.now()}`,
      code: `FAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'ENTREE',
      category: 'COMMISSION_VENTE',
      amount: invoiceTotals.totalTTC,
      description: invoiceItems.map(i => i.designation).join(', ').substring(0, 100),
      agentOrClient: clientName.trim() || 'Client comptant',
      paymentMode,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      emecefInvoiceRef: invoiceNumber,
    };
    onAddTransaction(newTx);

    confetti({ particleCount: 40, spread: 60, colors: ['#FA3055', '#10B981', '#1E293B'] });
  };

  // Réinitialiser la facture pour une nouvelle vente
  const handleResetInvoice = () => {
    setInvoiceItems([]);
    setInvoiceNumber(`FV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    const now = new Date();
    setInvoiceDate(`${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`);
    setClientName('');
    setClientPhone('');
    setClientIfu('');
    setClientAddress('');
    setAdditionalDescription('');
    setAmountPaid(0);
    setIsSealed(false);
    setSealedInvoice(null);
  };

  // Déclencher l'impression du document
  const handlePrint = () => {
    window.print();
  };

  // Expense form state (Purged to ZERO / empty by default)
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState<
    'SALAIRE_REMUNERATION' | 'DEPLACEMENT' | 'FOURNITURES' | 'LOYER' | 'TELECOM' | 'MARKETING' | 'MAINTENANCE' | 'AUTRE'
  >('SALAIRE_REMUNERATION');
  const [expenseBeneficiary, setExpenseBeneficiary] = useState('');
  const [salaryType, setSalaryType] = useState<'SALAIRE_FIXE' | 'COMMISSION_TERRAIN' | 'AVANCE' | 'PRIME'>('SALAIRE_FIXE');
  const [salaryMonth, setSalaryMonth] = useState('Octobre 2026');
  const [expensePaymentMode, setExpensePaymentMode] = useState<'ESPECES' | 'MOBILE_MONEY' | 'VIREMENT' | 'CHEQUE'>('VIREMENT');
  const [expenseReceiptRef, setExpenseReceiptRef] = useState(`BS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [expenseNotes, setExpenseNotes] = useState('');

  // Filter state for cashbook
  const [cashFilter, setCashFilter] = useState<'ALL' | 'ENTREE' | 'SORTIE'>('ALL');
  
  // Accounting Reports State
  const [reportPeriod, setReportPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedReportDate, setSelectedReportDate] = useState('2026-10-15');
  const [selectedReportMonth, setSelectedReportMonth] = useState('2026-10');
  const [selectedReportYear, setSelectedReportYear] = useState('2026');

  const handleRegisterExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const isSalary = expenseCategory === 'SALAIRE_REMUNERATION';
    const computedTitle = isSalary 
      ? `Salaire & rémunération (${salaryType.replace('_', ' ')}) - ${salaryMonth} : ${expenseBeneficiary}`
      : expenseTitle.trim() || 'Dépense d’exploitation';

    const newExpenseTx: CashTransaction = {
      id: `tx_exp_${Date.now()}`,
      code: `DEP-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: 'SORTIE',
      category: isSalary ? 'SALAIRE_REMUNERATION' : 'DEPENSE_SOCIETE',
      amount: Number(expenseAmount),
      description: computedTitle,
      agentOrClient: expenseBeneficiary,
      paymentMode: expensePaymentMode,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      emecefInvoiceRef: expenseReceiptRef,
    };

    onAddTransaction(newExpenseTx);
    confetti({ particleCount: 30, spread: 45, colors: ['#FA3055', '#64748B'] });

    setExpenseTitle('');
    setExpenseAmount(0);
    setExpenseReceiptRef(`DEP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setActiveTab('cashbook');
  };

  const totalEntrees = transactions.filter(t => t.type === 'ENTREE').reduce((acc, t) => acc + t.amount, 0);
  const totalSorties = transactions.filter(t => t.type === 'SORTIE').reduce((acc, t) => acc + t.amount, 0);
  const totalSalaires = transactions.filter(t => t.category === 'SALAIRE_REMUNERATION').reduce((acc, t) => acc + t.amount, 0);
  const soldeCaisse = totalEntrees - totalSorties;

  // Calculs dynamiques stricts des sous-catégories pour le Bilan Comptable
  const commissionsVentes = transactions
    .filter(t => t.type === 'ENTREE' && (t.category === 'COMMISSION_VENTE' || (t.description && t.description.toLowerCase().includes('vente'))))
    .reduce((acc, t) => acc + t.amount, 0);

  const commissionsLocations = transactions
    .filter(t => t.type === 'ENTREE' && (t.category === 'COMMISSION_LOCATION' || t.category === 'COMMISSION_LOCATION_MEUBLEE' || (t.description && (t.description.toLowerCase().includes('locat') || t.description.toLowerCase().includes('loyer')))))
    .reduce((acc, t) => acc + t.amount, 0);

  const autresProduits = Math.max(0, totalEntrees - commissionsVentes - commissionsLocations);
  const totalProduits = commissionsVentes + commissionsLocations + autresProduits;

  const chargesSalaires = transactions
    .filter(t => t.type === 'SORTIE' && (t.category === 'SALAIRE_REMUNERATION' || (t.description && (t.description.toLowerCase().includes('salaire') || t.description.toLowerCase().includes('rémunération') || t.description.toLowerCase().includes('prime')))))
    .reduce((acc, t) => acc + t.amount, 0);

  const chargesDeplacement = transactions
    .filter(t => t.type === 'SORTIE' && t.category !== 'SALAIRE_REMUNERATION' && (t.description && (t.description.toLowerCase().includes('carburant') || t.description.toLowerCase().includes('tournée') || t.description.toLowerCase().includes('transport') || t.description.toLowerCase().includes('déplacement'))))
    .reduce((acc, t) => acc + t.amount, 0);

  const chargesTelecom = transactions
    .filter(t => t.type === 'SORTIE' && t.category !== 'SALAIRE_REMUNERATION' && (t.description && (t.description.toLowerCase().includes('télécom') || t.description.toLowerCase().includes('internet') || t.description.toLowerCase().includes('forfait') || t.description.toLowerCase().includes('connexion'))))
    .reduce((acc, t) => acc + t.amount, 0);

  const chargesFournitures = transactions
    .filter(t => t.type === 'SORTIE' && t.category !== 'SALAIRE_REMUNERATION' && (t.description && (t.description.toLowerCase().includes('fourniture') || t.description.toLowerCase().includes('bureau') || t.description.toLowerCase().includes('papier') || t.description.toLowerCase().includes('impression'))))
    .reduce((acc, t) => acc + t.amount, 0);

  const chargesAutres = Math.max(0, totalSorties - chargesSalaires - chargesDeplacement - chargesTelecom - chargesFournitures);
  const totalCharges = chargesSalaires + chargesDeplacement + chargesTelecom + chargesFournitures + chargesAutres;

  const resultatNet = totalProduits - totalCharges;
  const tresorerieDisponible = resultatNet;

  const filteredTransactions = transactions.filter(t => {
    if (cashFilter === 'ALL') return true;
    return t.type === cashFilter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 w-full">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FA3055] text-white">
                Direction financière & comptable
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                Norme DGI e-MECeF Bénin
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Facturation, dépenses & bilans comptables
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Émission certifiée DGI, gestion des salaires et impression des bilans journaliers, hebdomadaires, mensuels et annuels.
            </p>
          </div>

          {/* Navigation Pill */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F4F6F5] p-1 rounded-full text-xs font-semibold self-start lg:self-center">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'invoices' ? 'bg-[#FA3055] text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Facture normalisée
            </button>
            <button
              onClick={() => setActiveTab('new_expense')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'new_expense' ? 'bg-[#FA3055] text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Enregistrer une dépense</span>
            </button>
            <button
              onClick={() => setActiveTab('cashbook')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'cashbook' ? 'bg-[#FA3055] text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Journal de caisse ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'reports' ? 'bg-[#FA3055] text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bilans comptables</span>
            </button>
          </div>
        </div>

        {/* Caisse Balance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-semibold">Total entrées (recettes)</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-950 mt-1">
              {totalEntrees.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-xs font-semibold">Total dépenses de la société</span>
              <ArrowUpRight className="w-4 h-4 text-[#FA3055]" />
            </div>
            <p className="text-xl font-bold text-[#FA3055] mt-1">
              {totalSorties.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
            <div className="flex items-center justify-between text-purple-800">
              <span className="text-xs font-semibold">Salaires & rémunérations</span>
              <Wallet className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-purple-950 mt-1">
              {totalSalaires.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-xs font-semibold">Solde net trésorerie</span>
              <ShieldCheck className="w-4 h-4 text-[#FA3055]" />
            </div>
            <p className="text-xl font-bold text-white mt-1">
              {soldeCaisse.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 1: E-MECEF / E-SFE DGI BÉNIN MULTI-ARTICLES INVOICING INTERFACE     */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">

          {/* Style d'impression et de rendu papier dédié (toujours blanc avec police Courier New) */}
          <style>{`
            #emecef-official-sheet, 
            #emecef-official-sheet * {
              color: #0f172a !important;
            }
            #emecef-official-sheet {
              background-color: #ffffff !important;
            }
            #emecef-official-sheet .text-slate-600,
            #emecef-official-sheet .text-slate-500 {
              color: #475569 !important;
            }
            #emecef-official-sheet .bg-slate-100 {
              background-color: #f1f5f9 !important;
            }
            #emecef-official-sheet .bg-slate-50 {
              background-color: #f8fafc !important;
            }
            #emecef-official-sheet table,
            #emecef-official-sheet td,
            #emecef-official-sheet th,
            #emecef-official-sheet tr {
              border-color: #cbd5e1 !important;
            }
            #emecef-official-sheet .border-slate-400 {
              border-color: #94a3b8 !important;
            }
            #emecef-official-sheet .border-slate-300 {
              border-color: #cbd5e1 !important;
            }
            #emecef-official-sheet .border-slate-200 {
              border-color: #e2e8f0 !important;
            }
            #emecef-official-sheet .border-slate-900 {
              border-color: #0f172a !important;
            }
            #emecef-official-sheet .text-\\[\\#FA3055\\] {
              color: #fa3055 !important;
            }

            @media print {
              body * {
                visibility: hidden !important;
              }
              #emecef-official-sheet, #emecef-official-sheet * {
                visibility: visible !important;
              }
              #emecef-official-sheet {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 10mm !important;
                background: white !important;
                border: none !important;
                box-shadow: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* Top Control Bar matching e-SFE */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sélecteur de format */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Format :</span>
                <select
                  value={printFormat}
                  onChange={(e) => setPrintFormat(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                >
                  <option value="A4_COULEUR">A4 EN COULEUR</option>
                  <option value="A4_NB">A4 EN NOIR ET BLANC</option>
                  <option value="TICKET_80MM">TICKET CAISSE 80MM</option>
                </select>
              </div>

              {/* Bouton Imprimer vert conforme e-SFE */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer / PDF</span>
              </button>

              {/* Bouton Options d'impression sélective */}
              <button
                type="button"
                onClick={() => setIsPrintOptionsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Choisir les éléments et articles à imprimer"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Sélection d'impression</span>
              </button>

              {/* Catalogue prédéfini */}
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-purple-600" />
                <span>Catalogue DGI ({PREDEFINED_DGI_SERVICES.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Bouton Sceller DGI */}
              <button
                type="button"
                onClick={handleSealInvoice}
                disabled={invoiceItems.length === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  invoiceItems.length > 0
                    ? 'bg-[#FA3055] hover:bg-[#E02045] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSealed ? 'Facture Scellée DGI' : 'Sceller & Valider DGI'}</span>
              </button>

              {/* Bouton Réinitialiser / Nouvelle facture */}
              <button
                type="button"
                onClick={handleResetInvoice}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="Nouvelle facture / Vider"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Vider</span>
              </button>
            </div>
          </div>

          {/* Grille principale : Feuille de facture officielle à gauche + Barre d'actions à droite */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* DOCUMENT OFFICIEL (Feuille conforme e-SFE DGI Bénin sur bureau de travail) */}
            <div className="lg:col-span-9 bg-slate-200/80 dark:bg-[#0c0f15] rounded-3xl p-3 sm:p-6 border border-slate-300 dark:border-slate-800 shadow-inner overflow-x-auto">
              
              <div
                id="emecef-official-sheet"
                className={`dgi-paper-sheet bg-white text-slate-900 mx-auto transition-all rounded shadow-lg border border-slate-300 ${
                  printFormat === 'TICKET_80MM' 
                    ? 'max-w-[420px] p-4 text-[11px]' 
                    : 'max-w-[850px] p-6 sm:p-10 text-xs'
                } ${printFormat === 'A4_NB' ? 'filter grayscale contrast-125' : ''}`}
                style={{ 
                  fontFamily: "'Courier New', Courier, monospace",
                  backgroundColor: '#ffffff',
                  color: '#0f172a'
                }}
              >
                {/* 1. EN-TÊTE PRINCIPAL */}
                {printOptions.showHeader && (
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-300">
                    <div>
                      <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-950 uppercase">
                        Chezmoi immobilier
                      </h1>
                      <p className="font-semibold text-slate-800 text-[11px] sm:text-xs mt-0.5">
                        IFU : 0202361063128
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-600">
                        N° RCCM : RB/ABC/24 A 111099
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 uppercase">
                        FACTURE DE VENTE
                      </h2>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        Facture # : {invoiceNumber}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Date : {invoiceDate}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Vendeur : {sellerName}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. ENCADRÉ COORDONNÉES SOCIÉTÉ & e-MCF (conforme capture e-SFE) */}
                {printOptions.showCompanyBox && (
                  <div className="my-4 max-w-sm">
                    <table className="w-full text-[10px] sm:text-[11px] border border-slate-400">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 font-bold text-slate-700 bg-slate-50 w-24">Adresse</td>
                          <td className="p-1.5 text-slate-900">Bidossessi Adjrako, Abomey-Calavi</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 font-bold text-slate-700 bg-slate-50">Contact</td>
                          <td className="p-1.5 text-slate-900">+229 97 00 00 00 / contact@chezmoi.bj</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-bold text-slate-700 bg-slate-50">e-MCF</td>
                          <td className="p-1.5 font-bold text-slate-900">EM01508441</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. COORDONNÉES DU CLIENT */}
                {printOptions.showClient && (clientName || clientIfu || clientPhone) && (
                  <div className="my-4 p-3 bg-slate-50/80 rounded border border-slate-300 max-w-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[10px] text-slate-500 uppercase">Client facturé :</span>
                      {clientIfu && (
                        <span className="text-[10px] font-mono text-slate-700">IFU : <strong>{clientIfu}</strong></span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900">{clientName || 'Client au comptant'}</p>
                    {clientPhone && <p className="text-[11px] text-slate-600">Tél : {clientPhone}</p>}
                    {clientAddress && <p className="text-[11px] text-slate-600">Adresse : {clientAddress}</p>}
                  </div>
                )}

                {/* 4. DESCRIPTION SUPPLÉMENTAIRE */}
                {printOptions.showAdditionalDesc && additionalDescription && (
                  <div className="my-3 p-2.5 bg-amber-50/60 border border-amber-200 rounded text-[11px] text-amber-950">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block mb-0.5">
                      Description / Mentions complémentaires :
                    </span>
                    <p className="whitespace-pre-line">{additionalDescription}</p>
                  </div>
                )}

                {/* 5. TABLEAU MULTI-ARTICLES / MULTI-LIGNES (conforme e-SFE) */}
                {printOptions.showArticlesTable && (
                  <div className="my-5 overflow-x-auto">
                    <table className="w-full text-[11px] sm:text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-y border-slate-400 text-slate-800">
                          <th className="py-2 px-2 text-center w-8">#</th>
                          <th className="py-2 px-2 text-left">Designation</th>
                          <th className="py-2 px-2 text-right">Prix unitaire (T.T.C.)</th>
                          <th className="py-2 px-2 text-center w-16">Quantité</th>
                          <th className="py-2 px-2 text-right">Montant (T.T.C.)</th>
                          <th className="py-2 px-2 text-center w-16 no-print">Impr.</th>
                          <th className="py-2 px-2 text-center w-20 no-print">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceItems.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 italic bg-slate-50/50">
                              Aucun article sur la facture. Cliquez sur "Ajouter un nouvel article" ou utilisez le catalogue.
                            </td>
                          </tr>
                        ) : (
                          invoiceItems.map((item, index) => {
                            const rawTotal = (item.quantity || 0) * (item.unitPriceTTC || 0);
                            const lineTotal = rawTotal + (item.specificTax || 0);
                            const isIncludedInPrint = item.selectedForPrint !== false;

                            return (
                              <tr 
                                key={item.id} 
                                className={`border-b border-slate-200 hover:bg-slate-50/80 transition-colors ${
                                  !isIncludedInPrint ? 'opacity-40 bg-slate-100/50 print:hidden' : ''
                                }`}
                              >
                                <td className="py-2.5 px-2 text-center font-bold text-slate-500">{index + 1}</td>
                                <td className="py-2.5 px-2 font-medium text-slate-900">
                                  <div>{item.designation}</div>
                                  {item.specificTax ? (
                                    <span className="text-[10px] text-amber-700 italic">
                                      + T.S. : {Number(item.specificTax).toLocaleString('fr-FR')} FCFA
                                    </span>
                                  ) : null}
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                                  {Number(item.unitPriceTTC).toLocaleString('fr-FR')}
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900">
                                  {item.quantity}
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-950">
                                  {lineTotal.toLocaleString('fr-FR')} <span className="font-bold text-[#FA3055]">[{item.taxGroup}]</span>
                                </td>
                                <td className="py-2.5 px-2 text-center no-print">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleArticlePrint(index)}
                                    title={isIncludedInPrint ? "Exclure de l'impression" : "Inclure dans l'impression"}
                                    className="text-slate-600 hover:text-slate-900 cursor-pointer"
                                  >
                                    {isIncludedInPrint ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-600 inline" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-400 inline" />
                                    )}
                                  </button>
                                </td>
                                <td className="py-2.5 px-2 text-center no-print">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditArticle(index)}
                                      className="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                                      title="Modifier"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteArticle(index)}
                                      className="p-1 rounded hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 6. TOTAL GÉNÉRAL TTC (aligné à droite et souligné) */}
                <div className="my-4 flex justify-end">
                  <div className="text-right border-b-2 border-slate-900 pb-1 px-2">
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      Total: {invoiceTotals.totalTTC.toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* 7. TABLEAU DE VENTILATION DES IMPÔTS (conforme e-SFE) */}
                {printOptions.showTaxVentilation && (
                  <div className="my-6">
                    <p className="text-[11px] font-bold text-slate-700 tracking-wider mb-1">
                      --- VENTILATION DES IMPÔTS ---
                    </p>
                    <table className="w-full text-[10px] sm:text-[11px] border border-slate-400">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-400 text-slate-800">
                          <th className="py-1.5 px-2 text-left">Groupe</th>
                          <th className="py-1.5 px-2 text-right">Total</th>
                          <th className="py-1.5 px-2 text-right">Imposable</th>
                          <th className="py-1.5 px-2 text-right">Impôt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxBreakdown.map((row) => (
                          <tr key={row.groupCode} className="border-b border-slate-200">
                            <td className="py-1.5 px-2 font-bold text-slate-800">{row.group}</td>
                            <td className="py-1.5 px-2 text-right font-mono">{row.totalTTC.toLocaleString('fr-FR')}</td>
                            <td className="py-1.5 px-2 text-right font-mono">{row.imposableHT.toLocaleString('fr-FR')}</td>
                            <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">{row.taxAmount.toLocaleString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 8. TABLEAU DE RÉPARTITION DES PAIEMENTS (conforme e-SFE) */}
                {printOptions.showPaymentBreakdown && (
                  <div className="my-6">
                    <p className="text-[11px] font-bold text-slate-700 tracking-wider mb-1">
                      --- RÉPARTITION DES PAIEMENTS ---
                    </p>
                    <table className="w-full text-[10px] sm:text-[11px] border border-slate-400">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-400 text-slate-800">
                          <th className="py-1.5 px-2 text-left">Type de paiement</th>
                          <th className="py-1.5 px-2 text-right">Payé</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1.5 px-2 font-bold text-slate-800">
                            {paymentMode.replace('_', ' ')}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                            {(amountPaid || invoiceTotals.totalTTC).toLocaleString('fr-FR')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 9. MONTANT EN TOUTES LETTRES */}
                {printOptions.showAmountInWords && invoiceTotals.totalTTC > 0 && (
                  <div className="my-4 text-[11px] text-slate-800 italic">
                    Arrêté la présente facture à la somme de : <strong>{totalInWords} Francs CFA</strong>
                  </div>
                )}

                {/* 10. BLOC DE SÉCURITÉ SDC / MECeF & QR CODE OFFICIEL */}
                {printOptions.showSecurityBlock && (
                  <div className="mt-8 pt-4 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    {qrCodeDataUrl ? (
                      <div className="p-1 bg-white border border-slate-300 rounded shadow-2xs flex-shrink-0">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code DGI Bénin" 
                          className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-slate-900 p-2 flex items-center justify-center flex-shrink-0 text-white">
                        <QrCode className="w-16 h-16" />
                      </div>
                    )}

                    <div className="text-[10px] sm:text-[11px] text-slate-700 space-y-0.5 flex-1">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                        <span className="font-bold text-slate-950 uppercase tracking-wider">
                          SCEAU SDC / DGI BÉNIN
                        </span>
                        <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                          {isSealed ? 'NORMALISÉE' : 'PRÉ-VALIDÉE'}
                        </span>
                      </div>
                      <p className="font-mono">
                        Code MECeF/DGI : <strong className="text-slate-950">{sealedInvoice?.securityCode || '0202-3610-6312-8001'}</strong>
                      </p>
                      <p className="font-mono">
                        MECeF NIM: <strong>EM01508441</strong>
                      </p>
                      <p className="font-mono">
                        MECeF Compteurs: <strong>{sealedInvoice?.counters || '7/10 FV'}</strong>
                      </p>
                      <p className="font-mono">
                        MECeF Heure: <strong>{invoiceDate}</strong>
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* BARRE D'ACTIONS LATÉRALE (Boutons e-SFE conformes à la capture Capture_d__cran_2026-10-24_163523_c63d4217.png) */}
            <div className="lg:col-span-3 space-y-3 no-print">
              
              {/* Bouton 1: Gérer le client (Bleu plein) */}
              <button
                type="button"
                onClick={() => setIsClientModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1d63bf] hover:bg-[#1853a1] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Gérer le client</span>
              </button>

              {/* Bouton 2: Description supplémentaire (Bordure Cyan/Teal) */}
              <button
                type="button"
                onClick={() => setIsDescModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-cyan-50/50 text-[#0e7490] border-2 border-[#06b6d4] text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#06b6d4]" />
                <span>Description supplémentaire</span>
              </button>

              {/* Bouton 3: Ajouter un nouvel article (Bleu plein) */}
              <button
                type="button"
                onClick={handleOpenAddArticle}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1d63bf] hover:bg-[#1853a1] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un nouvel article</span>
              </button>

              {/* Bouton 4: Gérer le paiement (Bleu plein) */}
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1d63bf] hover:bg-[#1853a1] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PaymentIcon className="w-4 h-4" />
                <span>Gérer le paiement</span>
              </button>

              {/* Carte Récapitulative Totaux */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 mt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Résumé de la facture
                </span>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Articles :</span>
                  <span className="font-bold text-slate-900">{invoiceItems.length}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Base Imposable :</span>
                  <span className="font-mono">{invoiceTotals.totalHT.toLocaleString('fr-FR')} F</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>TVA totale (18%) :</span>
                  <span className="font-mono">{invoiceTotals.totalTVA.toLocaleString('fr-FR')} F</span>
                </div>
                {invoiceTotals.totalSpecificTax > 0 && (
                  <div className="flex justify-between text-xs text-amber-800">
                    <span>Taxe spécifique :</span>
                    <span className="font-mono">{invoiceTotals.totalSpecificTax.toLocaleString('fr-FR')} F</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-[#FA3055]">
                  <span>Total net TTC :</span>
                  <span className="font-mono">{invoiceTotals.totalTTC.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* MODALE 1: AJOUTER / MODIFIER L'ARTICLE (Conforme Capture 102 / 104)       */}
          {/* ========================================================================= */}
          {isArticleModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-slate-200 space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {editingItemIndex !== null ? "Modifier l'article" : "Ajouter un article à la facture"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsArticleModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveArticle} className="space-y-4">
                  {/* Champ 1: Designation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      required
                      value={itemDesignation}
                      onChange={(e) => setItemDesignation(e.target.value)}
                      placeholder="Ex: Prestation topographique, Honoraires de vente..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1d63bf]"
                    />
                  </div>

                  {/* Champ 2: Groupe de taxation obligatoire */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <span>Groupe de taxation</span>
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium">Norme e-MECeF DGI</span>
                    </div>
                    <select
                      value={itemGroup}
                      onChange={(e) => setItemGroup(e.target.value as DgiTaxGroup)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1d63bf] bg-white"
                    >
                      <option value="A">Groupe A : Exonéré (0%)</option>
                      <option value="B">Groupe B : Taxable (TVA 18%)</option>
                      <option value="C">Groupe C : Exportation (0%)</option>
                      <option value="D">Groupe D : TVA Régime d'exception (18%)</option>
                      <option value="E">Groupe E : Régime de la TPS (Taxe Professionnelle Synthétique)</option>
                      <option value="F">Groupe F : Réservé</option>
                    </select>
                  </div>

                  {/* Champ 3: Prix unitaire (T.T.C.) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Prix unitaire (T.T.C.)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={itemUnitPrice === 0 ? '' : itemUnitPrice}
                      onChange={(e) => setItemUnitPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1d63bf]"
                    />
                  </div>

                  {/* Champ 4: Quantité (Gestion des décimales max 3 décimales) */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Quantité
                      </label>
                      <span className="text-[11px] text-slate-500">
                        La quantité peut être décimale (maximum 3 décimales)
                      </span>
                    </div>
                    <input
                      type="number"
                      step="any"
                      required
                      min={0.001}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1d63bf]"
                    />
                  </div>

                  {/* Champ 5: Taxe spécifique (T.S.) */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Taxe spécifique (T.S.)
                      </label>
                      <span className="text-[11px] text-slate-500">
                        T.S. montant pour la quantité totale
                      </span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={itemSpecificTax === 0 ? '' : itemSpecificTax}
                      onChange={(e) => setItemSpecificTax(e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1d63bf]"
                    />
                  </div>

                  {/* Bloc Sommaire (Total, Imposable, Impôt) conforme Capture 102 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-bold">Total :</span>
                      <span className="font-mono font-bold text-slate-950">{modalTotalTTC.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Imposable :</span>
                      <span className="font-mono">{modalBaseImposable.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Impôt :</span>
                      <span className="font-mono">{modalTax.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  {/* Boutons Annuler et OK */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsArticleModalOpen(false)}
                      className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-[#1d63bf] hover:bg-[#1853a1] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODALE 2: CATALOGUE DES PRESTATIONS DGI (Conforme Capture 100)           */}
          {/* ========================================================================= */}
          {isCatalogModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Gestion des articles
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total articles : <strong className="text-emerald-700">{PREDEFINED_DGI_SERVICES.length}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCatalogModalOpen(false);
                      handleOpenAddArticle();
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-emerald-600 hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ajouter un article non programmé à la facture</span>
                  </button>
                </div>

                {/* Recherche dans le catalogue */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Chercher une prestation foncière..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1d63bf]"
                    />
                  </div>
                  {catalogSearch && (
                    <button
                      type="button"
                      onClick={() => setCatalogSearch('')}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                    >
                      Effacer
                    </button>
                  )}
                </div>

                {/* Tableau catalogue */}
                <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 w-8">#</th>
                        <th className="py-2 px-3">Designation</th>
                        <th className="py-2 px-3 text-right">Prix unitaire (T.T.C.)</th>
                        <th className="py-2 px-3 text-center">Groupe</th>
                        <th className="py-2 px-3 text-center w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {PREDEFINED_DGI_SERVICES
                        .filter(s => s.designation.toLowerCase().includes(catalogSearch.toLowerCase()))
                        .map((svc, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{svc.designation}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {svc.defaultPrice.toLocaleString('fr-FR')} F
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                Gr. {svc.defaultGroup}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const newItem: EMecefInvoiceItem = {
                                    id: `item_${Date.now()}_${idx}`,
                                    designation: svc.designation,
                                    quantity: 1,
                                    unitPriceTTC: svc.defaultPrice,
                                    specificTax: 0,
                                    taxGroup: svc.defaultGroup,
                                    selectedForPrint: true,
                                  };
                                  setInvoiceItems([...invoiceItems, newItem]);
                                  setIsCatalogModalOpen(false);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#1d63bf] hover:bg-[#1853a1] text-white text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Choisir
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCatalogModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODALE 3: GÉRER LE CLIENT                                                 */}
          {/* ========================================================================= */}
          {isClientModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#1d63bf]" />
                    <span>Gérer le client</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du client ou entreprise</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: ETCHI Odile, Société XYZ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d63bf]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">IFU client (13 chiffres - optionnel)</label>
                    <input
                      type="text"
                      value={clientIfu}
                      onChange={(e) => setClientIfu(e.target.value)}
                      placeholder="Ex: 0202111883391"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d63bf]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone de contact</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+229 97 00 00 00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d63bf]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse géographique</label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Ex: Cotonou, Haie Vive..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d63bf]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-[#1d63bf] text-white text-xs font-bold hover:bg-[#1853a1] cursor-pointer"
                  >
                    Valider les coordonnées
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODALE 4: DESCRIPTION SUPPLÉMENTAIRE                                      */}
          {/* ========================================================================= */}
          {isDescModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#06b6d4]" />
                    <span>Description supplémentaire</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsDescModalOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mentions, références ou conditions particulières
                  </label>
                  <textarea
                    rows={4}
                    value={additionalDescription}
                    onChange={(e) => setAdditionalDescription(e.target.value)}
                    placeholder="Ex: Facture établie pour la vente de la parcelle N° 45 du lotissement Bidossessi. Modalités de paiement : 50% à la signature."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDescModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-[#0e7490] hover:bg-[#155e75] text-white text-xs font-bold cursor-pointer"
                  >
                    Enregistrer la mention
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODALE 5: GÉRER LE PAIEMENT                                               */}
          {/* ========================================================================= */}
          {isPaymentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <PaymentIcon className="w-4 h-4 text-[#1d63bf]" />
                    <span>Gérer le paiement</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mode de paiement</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    >
                      <option value="ESPECES">ESPECES</option>
                      <option value="MOBILE_MONEY">MOBILE MONEY (MTN MoMo / Moov)</option>
                      <option value="VIREMENT">VIREMENT BANCAIRE</option>
                      <option value="CHEQUE">CHEQUE</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Montant payé (FCFA)</label>
                      <button
                        type="button"
                        onClick={() => setAmountPaid(invoiceTotals.totalTTC)}
                        className="text-[10px] text-[#1d63bf] font-bold hover:underline cursor-pointer"
                      >
                        Payer la totalité ({invoiceTotals.totalTTC.toLocaleString('fr-FR')} F)
                      </button>
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-[#1d63bf] text-white text-xs font-bold hover:bg-[#1853a1] cursor-pointer"
                  >
                    Valider le règlement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODALE 6: OPTIONS D'IMPRESSION SÉLECTIVE (Exigence spécifique)            */}
          {/* ========================================================================= */}
          {isPrintOptionsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#FA3055]" />
                      <span>Module d'impression sélectif</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cochez les éléments et blocs à inclure lors de l'impression ou de l'exportation PDF.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrintOptionsModalOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800">
                  {[
                    { key: 'showHeader', label: 'En-tête "Chezmoi immobilier"' },
                    { key: 'showCompanyBox', label: 'Boîte adresse, contact & e-MCF' },
                    { key: 'showClient', label: 'Coordonnées du client' },
                    { key: 'showInvoiceMeta', label: 'Numéro, date et vendeur' },
                    { key: 'showAdditionalDesc', label: 'Description supplémentaire' },
                    { key: 'showArticlesTable', label: 'Tableau des prestations' },
                    { key: 'showTaxVentilation', label: 'Ventilation des impôts DGI' },
                    { key: 'showPaymentBreakdown', label: 'Répartition des paiements' },
                    { key: 'showAmountInWords', label: 'Montant en toutes lettres' },
                    { key: 'showSecurityBlock', label: 'Sceau SDC & QR Code DGI' },
                  ].map((opt) => (
                    <label 
                      key={opt.key} 
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(printOptions as any)[opt.key]}
                        onChange={(e) => setPrintOptions({
                          ...printOptions,
                          [opt.key]: e.target.checked
                        })}
                        className="rounded text-[#FA3055] focus:ring-[#FA3055] w-4 h-4"
                      />
                      <span className="font-semibold text-slate-800">{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPrintOptions({
                      showHeader: true,
                      showCompanyBox: true,
                      showClient: true,
                      showInvoiceMeta: true,
                      showAdditionalDesc: true,
                      showArticlesTable: true,
                      showTaxVentilation: true,
                      showPaymentBreakdown: true,
                      showAmountInWords: true,
                      showSecurityBlock: true,
                    })}
                    className="text-xs text-[#FA3055] font-semibold hover:underline cursor-pointer"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrintOptionsModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Appliquer & Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REGISTER EXPENSE (Including Salaires & Rémunérations) */}
      {/* ========================================================================= */}
      {activeTab === 'new_expense' && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-2xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FA3055]/10 text-[#FA3055] uppercase tracking-wider">
                Comptabilité analytique & caisse
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                Enregistrer une dépense ou rémunération
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Salaires fixes, commissions agents, carburant terrain, loyer du siège et fournitures.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#FA3055] flex-shrink-0">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          <form onSubmit={handleRegisterExpense} className="space-y-5">
            
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Catégorie de la dépense
              </label>
              <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'SALAIRE_REMUNERATION', label: 'Salaires & rémunérations', icon: Wallet, highlight: true },
                  { id: 'DEPLACEMENT', label: 'Carburant & tournée', icon: Fuel },
                  { id: 'LOYER', label: 'Loyer & charges siège', icon: Building },
                  { id: 'TELECOM', label: 'Télécom & internet 4G', icon: Wifi },
                  { id: 'FOURNITURES', label: 'Fournitures de bureau', icon: FileText },
                  { id: 'MARKETING', label: 'Marketing & Chezmoi.bj', icon: Megaphone },
                  { id: 'MAINTENANCE', label: 'Maintenance & entretien', icon: Wrench },
                  { id: 'AUTRE', label: 'Autres charges courantes', icon: HelpCircle },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = expenseCategory === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setExpenseCategory(cat.id as any)}
                      className={`p-3 rounded-2xl border text-left flex items-center sm:flex-col sm:items-start justify-between sm:justify-between transition-all cursor-pointer w-full ${
                        isSelected
                          ? 'border-[#FA3055] bg-[#FA3055]/10 ring-1 ring-[#FA3055] text-slate-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:block">
                        <Icon className={`w-4 h-4 sm:mb-2 ${isSelected ? 'text-[#FA3055]' : 'text-slate-400'}`} />
                        <span className="text-xs sm:text-[11px] leading-tight">{cat.label}</span>
                      </div>
                      {cat.highlight && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FA3055] text-white font-bold ml-2 sm:ml-0 sm:mt-1">
                          Prioritaire
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special salary fields if SALAIRE_REMUNERATION is selected */}
            {expenseCategory === 'SALAIRE_REMUNERATION' ? (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-4">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <Wallet className="w-4 h-4 text-purple-700" />
                  <span>Détails de la paie & rémunération du collaborateur</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Collaborateur ou agent bénéficiaire
                    </label>
                    <select
                      value={expenseBeneficiary}
                      onChange={(e) => setExpenseBeneficiary(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      {employees.length > 0 ? (
                        employees.map(e => (
                          <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                        ))
                      ) : (
                        <>
                          <option value="Emily Davis">Emily Davis (Agent recenseur)</option>
                          <option value="James Smith">James Smith (Agent recenseur)</option>
                          <option value="Michael Johnson">Michael Johnson (Agent recenseur)</option>
                          <option value="Mme. Solange Zinsou">Mme. Solange Zinsou (Secrétaire)</option>
                          <option value="M. Christian Dossou">M. Christian Dossou (Comptable)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nature du versement
                    </label>
                    <select
                      value={salaryType}
                      onChange={(e) => setSalaryType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      <option value="SALAIRE_FIXE">Salaire mensuel fixe contractuel</option>
                      <option value="COMMISSION_TERRAIN">Commission sur recensements validés</option>
                      <option value="PRIME">Prime de performance ou panier</option>
                      <option value="AVANCE">Avance sur salaire quinzaine</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mois de référence de la paie
                    </label>
                    <input
                      type="text"
                      value={salaryMonth}
                      onChange={(e) => setSalaryMonth(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Montant net décaissé (FCFA)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={expenseAmount === 0 ? '' : expenseAmount}
                      onChange={(e) => {
                        const v = e.target.value;
                        setExpenseAmount(v === '' ? 0 : Number(v));
                      }}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#FA3055]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Standard general expense fields */
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motif ou libellé de la dépense
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex : Carburant pour tournée de recensement foncier Calavi"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  />
                </div>

                <div className="w-full sm:w-48">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Montant décaissé (FCFA)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={expenseAmount === 0 ? '' : expenseAmount}
                    onChange={(e) => {
                      const v = e.target.value;
                      setExpenseAmount(v === '' ? 0 : Number(v));
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold text-[#FA3055]"
                  />
                </div>
              </div>
            )}

            {/* Beneficiary & Payment mode */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bénéficiaire / Fournisseur
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex : Station JNP, MTN Bénin, SBEE, Librairie"
                  value={expenseBeneficiary}
                  onChange={(e) => setExpenseBeneficiary(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mode de règlement
                </label>
                <select
                  value={expensePaymentMode}
                  onChange={(e) => setExpensePaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold"
                >
                  <option value="VIREMENT">Virement bancaire (BOA / Ecobank)</option>
                  <option value="MOBILE_MONEY">Mobile Money (MTN MoMo / Moov)</option>
                  <option value="ESPECES">Espèces de caisse</option>
                  <option value="CHEQUE">Chèque bancaire</option>
                </select>
              </div>
            </div>

            {/* Receipt & notes */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Réf. pièce justificative / Reçu de caisse
                </label>
                <input
                  type="text"
                  value={expenseReceiptRef}
                  onChange={(e) => setExpenseReceiptRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-mono font-semibold"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes & justificatifs
                </label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('cashbook')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Enregistrer la dépense & imputer à la caisse</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CASHBOOK (Journal des mouvements de caisse & dépenses) */}
      {/* ========================================================================= */}
      {activeTab === 'cashbook' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Journal des mouvements de caisse & dépenses
              </h3>
              <p className="text-xs text-slate-500">
                Historique des encaissements de commissions et décaissements de la société.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-[#F4F6F5] p-1 rounded-full text-xs font-semibold">
              <button
                onClick={() => setCashFilter('ALL')}
                className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                  cashFilter === 'ALL' ? 'bg-[#FA3055] text-white font-bold' : 'text-slate-600'
                }`}
              >
                Toutes ({transactions.length})
              </button>
              <button
                onClick={() => setCashFilter('ENTREE')}
                className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                  cashFilter === 'ENTREE' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                Entrées
              </button>
              <button
                onClick={() => setCashFilter('SORTIE')}
                className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                  cashFilter === 'SORTIE' ? 'bg-[#FA3055] text-white font-bold' : 'text-slate-600'
                }`}
              >
                Dépenses & salaires
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Code / Réf.</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Bénéficiaire / Agent</th>
                  <th className="py-2.5 px-3">Règlement</th>
                  <th className="py-2.5 px-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">{tx.code}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type === 'ENTREE' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : tx.category === 'SALAIRE_REMUNERATION'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-[#FA3055]'
                      }`}>
                        {tx.type === 'ENTREE' ? 'Entrée (recette)' : tx.category === 'SALAIRE_REMUNERATION' ? 'Salaire / Paie' : 'Dépense société'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{tx.description}</td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{tx.agentOrClient}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {tx.paymentMode}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-bold whitespace-nowrap ${
                      tx.type === 'ENTREE' ? 'text-emerald-700' : 'text-[#FA3055]'
                    }`}>
                      {tx.type === 'ENTREE' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACCOUNTING REPORTS & FINANCIAL STATEMENTS (Bilans comptables) */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FA3055] text-white">
                États financiers & clôture
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Bilan comptable & situation financière
              </h2>
              <p className="text-xs text-slate-500">
                Édition officielle conforme au plan comptable OHADA et normes fiscales DGI Bénin.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-2 self-start sm:self-auto"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Imprimer le bilan officiel</span>
            </button>
          </div>

          {/* Period Selector: Journalier, Hebdomadaire, Mensuel, Annuel */}
          <div className="flex flex-wrap items-center gap-2 bg-[#F4F6F5] p-1.5 rounded-2xl text-xs font-semibold">
            {[
              { id: 'DAILY', label: 'Bilan journalier' },
              { id: 'WEEKLY', label: 'Bilan hebdomadaire' },
              { id: 'MONTHLY', label: 'Bilan mensuel' },
              { id: 'ANNUAL', label: 'Bilan annuel (Exercice)' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setReportPeriod(p.id as any)}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                  reportPeriod === p.id
                    ? 'bg-[#FA3055] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Period Configuration input */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <span className="font-semibold text-slate-700">Période d’arrêté sélectionnée :</span>
            {reportPeriod === 'DAILY' && (
              <input
                type="date"
                value={selectedReportDate}
                onChange={(e) => setSelectedReportDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold"
              />
            )}
            {reportPeriod === 'WEEKLY' && (
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800">
                Semaine 42 (12 au 18 Octobre 2026)
              </span>
            )}
            {reportPeriod === 'MONTHLY' && (
              <input
                type="month"
                value={selectedReportMonth}
                onChange={(e) => setSelectedReportMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold"
              />
            )}
            {reportPeriod === 'ANNUAL' && (
              <select
                value={selectedReportYear}
                onChange={(e) => setSelectedReportYear(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold"
              >
                <option value="2026">Exercice fiscal 2026</option>
                <option value="2025">Exercice fiscal 2025</option>
              </select>
            )}
          </div>

          {/* Financial Statement Sheet (Printable Layout) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-800 font-sans">
            
            {/* Header Document */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <ChezmoiLogo size={52} />
                <div>
                  <h3 className="font-black text-lg text-slate-900">Chezmoi immobilier</h3>
                  <p className="text-[11px] text-slate-500">IFU : 0202361063128 • RCCM : RB/ABC/24 A 111099</p>
                  <p className="text-[11px] text-slate-500">Siège social : Bidossessi Adjrako, Abomey-Calavi, République du Bénin</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-[#FA3055] tracking-wider">État financier certifié</span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  {reportPeriod === 'DAILY' ? `Bilan journalier du ${selectedReportDate}` :
                   reportPeriod === 'WEEKLY' ? 'Bilan hebdomadaire (Semaine 42)' :
                   reportPeriod === 'MONTHLY' ? `Bilan mensuel (${selectedReportMonth})` :
                   `Bilan annuel d’exercice (${selectedReportYear})`}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">Édité le {new Date().toLocaleDateString('fr-FR')} à 12:00</p>
              </div>
            </div>

            {/* Income & Expenses 2-part Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Part 1: Produits & Recettes d'exploitation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-600 pb-2">
                  <h5 className="font-bold text-xs uppercase text-emerald-800">1. Produits d'exploitation</h5>
                  <span className="font-bold text-xs text-emerald-800">Montant (FCFA)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Commissions sur ventes de biens :</span>
                    <span className="font-mono font-bold text-slate-900">{commissionsVentes.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Commissions & gestion locative :</span>
                    <span className="font-mono font-bold text-slate-900">{commissionsLocations.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Frais d'ouverture de dossier & autres :</span>
                    <span className="font-mono font-bold text-slate-900">{autresProduits.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-emerald-900">
                    <span>Total produits d'exploitation :</span>
                    <span className="font-mono">{totalProduits.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Part 2: Charges & Dépenses d'exploitation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-rose-600 pb-2">
                  <h5 className="font-bold text-xs uppercase text-rose-800">2. Charges d'exploitation</h5>
                  <span className="font-bold text-xs text-rose-800">Montant (FCFA)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Salaires & rémunérations collaborateurs :</span>
                    <span className="font-mono font-bold text-purple-900">{chargesSalaires.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Frais de carburant & prospection terrain :</span>
                    <span className="font-mono font-bold text-slate-900">{chargesDeplacement.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Télécom, internet 4G & forfaits :</span>
                    <span className="font-mono font-bold text-slate-900">{chargesTelecom.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Fournitures administratives & bureau :</span>
                    <span className="font-mono font-bold text-slate-900">{chargesFournitures.toLocaleString('fr-FR')}</span>
                  </div>
                  {chargesAutres > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Autres charges d'exploitation :</span>
                      <span className="font-mono font-bold text-slate-900">{chargesAutres.toLocaleString('fr-FR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-rose-900">
                    <span>Total charges d'exploitation :</span>
                    <span className="font-mono">{totalCharges.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Net Result & Cash Balance */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Résultat net d’exploitation (Total Produits - Total Charges)</span>
                <p className={`text-2xl font-black mt-0.5 font-mono ${resultatNet >= 0 ? 'text-emerald-700' : 'text-[#FA3055]'}`}>
                  {resultatNet >= 0 ? '+' : ''}{resultatNet.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[10px] text-slate-500">Excédent net calculé sur la somme exacte des transactions réelles</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Trésorerie disponible</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
                  {tresorerieDisponible.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[10px] text-slate-500">Comptes bancaires & caisse siège</p>
              </div>
            </div>

            {/* Official Neutral Signatures Box */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
              <div className="text-center p-4 border border-dashed border-slate-300 rounded-xl h-28 flex flex-col justify-between bg-slate-50/50">
                <span className="font-bold text-slate-800">Le Chef Comptable</span>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">Cadre réservé au visa & émargement</span>
                </div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest">Visa certifié</span>
              </div>

              <div className="text-center p-4 border border-dashed border-slate-300 rounded-xl h-28 flex flex-col justify-between bg-slate-50/50">
                <span className="font-bold text-slate-800">La Direction</span>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">Cadre réservé à la signature & au sceau</span>
                </div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest">Signature & Sceau officiel</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
