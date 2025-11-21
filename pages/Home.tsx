import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Book, ChevronRight, Folder, Layers, Trash2, Youtube, ExternalLink, Gamepad2, MessageCircle, Code, Mic, Gift, Globe } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Home: React.FC = () => {
  const { subjects, chapters, loading, addSubject, deleteSubject, addChapter } = useStore();
  const navigate = useNavigate();
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showSubBanner, setShowSubBanner] = useState(true);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    await addSubject(newSubjectName, 'book', 'orange');
    setNewSubjectName('');
    setShowNewSubject(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 pb-24">
      
      {/* Subscriber Goal Banner */}
      {showSubBanner && (
        <div className="mb-8 bg-gradient-to-r from-orange-600 via-purple-600 to-red-600 text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in border border-white/10">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full animate-pulse">
              <Youtube size={32} />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1">Goal: 1000 Subscribers!</h3>
              <p className="text-white/90 text-sm">We are at 950! Help us hit the milestone.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
             <a href="https://youtube.com/@mcpro_mafia?si=Q7UqOF3oTO3KsyhF" target="_blank" rel="noopener noreferrer" className="bg-white text-red-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-md flex items-center gap-2">
               <Youtube size={16} /> MCPro Mafia
             </a>
             <a href="https://youtube.com/@mafiatechpro?si=CtHV8-5g16ZJWYj_" target="_blank" rel="noopener noreferrer" className="bg-red-700 text-white border border-red-500/50 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-800 transition-colors shadow-md flex items-center gap-2">
               <Youtube size={16} /> Subscribe MafiaTechPro
             </a>
             <button onClick={() => setShowSubBanner(false)} className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
               ✕
             </button>
          </div>
        </div>
      )}

      {/* Main Library Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Library</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Organize your learning materials</p>
        </div>
        <button 
          onClick={() => setShowNewSubject(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">New Subject</span>
        </button>
      </div>

      {showNewSubject && (
        <div className="mb-8 animate-fade-in bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Create New Subject</h3>
          <form onSubmit={handleAddSubject} className="flex gap-4">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Subject Name (e.g. History, Physics)"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
              autoFocus
            />
            <button 
              type="submit"
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Add
            </button>
            <button 
              type="button"
              onClick={() => setShowNewSubject(false)}
              className="px-6 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group relative">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl">
                 <Book size={24} />
               </div>
               <button 
                 onClick={(e) => {
                    e.preventDefault();
                    if(window.confirm("Delete this subject?")) deleteSubject(subject.id);
                 }}
                 className="text-slate-300 hover:text-red-500 transition-colors p-2"
               >
                 <Trash2 size={18} />
               </button>
             </div>
             
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{subject.name}</h2>
             
             <div className="space-y-3 mb-6">
               {chapters[subject.id]?.slice(0, 3).map(chap => (
                 <div 
                   key={chap.id} 
                   onClick={() => navigate(`/chapter/${chap.id}`)}
                   className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                 >
                   <Folder size={16} />
                   <span className="truncate">{chap.title}</span>
                   <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
               ))}
               {(!chapters[subject.id] || chapters[subject.id].length === 0) && (
                 <div className="text-slate-400 text-sm italic p-2">No chapters yet</div>
               )}
             </div>

             <button 
               onClick={async () => {
                 const title = prompt("Enter Chapter Title:");
                 if(title) {
                    const newId = await addChapter(subject.id, title);
                    navigate(`/chapter/${newId}`);
                 }
               }}
               className="w-full py-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2 font-medium"
             >
               <Plus size={18} /> Add Chapter
             </button>
          </div>
        ))}
      </div>
      
      {subjects.length === 0 && !loading && (
        <div className="text-center py-12 px-4">
          <div className="bg-orange-50 dark:bg-orange-900/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
             <Layers size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No subjects yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
            Create your first subject to start organizing your notes and quizzes.
          </p>
          <button 
            onClick={() => setShowNewSubject(true)}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      )}

      {/* Developer Showcase Grid - Moved to Bottom */}
      <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Code className="text-purple-600" /> Developer's Corner
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="https://mafiacodebuilder.blogspot.com/" target="_blank" rel="noopener noreferrer" 
             className="group p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            <Code className="mb-3 opacity-80 group-hover:scale-110 transition-transform" size={28} />
            <div className="font-bold">Code Builder</div>
            <div className="text-xs opacity-80 mt-1">Try my code builder</div>
          </a>

          <a href="https://spintowinrewardsforfree.blogspot.com/" target="_blank" rel="noopener noreferrer" 
             className="group p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            <Gift className="mb-3 opacity-80 group-hover:scale-110 transition-transform" size={28} />
            <div className="font-bold">Spin & Win</div>
            <div className="text-xs opacity-80 mt-1">Get free rewards</div>
          </a>

          <a href="https://dipanshu6564gmailcom.itch.io/" target="_blank" rel="noopener noreferrer" 
             className="group p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            <Gamepad2 className="mb-3 opacity-80 group-hover:scale-110 transition-transform" size={28} />
            <div className="font-bold">My Games</div>
            <div className="text-xs opacity-80 mt-1">Download apps & games</div>
          </a>

          <a href="https://whatsapp.com/channel/0029VbBgeABGE56mFmtPxD1z" target="_blank" rel="noopener noreferrer" 
             className="group p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            <MessageCircle className="mb-3 opacity-80 group-hover:scale-110 transition-transform" size={28} />
            <div className="font-bold">WhatsApp</div>
            <div className="text-xs opacity-80 mt-1">Join our channel</div>
          </a>

          <a href="https://quizcentreforfree.blogsppot.com" target="_blank" rel="noopener noreferrer" 
             className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md transition-all">
            <Globe className="mb-3 text-purple-500" size={28} />
            <div className="font-bold">Quiz Centre</div>
          </a>

          <a href="https://voicebotgpt.netlify.app" target="_blank" rel="noopener noreferrer" 
             className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md transition-all">
            <Mic className="mb-3 text-orange-500" size={28} />
            <div className="font-bold">Voice Bot AI</div>
          </a>
        </div>
      </div>

    </main>
  );
};

export default Home;