import React, { useState } from 'react';
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
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CashTransaction, UserAccount } from '../types';
import { processStandardizedInvoice, StandardizedInvoiceResult } from '../utils/emecef';
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
  
  // Invoice form state
  const [clientName, setClientName] = useState('Dr. Florentin Agossou');
  const [clientPhone, setClientPhone] = useState('+229 97 50 12 88');
  const [clientIfu, setClientIfu] = useState('1201884729104');
  const [designation, setDesignation] = useState('Commission d’agence 5% - Vente penthouse Arasaka Tower');
  const [amountTTC, setAmountTTC] = useState<number>(19250000);
  const [taxGroup, setTaxGroup] = useState<'A' | 'B' | 'E'>('B');
  const [paymentMode, setPaymentMode] = useState<'ESPECES' | 'MOBILE_MONEY' | 'VIREMENT' | 'CHEQUE'>('VIREMENT');
  
  // Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(220000);
  const [expenseCategory, setExpenseCategory] = useState<
    'SALAIRE_REMUNERATION' | 'DEPLACEMENT' | 'FOURNITURES' | 'LOYER' | 'TELECOM' | 'MARKETING' | 'MAINTENANCE' | 'AUTRE'
  >('SALAIRE_REMUNERATION');
  const [expenseBeneficiary, setExpenseBeneficiary] = useState('Emily Davis');
  const [salaryType, setSalaryType] = useState<'SALAIRE_FIXE' | 'COMMISSION_TERRAIN' | 'AVANCE' | 'PRIME'>('SALAIRE_FIXE');
  const [salaryMonth, setSalaryMonth] = useState('Octobre 2026');
  const [expensePaymentMode, setExpensePaymentMode] = useState<'ESPECES' | 'MOBILE_MONEY' | 'VIREMENT' | 'CHEQUE'>('VIREMENT');
  const [expenseReceiptRef, setExpenseReceiptRef] = useState(`BS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [expenseNotes, setExpenseNotes] = useState('Rémunération mensuelle et primes de recensement');

  // Filter state for cashbook
  const [cashFilter, setCashFilter] = useState<'ALL' | 'ENTREE' | 'SORTIE'>('ALL');
  
  // Accounting Reports State
  const [reportPeriod, setReportPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedReportDate, setSelectedReportDate] = useState('2026-10-15');
  const [selectedReportMonth, setSelectedReportMonth] = useState('2026-10');
  const [selectedReportYear, setSelectedReportYear] = useState('2026');

  // Last generated e-MECeF invoice
  const [generatedInvoice, setGeneratedInvoice] = useState<StandardizedInvoiceResult | null>(() => processStandardizedInvoice({
    invoiceNumber: 'FAC-2026-0048',
    invoiceType: 'FACTURE_NORMALISEE',
    clientName: 'M. Rodrigue Soglo (Acquéreur)',
    clientIFU: '0201912345678',
    clientPhone: '+229 97 11 22 33',
    providerName: 'CHEZMOI IMMOBILIER SARL',
    ifuSeller: '3202112345678',
    nim: 'MC01234567-01',
    sdcId: 'SDC-BJ-009',
    timestamp: Date.now(),
    paymentMode: 'VIREMENT',
    items: [
      {
        id: 'item_init_1',
        designation: 'Honoraires de transaction & négociation vente TF 1420 Cotonou (Haie Vive)',
        quantity: 1,
        unitPriceTTC: 19250000,
        taxGroup: 'B'
      }
    ],
    amountPaid: 19250000
  }));

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceNum = `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = processStandardizedInvoice({
      invoiceNumber: invoiceNum,
      clientName,
      clientPhone,
      nim: 'MC01234567-01',
      ifuSeller: '3202112345678',
      sdcId: 'SDC-BJ-009',
      paymentMode,
      timestamp: Date.now(),
      items: [
        {
          id: '1',
          designation,
          quantity: 1,
          unitPriceTTC: Number(amountTTC),
          taxGroup,
        },
      ],
    });

    setGeneratedInvoice(result);

    const newTx: CashTransaction = {
      id: `tx_${Date.now()}`,
      code: `CAISSE-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: 'ENTREE',
      category: 'COMMISSION_VENTE',
      amount: Number(amountTTC),
      description: designation,
      agentOrClient: clientName,
      paymentMode,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      emecefInvoiceRef: invoiceNum,
    };
    onAddTransaction(newTx);

    confetti({ particleCount: 35, spread: 55, colors: ['#FA3055', '#1E293B', '#10B981'] });
  };

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
    setExpenseAmount(50000);
    setExpenseReceiptRef(`DEP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setActiveTab('cashbook');
  };

  const totalEntrees = transactions.filter(t => t.type === 'ENTREE').reduce((acc, t) => acc + t.amount, 0);
  const totalSorties = transactions.filter(t => t.type === 'SORTIE').reduce((acc, t) => acc + t.amount, 0);
  const totalSalaires = transactions.filter(t => t.category === 'SALAIRE_REMUNERATION').reduce((acc, t) => acc + t.amount, 0);
  const soldeCaisse = totalEntrees - totalSorties;

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
      {/* TAB 1: INVOICE GENERATOR & PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#FA3055]" />
                <span>Émettre une facture normalisée</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
                e-MECeF
              </span>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du client ou bailleur</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IFU client (optionnel)</label>
                  <input
                    type="text"
                    value={clientIfu}
                    onChange={(e) => setClientIfu(e.target.value)}
                    placeholder="1201884729104"
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Désignation de la prestation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Montant TTC (FCFA)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={amountTTC}
                    onChange={(e) => setAmountTTC(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-bold text-[#FA3055]"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Groupe taxe DGI</label>
                  <select
                    value={taxGroup}
                    onChange={(e) => setTaxGroup(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold"
                  >
                    <option value="B">Groupe B (TVA 18%)</option>
                    <option value="A">Groupe A (0% exonéré)</option>
                    <option value="E">Groupe E (TPS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mode de règlement</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs font-semibold"
                >
                  <option value="VIREMENT">Virement bancaire (BOA, Ecobank, Coris)</option>
                  <option value="MOBILE_MONEY">Mobile Money (MTN MoMo ou Moov)</option>
                  <option value="CHEQUE">Chèque bancaire</option>
                  <option value="ESPECES">Espèces (contre-reçu)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full min-h-[46px] py-3 px-4 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Émettre la facture normalisée & sceller DGI</span>
              </button>
            </form>
          </div>

          {/* e-MECeF Official Styled Chezmoi Invoice Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#FA3055]" />
                <span>Aperçu de la facture certifiée</span>
              </h3>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F4F6F5] hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Imprimer / PDF</span>
              </button>
            </div>

            {generatedInvoice && (
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm font-sans text-xs text-slate-800 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-200 pb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <ChezmoiLogo size={46} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-black text-slate-900 tracking-tight">chezmoi</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FA3055] text-white font-black">
                          .bj
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 mt-0.5">CHEZMOI IMMOBILIER SARL</p>
                      <p className="text-[10px] text-slate-500">IFU : 3202112345678 • RCCM : RB/COT/21 B 28941</p>
                      <p className="text-[10px] text-slate-500">Rue 320 Haie-Vive, Cotonou, Bénin</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                      Facture acquittée
                    </span>
                    <h2 className="text-base font-black text-slate-900 mt-1 font-mono">
                      {generatedInvoice.invoiceNumber}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Date : <span className="font-semibold text-slate-700">{generatedInvoice.formattedDate}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Facturé à</span>
                    <p className="text-xs font-bold text-slate-900">{clientName}</p>
                    <p className="text-[11px] text-slate-600">{clientPhone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">IFU client</span>
                    <p className="text-xs font-mono font-semibold text-slate-800">{clientIfu || 'Particulier'}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Désignation</th>
                        <th className="py-2.5 px-3 text-center">Taxe</th>
                        <th className="py-2.5 px-3 text-right">Prix TTC (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 px-3 font-medium text-slate-800">{designation}</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-600">Gr. {taxGroup}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {Number(amountTTC).toLocaleString('fr-FR')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-full sm:w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total HT :</span>
                      <span className="font-mono">{generatedInvoice.totalHT.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>TVA (18%) :</span>
                      <span className="font-mono">{generatedInvoice.totalTVA.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#FA3055] pt-2 border-t border-slate-200">
                      <span>Total net TTC :</span>
                      <span className="font-mono">{generatedInvoice.totalTTC.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200/80">
                  <div className="w-16 h-16 bg-slate-950 p-1 rounded-lg flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-14 h-14 text-white" />
                  </div>
                  <div className="space-y-0.5 text-[10px] text-slate-700 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">SCEAU SDC / DGI BÉNIN</span>
                      <span className="font-mono font-bold text-[#FA3055]">VALIDE</span>
                    </div>
                    <p className="font-mono">Code sécurité : <strong className="text-slate-900">{generatedInvoice.securityCode}</strong></p>
                    <p className="font-mono text-slate-600">NIM : {generatedInvoice.nim} • SDC : {generatedInvoice.sdcId}</p>
                  </div>
                </div>

              </div>
            )}
          </div>

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
                      min={1000}
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(Number(e.target.value))}
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
                    min={100}
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
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
                  <h3 className="font-black text-lg text-slate-900">CHEZMOI IMMOBILIER SARL</h3>
                  <p className="text-[11px] text-slate-500">IFU : 3202112345678 • RCCM : RB/COT/21 B 28941</p>
                  <p className="text-[11px] text-slate-500">Siège social : Rue 320 Haie-Vive, Cotonou, République du Bénin</p>
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
                    <span className="font-mono font-bold text-slate-900">19 250 000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Commissions & gestion locative :</span>
                    <span className="font-mono font-bold text-slate-900">2 550 000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Frais d'ouverture de dossier recensement :</span>
                    <span className="font-mono font-bold text-slate-900">50 000</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-emerald-900">
                    <span>Total produits d'exploitation :</span>
                    <span className="font-mono">{totalEntrees.toLocaleString('fr-FR')} FCFA</span>
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
                    <span className="font-mono font-bold text-purple-900">{totalSalaires.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Frais de carburant & prospection terrain :</span>
                    <span className="font-mono font-bold text-slate-900">75 000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Télécom, internet 4G & forfaits :</span>
                    <span className="font-mono font-bold text-slate-900">45 000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Fournitures administratives & bureau :</span>
                    <span className="font-mono font-bold text-slate-900">35 000</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-rose-900">
                    <span>Total charges d'exploitation :</span>
                    <span className="font-mono">{totalSorties.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Net Result & Cash Balance */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Résultat net d’exploitation</span>
                <p className="text-2xl font-black text-emerald-700 mt-0.5 font-mono">
                  +{soldeCaisse.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[10px] text-slate-500">Excédent net après déduction de l'intégralité des charges et salaires</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Trésorerie disponible</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
                  {soldeCaisse.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[10px] text-slate-500">Comptes bancaires BOA / Ecobank & caisse siège</p>
              </div>
            </div>

            {/* Official Signatures Box */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
              <div className="text-center p-4 border border-dashed border-slate-200 rounded-xl h-28 flex flex-col justify-between">
                <span className="font-bold text-slate-700">Le Chef Comptable</span>
                <p className="font-mono text-[10px] text-slate-400 italic">M. Christian Dossou - Visa certifié</p>
              </div>

              <div className="text-center p-4 border border-dashed border-slate-200 rounded-xl h-28 flex flex-col justify-between">
                <span className="font-bold text-slate-700">La Direction Générale</span>
                <p className="font-mono text-[10px] text-slate-400 italic">M. Jean-Luc Hounnou - Signature & Sceau</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
