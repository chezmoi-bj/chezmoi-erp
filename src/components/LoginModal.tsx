import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  KeyRound, 
  Mail, 
  CheckCircle2, 
  Edit3, 
  UserCheck, 
  Lock, 
  Building2, 
  Phone, 
  Save, 
  Sparkles,
  Award,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Role, UserAccount } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSelectUser: (user: UserAccount) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'edit'>('switch');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(currentUser);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickSwitch = (u: UserAccount) => {
    onSelectUser(u);
    setEditingUser(u);
    setSuccessMsg(`Session connectée : ${u.name} (${u.role})`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 900);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser);
    confetti({ particleCount: 30, spread: 50, colors: ['#FA3055', '#1E293B'] });
    setSuccessMsg('Compte utilisateur mis à jour avec succès');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 2000);
  };

  const roleLabels: Record<Role, { label: string; color: string; desc: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'bg-rose-100 text-[#FA3055] border-rose-300', desc: 'Direction générale - Accès illimité' },
    ADMIN: { label: 'Admin Opérations', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', desc: 'Directeur des opérations foncières' },
    RH: { label: 'Ressources humaines', color: 'bg-purple-100 text-purple-700 border-purple-300', desc: 'Gestion du personnel, contrats, paie & congés' },
    COMPTABLE: { label: 'Comptable', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Factures normalisées, bilans & trésorerie' },
    SECRETAIRE: { label: 'Secrétaire', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'Accueil, courriers, GED & mandats' },
    AGENT_RECENSEUR: { label: 'Agent recenseur', color: 'bg-sky-100 text-sky-800 border-sky-300', desc: 'Relevé GPS & photos terrain offline-first' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-[32px] max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#FA3055]/10 text-[#FA3055] flex items-center justify-center flex-shrink-0 font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#FA3055] uppercase tracking-wider">
              Contrôle d'accès & sécurité (RBAC)
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Connexion & gestion des comptes Chezmoi
            </h2>
          </div>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-5 bg-[#F4F6F5] p-1 rounded-full text-xs font-semibold">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 rounded-full cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'switch' ? 'bg-[#FA3055] text-white shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Changer de compte ({allUsers.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('edit');
              setEditingUser(currentUser);
            }}
            className={`flex-1 py-2 rounded-full cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'edit' ? 'bg-[#FA3055] text-white shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modifier un compte</span>
          </button>
        </div>

        {activeTab === 'switch' ? (
          /* User Account Switcher */
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Sélectionnez un profil pour vous connecter instantanément et tester l'expérience selon vos droits d'accès :
            </p>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {allUsers.map((u) => {
                const isCurrent = currentUser.id === u.id;
                const rInfo = roleLabels[u.role] || { label: u.role, color: 'bg-slate-100 text-slate-800', desc: '' };
                return (
                  <div
                    key={u.id}
                    onClick={() => handleQuickSwitch(u)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-[#FA3055] bg-[#FA3055]/5 ring-1 ring-[#FA3055]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{u.name}</h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FA3055] text-white">
                              Actif
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{u.email} • {u.phone}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{rInfo.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${rInfo.color}`}>
                        {rInfo.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUser(u);
                          setActiveTab('edit');
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                        title="Modifier ce compte"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Edit User Account Form */
          editingUser && (
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <img
                    src={editingUser.avatar}
                    alt={editingUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Modification de : {editingUser.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {editingUser.id}</span>
                  </div>
                </div>

                <select
                  value={editingUser.id}
                  onChange={(e) => {
                    const found = allUsers.find(u => u.id === e.target.value);
                    if (found) setEditingUser(found);
                  }}
                  className="bg-white border border-slate-200 text-xs py-1.5 px-3 rounded-xl font-semibold"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adresse email</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone Bénin (+229)</label>
                  <input
                    type="text"
                    required
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rôle et habilitation (RBAC)</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  >
                    <option value="SUPER_ADMIN">Super Admin (Direction générale)</option>
                    <option value="ADMIN">Admin (Opérations & audit)</option>
                    <option value="RH">RH (Personnel, paie & congés)</option>
                    <option value="COMPTABLE">Comptable (Finance & e-MECeF)</option>
                    <option value="SECRETAIRE">Secrétaire (Accueil & GED)</option>
                    <option value="AGENT_RECENSEUR">Agent recenseur (Terrain GPS)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Intitulé du poste</label>
                  <input
                    type="text"
                    value={editingUser.jobTitle}
                    onChange={(e) => setEditingUser({ ...editingUser, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salaire mensuel de base (FCFA)</label>
                  <input
                    type="number"
                    value={editingUser.baseSalary}
                    onChange={(e) => setEditingUser({ ...editingUser, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 font-bold text-[#FA3055] focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taux de commission (%)</label>
                  <input
                    type="number"
                    step={0.5}
                    value={editingUser.commissionRate}
                    onChange={(e) => setEditingUser({ ...editingUser, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statut d'activité</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAF9] border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FA3055]"
                  >
                    <option value="ACTIF">Actif en poste</option>
                    <option value="EN_MISSION">En mission terrain</option>
                    <option value="CONGE">En congé autorisé</option>
                    <option value="SUSPENDU">Suspendu / Inactif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('switch')}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          )
        )}

      </div>
    </div>
  );
};
