import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { db } from '../services/db';
import { Note, Quiz, Chapter } from '../types';
import { FileText, PenTool, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { generateNotes, generateQuiz } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

// Component to view a specific Chapter
const ChapterView: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Chapter ID
    const navigate = useNavigate();
    const { addNote, addQuiz, refreshData } = useStore();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'notes'|'quiz'>('notes');

    useEffect(() => {
        const load = async () => {
            if(!id) return;
            // Direct DB access for specific chapter data to avoid heavy global store logic for sub-items
            const dbInstance = await db.getChapters(''); // Hacky, real app should have specific getters
            // Actually let's just use internal DB helpers or fetch manually
            // Since store exposes high level, let's just use DB direct for specific lists
            const chaps = await (await import('../services/db')).initDB();
            const c = await chaps.get('chapters', id);
            const n = await chaps.getAllFromIndex('notes', 'by-chapter', id);
            const q = await chaps.getAllFromIndex('quizzes', 'by-chapter', id);
            
            if(c) setChapter(c);
            setNotes(n);
            setQuizzes(q);
        };
        load();
    }, [id]);

    const handleGenerateNote = async () => {
        if(!chapter) return;
        setLoading(true);
        try {
            const data = await generateNotes(chapter.title, 'bullet');
            const note: Note = {
                id: crypto.randomUUID(),
                chapterId: chapter.id,
                title: data.title || "New Note",
                content: data.content || "",
                type: 'bullet',
                createdAt: Date.now()
            };
            await addNote(note);
            setNotes(prev => [...prev, note]);
        } catch(e) { alert("Error generating notes"); }
        finally { setLoading(false); }
    };

    const handleGenerateQuiz = async () => {
        if(!chapter) return;
        setLoading(true);
        try {
            const data = await generateQuiz("", chapter.title);
            const quiz: Quiz = {
                id: crypto.randomUUID(),
                chapterId: chapter.id,
                title: data.title || "New Quiz",
                questions: data.questions as any[],
                createdAt: Date.now(),
                sourceType: 'topic'
            };
            await addQuiz(quiz);
            setQuizzes(prev => [...prev, quiz]);
        } catch(e) { alert("Error generating quiz"); }
        finally { setLoading(false); }
    };

    if(!chapter) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">{chapter.title}</h1>
            
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-6">
                <button 
                    onClick={() => setActiveTab('notes')} 
                    className={`pb-3 px-4 font-medium ${activeTab === 'notes' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-500'}`}
                >
                    Notes
                </button>
                <button 
                    onClick={() => setActiveTab('quiz')} 
                    className={`pb-3 px-4 font-medium ${activeTab === 'quiz' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-500'}`}
                >
                    Quizzes
                </button>
            </div>

            {activeTab === 'notes' && (
                <div>
                    <button onClick={handleGenerateNote} disabled={loading} className="mb-4 flex items-center gap-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-lg">
                        <Plus size={18} /> {loading ? 'Generating...' : 'Generate AI Notes'}
                    </button>
                    <div className="space-y-4">
                        {notes.map(n => (
                            <div key={n.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-lg mb-2">{n.title}</h3>
                                <div className="prose dark:prose-invert max-w-none text-sm">
                                    <ReactMarkdown>{n.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {notes.length === 0 && <div className="text-slate-500">No notes yet.</div>}
                    </div>
                </div>
            )}

            {activeTab === 'quiz' && (
                <div>
                    <button onClick={handleGenerateQuiz} disabled={loading} className="mb-4 flex items-center gap-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-lg">
                        <Plus size={18} /> {loading ? 'Generating...' : 'Generate AI Quiz'}
                    </button>
                    <div className="space-y-4">
                         {quizzes.map(q => (
                             <div key={q.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                 <div>
                                     <h3 className="font-bold text-slate-900 dark:text-white">{q.title}</h3>
                                     <p className="text-sm text-slate-500">{q.questions.length} Questions</p>
                                 </div>
                                 <button onClick={() => navigate(`/play/${q.id}`)} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                     Play
                                 </button>
                             </div>
                         ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChapterView;