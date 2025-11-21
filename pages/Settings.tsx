import React, { useRef } from 'react';
import { Download, Upload, Database, Trash2 } from 'lucide-react';
import { db } from '../services/db';
import { useStore } from '../context/StoreContext';

const Settings: React.FC = () => {
  const { refreshData } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const json = await db.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (e) {
      alert("Export failed");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        await db.importBackup(json);
        await refreshData();
        alert("Restore successful!");
      } catch (err) {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data Management</h2>
              <p className="text-sm text-slate-500">No server is used. All data is on this device.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button 
               onClick={handleExport}
               className="flex items-center justify-center gap-2 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
             >
               <Download size={20} className="text-primary-600" />
               <div className="text-left">
                 <div className="font-semibold text-slate-900 dark:text-white">Backup Data</div>
                 <div className="text-xs text-slate-500">Download JSON file</div>
               </div>
             </button>

             <button 
               onClick={() => fileRef.current?.click()}
               className="flex items-center justify-center gap-2 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
             >
               <Upload size={20} className="text-primary-600" />
               <div className="text-left">
                 <div className="font-semibold text-slate-900 dark:text-white">Restore Data</div>
                 <div className="text-xs text-slate-500">Import JSON file</div>
               </div>
               <input type="file" ref={fileRef} className="hidden" onChange={handleImport} accept=".json" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;