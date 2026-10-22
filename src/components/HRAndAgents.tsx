import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  DollarSign, 
  CheckCircle2, 
  FileText, 
  Building,
  Calendar,
  Briefcase,
  FileCheck,
  Clock,
  Printer,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Edit3,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeaveRequest, PayslipRecord, Role, UserAccount } from '../types';

interface HRAndAgentsProps {
  agents: UserAccount[];
  onAddAgent: (newAgent: UserAccount) => void;
  onUpdateAgent: (updatedAgent: UserAccount) => void;
  onSelectUser: (user: UserAccount) => void;
  currency: 'FCFA' | 'USD';
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (req: LeaveRequest) => void;
  onUpdateLeaveStatus: (id: string, status: 'APPROUVE' | 'REJETE') => void;
  payslips: PayslipRecord[];
  onGeneratePayslip: (slip: PayslipRecord) => void;
}

export const HRAndAgents: React.FC<HRAndAgentsProps> = ({
  agents,
  onAddAgent,
  onUpdateAgent,
  onSelectUser,
  currency,
  leaveRequests,
  onAddLeaveRequest,
  onUpdateLeaveStatus,
  payslips,
  onGeneratePayslip,
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'leaves' | 'performance'>('employees');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  // New employee form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+229 97 ');
  const [newRole, setNewRole] = useState<Role>('AGENT_RECENSEUR');
  const [newCity, setNewCity] = useState('Cotonou');
  const [newSalary, setNewSalary] = useState<number>(220000);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(3.5);
  const [newJobTitle, setNewJobTitle] = useState('Agent recenseur foncier terrain');

  // Leave form
  const [leaveEmployeeId, setLeaveEmployeeId] = useState(agents[0]?.id || '');
  const [leaveType, setLeaveType] = useState<'CONGE_PAYE' | 'PERMISSION_EXCEPTIONNELLE' | 'MALADIE'>('CONGE_PAYE');
  const [leaveStart, setLeaveStart] = useState('2026-10-25');
  const [leaveEnd, setLeaveEnd] = useState('2026-10-31');
  const [leaveReason, setLeaveReason] = useState('Congé annuel légal');

  // Payroll generator form
  const [payrollEmployeeId, setPayrollEmployeeId] = useState(agents[0]?.id || '');
  const [payrollMonth, setPayrollMonth] = useState('Octobre 2026');
  const [payrollBonus, setPayrollBonus] = useState<number>(25000);

  const formatMoney = (amount: number) => {
    if (currency === 'USD') {
      return `$${Math.round(amount / 600).toLocaleString('en-US')}`;
    }
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const filteredEmployees = agents.filter(a => {
    if (roleFilter === 'ALL') return true;
    return a.role === roleFilter;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newEmp: UserAccount = {
      id: `user_${Date.now()}`,
      name: newName,
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 9999999)}?w=150&auto=format&fit=crop&q=80`,
      phone: newPhone,
      email: newEmail,
      role: newRole,
      jobTitle: newJobTitle,
      departmentName: newRole === 'AGENT_RECENSEUR' ? 'Recensement terrain' : 'Administration & gestion',
      baseSalary: Number(newSalary),
      commissionRate: Number(newCommissionRate),
      hireDate: new Date().toISOString().substring(0, 10),
      contractType: newRole === 'AGENT_RECENSEUR' ? 'CDD' : 'CDI',
      city: newCity,
      assignedZone: `${newCity} et environs`,
      rating: 8.5,
      propertiesCount: 0,
      pendingSyncCount: 0,
      totalCommissions: 0,
      status: 'ACTIF',
      cnssNumber: `CNSS-2026-${Math.floor(100 + Math.random() * 900)}`,
    };

    onAddAgent(newEmp);
    confetti({ particleCount: 35, spread: 50, colors: ['#FA3055', '#1E293B'] });
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = agents.find(a => a.id === leaveEmployeeId) || agents[0];
    const newReq: LeaveRequest = {
      id: `leave_${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      daysCount: 6,
      reason: leaveReason,
      status: 'EN_ATTENTE',
      requestedAt: new Date().toISOString().substring(0, 10),
    };
    onAddLeaveRequest(newReq);
    setIsLeaveModalOpen(false);
    confetti({ particleCount: 25, spread: 40 });
  };

  const handleCreatePayroll = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = agents.find(a => a.id === payrollEmployeeId) || agents[0];
    const base = emp.baseSalary || 220000;
    const comms = Math.round((emp.totalCommissions || 500000) * 0.15);
    const bonus = Number(payrollBonus);
    const gross = base + comms + bonus;
    const cnss = Math.round(gross * 0.036); // 3.6% CNSS salarié Bénin
    const ipts = Math.round(gross * 0.06); // IPTS simplifié
    const net = gross - cnss - ipts;

    const newSlip: PayslipRecord = {
      id: `slip_${Date.now()}`,
      slipNumber: `BS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.role,
      month: payrollMonth,
      baseSalary: base,
      commissions: comms,
      bonuses: bonus,
      grossTotal: gross,
      cnssEmployee: cnss,
      iptsTax: ipts,
      netPayable: net,
      paymentMode: 'Virement bancaire / Mobile Money',
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'PAYE',
    };

    onGeneratePayslip(newSlip);
    setSelectedPayslip(newSlip);
    setIsPayrollModalOpen(false);
    confetti({ particleCount: 40, spread: 55, colors: ['#FA3055', '#10B981'] });
  };

  const totalPayrollMonth = payslips.reduce((acc, p) => acc + p.netPayable, 0);

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FA3055] text-white">
                Direction des ressources humaines
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                Législation du travail Bénin & CNSS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Gestion des ressources humaines, paie & équipes
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Fiches collaborateurs, émission des bulletins de paie, validation des congés et suivi de la performance des recenseurs.
            </p>
          </div>

          {/* Navigation Pill */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F4F6F5] p-1 rounded-full text-xs font-semibold self-start lg:self-center">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-3.5 py-2 rounded-full cursor-pointer transition-all ${
                activeTab === 'employees' ? 'bg-[#FA3055] text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Collaborateurs ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-3.5 py-2 rounded-full cursor-pointer transition-all ${
                activeTab === 'payroll' ? 'bg-[#FA3055] text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulletins de paie ({payslips.length})
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-3.5 py-2 rounded-full cursor-pointer transition-all ${
                activeTab === 'leaves' ? 'bg-[#FA3055] text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Congés & absences ({leaveRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-3.5 py-2 rounded-full cursor-pointer transition-all ${
                activeTab === 'performance' ? 'bg-[#FA3055] text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quotas & objectifs
            </button>
          </div>
        </div>

        {/* Global HR Key Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-[#FA3055]/5 border border-[#FA3055]/15">
            <span className="text-xs font-semibold text-[#FA3055]">Effectif total</span>
            <p className="text-2xl font-bold text-[#FA3055] mt-1">{agents.length} employés</p>
            <p className="text-[10px] text-slate-500 mt-0.5">100% déclarés CNSS</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-semibold text-emerald-800">Masse salariale mensuelle</span>
            <p className="text-2xl font-bold text-emerald-950 mt-1">{formatMoney(totalPayrollMonth)}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Salaires de base + primes</p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
            <span className="text-xs font-semibold text-sky-800">Agents recenseurs actifs</span>
            <p className="text-2xl font-bold text-sky-950 mt-1">
              {agents.filter(a => a.role === 'AGENT_RECENSEUR' && a.status === 'ACTIF').length} sur le terrain
            </p>
            <p className="text-[10px] text-sky-700 mt-0.5">Cotonou, Calavi, Ouidah</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xs font-semibold text-amber-800">Demandes de congés</span>
            <p className="text-2xl font-bold text-amber-950 mt-1">
              {leaveRequests.filter(l => l.status === 'EN_ATTENTE').length} en attente
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">À arbitrer par les RH</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMPLOYEES & ACCESS (Fiches employés & comptes) */}
      {/* ========================================================================= */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Répertoire du personnel & profils RBAC
              </h3>
              <p className="text-xs text-slate-500">
                Comptes autorisés par l'administrateur principal (aucun auto-enregistrement).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-[#F4F6F5] border border-slate-200 text-xs py-2 px-3 rounded-full font-semibold cursor-pointer"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin Opérations</option>
                <option value="RH">Ressources humaines</option>
                <option value="COMPTABLE">Comptable</option>
                <option value="SECRETAIRE">Secrétaire</option>
                <option value="AGENT_RECENSEUR">Agent recenseur</option>
              </select>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nouveau collaborateur</span>
              </button>
            </div>
          </div>

          {/* Employees List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div 
                key={emp.id} 
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition-all hover:shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#FA3055]/20 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{emp.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{emp.jobTitle}</p>
                      <span className="text-[10px] font-semibold text-[#FA3055] bg-[#FA3055]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {emp.role}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    emp.status === 'ACTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {emp.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Salaire de base :</span>
                    <strong className="text-slate-900">{formatMoney(emp.baseSalary)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Commission terrain :</span>
                    <strong className="text-[#FA3055]">{emp.commissionRate}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Zone d'affectation :</span>
                    <span className="truncate max-w-[150px]">{emp.assignedZone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => onSelectUser(emp)}
                    className="text-[#FA3055] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Se connecter</span>
                  </button>

                  <button
                    onClick={() => setEditingUser(emp)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAYROLL & SALARIES (Bulletins de paie) */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gestion des salaires & bulletins de paie (Bénin)
              </h3>
              <p className="text-xs text-slate-500">
                Calcul des rémunérations brutes, cotisations CNSS et versement net aux collaborateurs.
              </p>
            </div>

            <button
              onClick={() => setIsPayrollModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Générer un bulletin de paie</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Réf. bulletin</th>
                  <th className="py-2.5 px-3">Collaborateur</th>
                  <th className="py-2.5 px-3">Mois</th>
                  <th className="py-2.5 px-3">Salaire base</th>
                  <th className="py-2.5 px-3">Commissions & primes</th>
                  <th className="py-2.5 px-3">CNSS (3.6%)</th>
                  <th className="py-2.5 px-3">Net à payer</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{slip.slipNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{slip.employeeName}</td>
                    <td className="py-3 px-3 text-slate-600">{slip.month}</td>
                    <td className="py-3 px-3 font-mono">{formatMoney(slip.baseSalary)}</td>
                    <td className="py-3 px-3 font-mono text-[#FA3055]">+{formatMoney(slip.commissions + slip.bonuses)}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">-{formatMoney(slip.cnssEmployee)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">{formatMoney(slip.netPayable)}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedPayslip(slip)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                      >
                        Aperçu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEAVES & ABSENCES (Congés & absences) */}
      {/* ========================================================================= */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registre des congés & autorisations d'absence
              </h3>
              <p className="text-xs text-slate-500">
                Validation formelle par le service RH et suivi du temps de repos légal.
              </p>
            </div>

            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Demande de congé</span>
            </button>
          </div>

          <div className="space-y-3">
            {leaveRequests.map((req) => (
              <div 
                key={req.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{req.employeeName}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {req.type === 'CONGE_PAYE' ? 'Congé payé' : req.type === 'MALADIE' ? 'Maladie' : 'Permission exceptionnelle'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Du <strong className="text-slate-800">{req.startDate}</strong> au <strong className="text-slate-800">{req.endDate}</strong> ({req.daysCount} jours)
                  </p>
                  <p className="text-xs text-slate-500 italic">Motif : {req.reason}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    req.status === 'APPROUVE' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : req.status === 'REJETE'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status === 'APPROUVE' ? 'Validé RH' : req.status === 'REJETE' ? 'Rejeté' : 'En attente RH'}
                  </span>

                  {req.status === 'EN_ATTENTE' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateLeaveStatus(req.id, 'APPROUVE')}
                        className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => onUpdateLeaveStatus(req.id, 'REJETE')}
                        className="px-3 py-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PERFORMANCE & QUOTAS */}
      {/* ========================================================================= */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Suivi de la performance des recenseurs terrain
            </h3>
            <p className="text-xs text-slate-500">
              Quotas mensuels de parcelles et villas recensées avec coordonnées GPS et photos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.filter(a => a.role === 'AGENT_RECENSEUR').map((agent) => {
              const quotaTarget = 50;
              const progressPct = Math.min(100, Math.round((agent.propertiesCount / quotaTarget) * 100));

              return (
                <div key={agent.id} className="p-4 rounded-2xl border border-slate-200 bg-[#F9FAF9] space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FA3055]/20"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{agent.name}</h4>
                      <p className="text-[10px] text-slate-500">{agent.city} • Zone {agent.assignedZone}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Progression quota ({agent.propertiesCount}/{quotaTarget})</span>
                      <strong className="text-[#FA3055]">{progressPct}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#FA3055] h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs pt-2 border-t border-slate-200 text-slate-600">
                    <span>Commissions débloquées :</span>
                    <strong className="text-slate-900">{formatMoney(agent.totalCommissions || 0)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#FA3055] uppercase">Chezmoi Immobilier SARL</span>
                <h3 className="text-base font-bold text-slate-900">Bulletin de paie certifié</h3>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">N° Bulletin :</span>
                <strong className="font-mono text-slate-900">{selectedPayslip.slipNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Collaborateur :</span>
                <strong className="text-slate-900">{selectedPayslip.employeeName} ({selectedPayslip.role})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Période :</span>
                <span>{selectedPayslip.month}</span>
              </div>
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 pt-2">
                <div className="flex justify-between">
                  <span>Salaire fixe de base :</span>
                  <span className="font-mono">{formatMoney(selectedPayslip.baseSalary)}</span>
                </div>
                <div className="flex justify-between text-[#FA3055]">
                  <span>Commissions & primes terrain :</span>
                  <span className="font-mono">+{formatMoney(selectedPayslip.commissions + selectedPayslip.bonuses)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cotisation sociale CNSS (3.6%) :</span>
                  <span className="font-mono">-{formatMoney(selectedPayslip.cnssEmployee)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Impôt sur salaires (IPTS) :</span>
                  <span className="font-mono">-{formatMoney(selectedPayslip.iptsTax)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-emerald-800 pt-2 border-t border-slate-200">
                  <span>Net versé :</span>
                  <span className="font-mono">{formatMoney(selectedPayslip.netPayable)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer le bulletin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Ajouter un nouveau collaborateur</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom et prénom(s)</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email professionnel</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone Bénin</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rôle dans la société</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    <option value="AGENT_RECENSEUR">Agent recenseur terrain</option>
                    <option value="COMPTABLE">Comptable</option>
                    <option value="SECRETAIRE">Secrétaire</option>
                    <option value="RH">Ressources humaines</option>
                    <option value="ADMIN">Admin Opérations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salaire mensuel de base (FCFA)</label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-[#FA3055]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FA3055] text-white font-bold"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Soumettre une demande de congé</h3>
            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collaborateur concerné</label>
                <select
                  value={leaveEmployeeId}
                  onChange={(e) => setLeaveEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date début</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motif de l'absence</label>
                <input
                  type="text"
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FA3055] text-white font-bold"
                >
                  Transmettre aux RH
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Émettre un bulletin de paie</h3>
            <form onSubmit={handleCreatePayroll} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collaborateur</label>
                <select
                  value={payrollEmployeeId}
                  onChange={(e) => setPayrollEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatMoney(a.baseSalary)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mois de paie</label>
                <input
                  type="text"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primes de rendement / panier (FCFA)</label>
                <input
                  type="number"
                  value={payrollBonus}
                  onChange={(e) => setPayrollBonus(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayrollModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FA3055] text-white font-bold"
                >
                  Calculer & émettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
