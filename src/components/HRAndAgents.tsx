import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  DollarSign,
  FileCheck,
  Calendar,
  Printer,
  Edit3,
  UserCheck,
  Upload,
  Save,
  Award,
  Clock,
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
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+229 97 ');
  const [newRole, setNewRole] = useState<Role>('AGENT_RECENSEUR');
  const [newCity] = useState('Cotonou');
  const [newSalary, setNewSalary] = useState<number>(220000);
  const [newCommissionRate] = useState<number>(3.5);
  const [newJobTitle] = useState('Agent recenseur foncier terrain');
  const [newAvatar, setNewAvatar] = useState<string>('');

  const [leaveEmployeeId, setLeaveEmployeeId] = useState(agents[0]?.id || '');
  const [leaveType] = useState<'CONGE_PAYE' | 'PERMISSION_EXCEPTIONNELLE' | 'MALADIE'>('CONGE_PAYE');
  const [leaveStart, setLeaveStart] = useState('2026-10-25');
  const [leaveEnd, setLeaveEnd] = useState('2026-10-31');
  const [leaveReason, setLeaveReason] = useState('Congé annuel légal');

  const [payrollEmployeeId, setPayrollEmployeeId] = useState(agents[0]?.id || '');
  const [payrollMonth, setPayrollMonth] = useState('Octobre 2026');
  const [payrollBonus, setPayrollBonus] = useState<number>(25000);

  const formatMoney = (amount: number) => {
    if (currency === 'USD') {
      return `$${Math.round(amount / 600).toLocaleString('en-US')}`;
    }
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const filteredEmployees = agents.filter((a) => {
    if (roleFilter === 'ALL') return true;
    return a.role === roleFilter;
  });

  const handleAvatarFileChange = (file: File | null, onSet: (url: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onSet(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newEmp: UserAccount = {
      id: `user_${Date.now()}`,
      name: newName,
      avatar:
        newAvatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
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
    confetti({ particleCount: 35, spread: 50, colors: ['#141414', '#10B981'] });
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewAvatar('');
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = agents.find((a) => a.id === leaveEmployeeId) || agents[0];
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
    const emp = agents.find((a) => a.id === payrollEmployeeId) || agents[0];
    const base = emp.baseSalary || 220000;
    const comms = Math.round((emp.totalCommissions || 500000) * 0.15);
    const bonus = Number(payrollBonus);
    const gross = base + comms + bonus;
    const cnss = Math.round(gross * 0.036);
    const ipts = Math.round(gross * 0.06);
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
    confetti({ particleCount: 40, spread: 55, colors: ['#141414', '#10B981'] });
  };

  const totalPayrollMonth = payslips.reduce((acc, p) => acc + p.netPayable, 0);

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-7 border border-neutral-200 dark:border-white/10 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-white/10 text-[#141414] dark:text-white">
                Direction des ressources humaines
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                Législation du travail Bénin & CNSS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#141414] dark:text-white mt-2 tracking-tight">
              Gestion des ressources humaines, paie & équipes
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
              Fiches collaborateurs, émission des bulletins de paie, validation des congés et suivi de la performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold self-start lg:self-center">
            {[
              { id: 'employees', label: `Collaborateurs (${agents.length})` },
              { id: 'payroll', label: `Bulletins de paie (${payslips.length})` },
              { id: 'leaves', label: `Congés (${leaveRequests.length})` },
              { id: 'performance', label: 'Quotas & objectifs' },
            ].map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all bg-[#141414] hover:bg-[#2C2C2C] text-white tabular-nums ${
                    isActive ? 'ring-2 ring-offset-2 ring-[#141414] dark:ring-white/40 font-bold' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pastel Listeo KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-neutral-200 dark:border-white/10">
          <div className="p-4 rounded-xl bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Effectif total</span>
              <p className="text-2xl font-extrabold text-[#141414] dark:text-white mt-1 tabular-nums">
                {agents.length} employés
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">100% déclarés CNSS</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-neutral-200">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Masse salariale</span>
              <p className="text-xl font-extrabold text-emerald-950 dark:text-white mt-1 tabular-nums">
                {formatMoney(totalPayrollMonth)}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Salaires + primes</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/25 border border-sky-200/80 dark:border-sky-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">Recenseurs actifs</span>
              <p className="text-2xl font-extrabold text-sky-950 dark:text-white mt-1 tabular-nums">
                {agents.filter((a) => a.role === 'AGENT_RECENSEUR' && a.status === 'ACTIF').length} terrain
              </p>
              <p className="text-[11px] text-sky-700 dark:text-sky-400 mt-0.5">Cotonou, Calavi, Ouidah</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center text-sky-700 dark:text-sky-300">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/75 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Demandes de congés</span>
              <p className="text-2xl font-extrabold text-amber-950 dark:text-white mt-1 tabular-nums">
                {leaveRequests.filter((l) => l.status === 'EN_ATTENTE').length} en attente
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">À arbitrer par les RH</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-7 border border-neutral-200 dark:border-white/10 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-[#141414] dark:text-white">
                Répertoire du personnel & profils RBAC
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Comptes autorisés par l'administrateur principal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 text-xs py-2 px-3 rounded-lg font-semibold cursor-pointer"
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
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nouveau collaborateur</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 bg-white dark:bg-[#181C22] transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {emp.avatar && !failedAvatars[emp.id] ? (
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        referrerPolicy="no-referrer"
                        onError={() => setFailedAvatars((prev) => ({ ...prev, [emp.id]: true }))}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-neutral-200 dark:ring-white/15 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#141414] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#141414] dark:text-white truncate">{emp.name}</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{emp.jobTitle}</p>
                      <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {emp.role}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${
                      emp.status === 'ACTIF'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAFAFA] dark:bg-[#13161B] border border-neutral-200/70 dark:border-white/10 space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                    <span>Salaire de base :</span>
                    <strong className="text-[#141414] dark:text-white tabular-nums">{formatMoney(emp.baseSalary)}</strong>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                    <span>Commission terrain :</span>
                    <strong className="text-[#141414] dark:text-white tabular-nums">{emp.commissionRate}%</strong>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                    <span>Zone d'affectation :</span>
                    <span className="truncate max-w-[150px]">{emp.assignedZone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectUser(emp)}
                    className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Se connecter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingUser(emp)}
                    className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
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

      {/* TAB 2: PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-7 border border-neutral-200 dark:border-white/10 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-[#141414] dark:text-white">
                Gestion des salaires & bulletins de paie (Bénin)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Calcul des rémunérations brutes, cotisations CNSS et versement net aux collaborateurs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPayrollModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Générer un bulletin de paie</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-white/10 text-neutral-400 font-bold uppercase text-[10px]">
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
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {payslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#141414] dark:text-white">{slip.slipNumber}</td>
                    <td className="py-3 px-3 font-semibold text-[#141414] dark:text-white">{slip.employeeName}</td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">{slip.month}</td>
                    <td className="py-3 px-3 font-mono tabular-nums">{formatMoney(slip.baseSalary)}</td>
                    <td className="py-3 px-3 font-mono tabular-nums">+{formatMoney(slip.commissions + slip.bonuses)}</td>
                    <td className="py-3 px-3 font-mono text-neutral-500 tabular-nums">-{formatMoney(slip.cnssEmployee)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatMoney(slip.netPayable)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPayslip(slip)}
                        className="px-3 py-1 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold cursor-pointer transition-colors"
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

      {/* TAB 3: LEAVES */}
      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-7 border border-neutral-200 dark:border-white/10 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-[#141414] dark:text-white">
                Registre des congés & autorisations d'absence
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Validation formelle par le service RH et suivi du temps de repos légal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Demande de congé</span>
            </button>
          </div>

          <div className="space-y-3">
            {leaveRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#181C22] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#141414] dark:text-white">{req.employeeName}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-200">
                      {req.type === 'CONGE_PAYE' ? 'Congé payé' : req.type === 'MALADIE' ? 'Maladie' : 'Permission exceptionnelle'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 tabular-nums">
                    Du <strong className="text-[#141414] dark:text-white">{req.startDate}</strong> au{' '}
                    <strong className="text-[#141414] dark:text-white">{req.endDate}</strong> ({req.daysCount} jours)
                  </p>
                  <p className="text-xs text-neutral-500 italic">Motif : {req.reason}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      req.status === 'APPROUVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : req.status === 'REJETE'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {req.status === 'APPROUVE' ? 'Validé RH' : req.status === 'REJETE' ? 'Rejeté' : 'En attente RH'}
                  </span>

                  {req.status === 'EN_ATTENTE' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateLeaveStatus(req.id, 'APPROUVE')}
                        className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs cursor-pointer transition-colors"
                      >
                        Approuver
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateLeaveStatus(req.id, 'REJETE')}
                        className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs cursor-pointer transition-colors"
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

      {/* TAB 4: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="bg-white dark:bg-[#13161B] rounded-2xl p-5 sm:p-7 border border-neutral-200 dark:border-white/10 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-[#141414] dark:text-white">
              Suivi de la performance des recenseurs terrain
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Quotas mensuels de parcelles et villas recensées avec coordonnées GPS et photos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents
              .filter((a) => a.role === 'AGENT_RECENSEUR')
              .map((agent) => {
                const quotaTarget = 50;
                const progressPct = Math.min(100, Math.round((agent.propertiesCount / quotaTarget) * 100));

                return (
                  <div
                    key={agent.id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#181C22] space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      {agent.avatar && !failedAvatars[agent.id] ? (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          referrerPolicy="no-referrer"
                          onError={() => setFailedAvatars((prev) => ({ ...prev, [agent.id]: true }))}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-white/15 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#141414] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {agent.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-[#141414] dark:text-white">{agent.name}</h4>
                        <p className="text-[10px] text-neutral-500">
                          {agent.city} • Zone {agent.assignedZone}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 tabular-nums">
                        <span>
                          Progression quota ({agent.propertiesCount}/{quotaTarget})
                        </span>
                        <strong className="text-[#141414] dark:text-white">{progressPct}%</strong>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#141414] dark:bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs pt-2 border-t border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 tabular-nums">
                      <span>Commissions débloquées :</span>
                      <strong className="text-[#141414] dark:text-white">{formatMoney(agent.totalCommissions || 0)}</strong>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {selectedPayslip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Bulletin de paie certifié"
        >
          <div className="bg-white dark:bg-[#13161B] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Chezmoi Immobilier SARL</span>
                <h3 className="text-base font-extrabold text-[#141414] dark:text-white">Bulletin de paie certifié</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                aria-label="Fermer le bulletin"
                className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="printable-invoice space-y-2 text-xs p-3 rounded-xl bg-white text-slate-900 border border-neutral-200">
              <div className="flex justify-between">
                <span className="text-slate-500">N° Bulletin :</span>
                <strong className="font-mono text-slate-900">{selectedPayslip.slipNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Collaborateur :</span>
                <strong className="text-slate-900">
                  {selectedPayslip.employeeName} ({selectedPayslip.role})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Période :</span>
                <span>{selectedPayslip.month}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 pt-2">
                <div className="flex justify-between">
                  <span>Salaire fixe de base :</span>
                  <span className="font-mono tabular-nums">{formatMoney(selectedPayslip.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commissions & primes terrain :</span>
                  <span className="font-mono tabular-nums">+{formatMoney(selectedPayslip.commissions + selectedPayslip.bonuses)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cotisation sociale CNSS (3.6%) :</span>
                  <span className="font-mono tabular-nums">-{formatMoney(selectedPayslip.cnssEmployee)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Impôt sur salaires (IPTS) :</span>
                  <span className="font-mono tabular-nums">-{formatMoney(selectedPayslip.iptsTax)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-emerald-800 pt-2 border-t border-slate-200">
                  <span>Net versé :</span>
                  <span className="font-mono tabular-nums">{formatMoney(selectedPayslip.netPayable)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Ajouter un nouveau collaborateur"
        >
          <div className="bg-white dark:bg-[#13161B] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-[#141414] dark:text-white">Ajouter un nouveau collaborateur</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Fermer"
                className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-[#FAFAFA] dark:bg-[#181C22] rounded-xl border border-neutral-200 dark:border-white/10">
                <img
                  src={newAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="Aperçu photo"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-neutral-200 shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <label className="block font-bold text-[#141414] dark:text-white mb-0.5">Photo de profil (Avatar)</label>
                  <p className="text-[10px] text-neutral-500 mb-1.5">Importer une photo depuis l'ordinateur ou le mobile</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold text-[11px] cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir une image...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarFileChange(e.target.files?.[0] || null, setNewAvatar)}
                    />
                  </label>
                  {newAvatar && (
                    <button
                      type="button"
                      onClick={() => setNewAvatar('')}
                      className="ml-2 px-2.5 py-1 rounded-md bg-[#141414] hover:bg-[#2C2C2C] text-white text-[10px] font-semibold cursor-pointer"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Nom et prénom(s)</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Email professionnel</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Téléphone Bénin</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Rôle dans la société</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-bold"
                  >
                    <option value="AGENT_RECENSEUR">Agent recenseur terrain</option>
                    <option value="COMPTABLE">Comptable</option>
                    <option value="SECRETAIRE">Secrétaire</option>
                    <option value="RH">Ressources humaines</option>
                    <option value="ADMIN">Admin Opérations</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Salaire mensuel de base (FCFA)</label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold cursor-pointer"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Modifier le collaborateur"
        >
          <div className="bg-white dark:bg-[#13161B] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 dark:border-white/10 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Administration RH</span>
                <h3 className="text-base font-extrabold text-[#141414] dark:text-white mt-0.5">Modifier le collaborateur</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                aria-label="Fermer"
                className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateAgent(editingUser);
                confetti({ particleCount: 30, spread: 45, colors: ['#141414', '#10B981'] });
                setEditingUser(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="flex items-center gap-3.5 p-3 bg-[#FAFAFA] dark:bg-[#181C22] rounded-xl border border-neutral-200 dark:border-white/10">
                <img
                  src={editingUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={editingUser.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover ring-1 ring-neutral-200 shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <label className="block font-bold text-[#141414] dark:text-white mb-0.5">Photo de profil</label>
                  <p className="text-[10px] text-neutral-500 mb-1.5">Mettre à jour la photo du collaborateur</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold text-[11px] cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Changer la photo...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleAvatarFileChange(e.target.files?.[0] || null, (url) => {
                          setEditingUser({ ...editingUser, avatar: url });
                        });
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Nom et prénom(s)</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Téléphone Bénin</label>
                  <input
                    type="text"
                    required
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Email (Identifiant)</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Rôle & Droits RBAC</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-bold"
                  >
                    <option value="SUPER_ADMIN">Super Admin (Direction générale)</option>
                    <option value="ADMIN">Admin Opérations (Foncier & e-MECeF)</option>
                    <option value="COMPTABLE">Comptable (e-MECeF & Trésorerie)</option>
                    <option value="RH">Ressources Humaines (Paie & Congés)</option>
                    <option value="SECRETAIRE">Secrétaire (Accueil & GED)</option>
                    <option value="AGENT_RECENSEUR">Agent Recenseur (Terrain)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Intitulé du poste</label>
                  <input
                    type="text"
                    value={editingUser.jobTitle}
                    onChange={(e) => setEditingUser({ ...editingUser, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Département</label>
                  <input
                    type="text"
                    value={editingUser.departmentName}
                    onChange={(e) => setEditingUser({ ...editingUser, departmentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Ville d'affectation</label>
                  <input
                    type="text"
                    value={editingUser.city}
                    onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Zone d'intervention</label>
                  <input
                    type="text"
                    value={editingUser.assignedZone}
                    onChange={(e) => setEditingUser({ ...editingUser, assignedZone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Salaire mensuel de base (FCFA)</label>
                  <input
                    type="number"
                    value={editingUser.baseSalary}
                    onChange={(e) => setEditingUser({ ...editingUser, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-bold tabular-nums"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-200">Statut du compte</label>
                    {editingUser.emailVerified ? (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        E-mail validé
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        En attente validation
                      </span>
                    )}
                  </div>
                  <select
                    value={editingUser.status}
                    onChange={(e) => {
                      const nextStatus = e.target.value as any;
                      if (editingUser.emailVerified && nextStatus === 'EN_ATTENTE_VALIDATION') return;
                      setEditingUser({ ...editingUser, status: nextStatus });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-bold"
                  >
                    <option value="ACTIF">ACTIF (Accès autorisé)</option>
                    {!editingUser.emailVerified && (
                      <option value="EN_ATTENTE_VALIDATION">EN ATTENTE VALIDATION EMAIL</option>
                    )}
                    <option value="SUSPENDU">SUSPENDU (Accès bloqué)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {isLeaveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Soumettre une demande de congé"
        >
          <div className="bg-white dark:bg-[#13161B] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-white/10 space-y-4">
            <h3 className="text-base font-extrabold text-[#141414] dark:text-white">Soumettre une demande de congé</h3>
            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Collaborateur concerné</label>
                <select
                  value={leaveEmployeeId}
                  onChange={(e) => setLeaveEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Date début</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Date fin</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Motif de l'absence</label>
                <input
                  type="text"
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold cursor-pointer"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Émettre un bulletin de paie"
        >
          <div className="bg-white dark:bg-[#13161B] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-white/10 space-y-4">
            <h3 className="text-base font-extrabold text-[#141414] dark:text-white">Émettre un bulletin de paie</h3>
            <form onSubmit={handleCreatePayroll} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Collaborateur</label>
                <select
                  value={payrollEmployeeId}
                  onChange={(e) => setPayrollEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatMoney(a.baseSalary)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Mois de paie</label>
                <input
                  type="text"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                  Primes de rendement / panier (FCFA)
                </label>
                <input
                  type="number"
                  value={payrollBonus}
                  onChange={(e) => setPayrollBonus(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#181C22] border border-neutral-200 dark:border-white/10 font-bold tabular-nums"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#141414] hover:bg-[#2C2C2C] text-white font-bold cursor-pointer"
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
