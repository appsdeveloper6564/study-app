import React, { useRef } from 'react';
import { Download, Upload, Database, Trash2, Moon, Sun } from 'lucide-react';
import { db } from '../services/db';
import { useStore } from '../context/StoreContext';
import AdBanner from '../components/AdBanner';

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

  const handleClearData = async () => {
    if (confirm("Are you sure? This will delete ALL subjects, notes, and quizzes. This cannot be undone.")) {
      // Basic implementation: delete DB
      // In a real app, use db.deleteDatabase() or clear stores
      const req = indexedDB.deleteDatabase('ai_study_db');
      req.onsuccess = () => {
        alert("Data cleared. reloading...");
        window.location.reload();
      };
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
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
               className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all font-medium text-slate-700 dark:text-slate-300"
             >
               <Download size={20} />
               Export Backup
             </button>

             <button 
               onClick={() => fileRef.current?.click()}
               className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all font-medium text-slate-700 dark:text-slate-300"
             >
               <Upload size={20} />
               Import Backup
             </button>
             <input type="file" ref={fileRef} onChange={handleImport} className="hidden" accept=".json" />
          </div>
        </div>

        <div className="p-6 bg-red-50 dark:bg-red-900/10">
           <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">Danger Zone</h3>
           <button 
             onClick={handleClearData}
             className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
           >
             <Trash2 size={18} /> Delete All Data
           </button>
        </div>
      </div>

      {/* Ad: 300x250 */}
      <AdBanner 
        atOptions={{
          key: '4aa28cf13a10ae1967a926a6d3cf9d1d',
          format: 'iframe',
          height: 250,
          width: 300,
          params: {}
        }}
        className="mt-8"
      />
    </div>
  );
};

export default Settings;