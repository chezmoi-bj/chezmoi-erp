import React, { useState } from 'react';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  Clock, 
  FileJson, 
  Database, 
  Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SyncQueueItem } from '../utils/sync_engine';

interface SyncInspectorProps {
  queue: SyncQueueItem[];
  isOnline: boolean;
  toggleNetwork: () => void;
  triggerSync: () => void;
  isSyncing: boolean;
  onClearSynced: () => void;
  onSimulateConflict: () => void;
}

export const SyncInspector: React.FC<SyncInspectorProps> = ({
  queue,
  isOnline,
  toggleNetwork,
  triggerSync,
  isSyncing,
  onClearSynced,
  onSimulateConflict,
}) => {
  const [selectedItem, setSelectedItem] = useState<SyncQueueItem | null>(queue[0] || null);

  const pendingCount = queue.filter((i) => i.syncStatus === 'pending').length;
  const syncedCount = queue.filter((i) => i.syncStatus === 'synced').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FA3055] text-white flex items-center justify-center font-bold">
                <Database className="w-4 h-4 text-[#FA3055]" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Moteur de synchronisation hors-ligne (Drift & Dio)
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              File d'attente locale SQLite (Drift) interconnectée au serveur Cloud Hostinger (Node.js + MySQL / MariaDB).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleNetwork}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                isOnline
                  ? 'bg-emerald-50 text-[#FA3055] border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-rose-600" />}
              <span>{isOnline ? 'Serveur Cloud connecté' : 'Mode hors-ligne actif'}</span>
            </button>

            <button
              onClick={() => {
                triggerSync();
                confetti({ particleCount: 30, spread: 50, colors: ['#FA3055', '#FA3055'] });
              }}
              disabled={!isOnline || isSyncing}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#FA3055] hover:bg-[#E02045] text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#FA3055]' : ''}`} />
              <span>{isSyncing ? 'Synchronisation en cours...' : 'Forcer la synchronisation'}</span>
            </button>
          </div>
        </div>

        {/* 3 Metric counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center justify-between text-amber-900">
              <span className="text-xs font-semibold">En attente (pending)</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-950 mt-1">{pendingCount}</p>
            <p className="text-[10px] text-amber-800 mt-0.5">Stocké dans SQLite localement</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="text-xs font-semibold">Synchronisés (synced)</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-950 mt-1">{syncedCount}</p>
            <p className="text-[10px] text-emerald-800 mt-0.5">Présents sur MySQL (Hostinger Cloud)</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-slate-200">
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-xs font-semibold">Politique de retry & conflits</span>
              <Zap className="w-4 h-4 text-[#FA3055]" />
            </div>
            <p className="text-xs font-bold text-slate-900 mt-2">Backoff exponentiel (2^n)</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Stratégie : last-write-wins (LWW)</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Queue Table & Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Queue Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              File d'attente locale des mutations
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onSimulateConflict}
                className="text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 transition-colors cursor-pointer"
                title="Créer une modification concurrente pour tester la résolution de conflit"
              >
                + Simuler un conflit
              </button>
              <button
                onClick={onClearSynced}
                className="text-[11px] font-semibold text-slate-600 hover:text-[#FA3055] transition-colors cursor-pointer"
              >
                Purger les éléments terminés
              </button>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-slate-700">File d'attente vide</p>
              <p>Toutes les mutations locales sont à jour sur le serveur distant.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {queue.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isPending = item.syncStatus === 'pending';
                const isSynced = item.syncStatus === 'synced';
                const isConflict = item.syncStatus === 'conflict';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FA3055] bg-[#FA3055]/5 shadow-2xs'
                        : 'border-slate-100 hover:border-slate-200 bg-[#F9FAF9]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          item.action === 'create' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.action}
                        </span>
                        <span className="text-xs font-bold text-slate-900 capitalize">
                          {item.entityType}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 truncate max-w-[120px]">
                          {item.entityId}
                        </span>
                      </div>

                      {/* Status badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPending
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : isSynced
                          ? 'bg-emerald-100 text-emerald-800'
                          : isConflict
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.syncStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                      <span>Créé localement : {new Date(item.localTimestamp).toLocaleTimeString()}</span>
                      <span>Tentatives : {item.retryCount}/{item.maxRetries}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Item JSON Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-[#FA3055]" />
              <span>Inspecteur de payload (JSON Drift)</span>
            </h3>
            {selectedItem && (
              <span className="text-[10px] font-mono text-slate-400">
                ID : {selectedItem.id.slice(0, 14)}...
              </span>
            )}
          </div>

          {selectedItem ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed border border-slate-800">
                <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
              </div>

              <div className="p-3 rounded-xl bg-[#F9FAF9] border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Horodatage local :</span>
                  <span className="font-mono text-slate-800 font-bold">
                    {new Date(selectedItem.localTimestamp).toLocaleString()}
                  </span>
                </div>
                {selectedItem.serverTimestamp && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Horodatage serveur Cloud :</span>
                    <span className="font-mono font-bold">
                      {new Date(selectedItem.serverTimestamp).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Backoff exponentiel :</span>
                  <span className="font-mono text-slate-800 font-bold">
                    {Math.min(1000 * Math.pow(2, selectedItem.retryCount), 30000)} ms
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-10 text-center">
              Sélectionnez une mutation pour inspecter son contenu.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
