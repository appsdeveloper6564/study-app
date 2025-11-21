import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { db } from '../services/db';
import { Note, Quiz, Chapter } from '../types';
import { PenTool, GraduationCap, Plus, ArrowLeft } from 'lucide-react';
import { generateNotes, generateQuiz } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

// Component to view a specific Chapter
const ChapterView: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Chapter ID
    const navigate = useNavigate();
    const { addNote, addQuiz } = useStore();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'notes'|'quiz'>('notes');

    useEffect(() => {
        const load = async () => {
            if(!id) return;
            try {
                const c = await db.getChapter(id);
                if (c) {
                    setChapter(c);
                    const n = await db.getNotes(id);
                    const q = await db.getQuizzes(id);
                    setNotes(n || []);
                    setQuizzes(q || []);
                }
            } catch (e) {
                console.error("Error loading chapter data", e);
            }
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

    if(!chapter) return (
        <div className="flex items-center justify-center h-64 text-slate-500">
            {id ? "Loading chapter..." : "Chapter not found"}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button 
                onClick={() => navigate('/')} 
                className="mb-6 flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft size={18} /> Back to Library
            </button>
            
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">{chapter.title}</h1>
            
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-6">
                <button 
                    onClick={() => setActiveTab('notes')} 
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'notes' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <span className="flex items-center gap-2"><PenTool size={18}/> Notes</span>
                </button>
                <button 
                    onClick={() => setActiveTab('quiz')} 
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'quiz' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                     <span className="flex items-center gap-2"><GraduationCap size={18}/> Quizzes</span>
                </button>
            </div>

            {activeTab === 'notes' && (
                <div className="animate-fade-in">
                    <button onClick={handleGenerateNote} disabled={loading} className="mb-4 flex items-center gap-2 text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">
                        <Plus size={18} /> {loading ? 'Generating...' : 'Generate AI Notes'}
                    </button>
                    <div className="space-y-4">
                        {notes.map(n => (
                            <div key={n.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{n.title}</h3>
                                <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
                                    <ReactMarkdown>{n.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {notes.length === 0 && <div className="text-slate-500 italic p-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">No notes yet. Generate one to get started!</div>}
                    </div>
                </div>
            )}

            {activeTab === 'quiz' && (
                <div className="animate-fade-in">
                    <button onClick={handleGenerateQuiz} disabled={loading} className="mb-4 flex items-center gap-2 text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">
                        <Plus size={18} /> {loading ? 'Generating...' : 'Generate AI Quiz'}
                    </button>
                    <div className="space-y-4">
                         {quizzes.map(q => (
                             <div key={q.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                 <div>
                                     <h3 className="font-bold text-slate-900 dark:text-white">{q.title}</h3>
                                     <p className="text-sm text-slate-500">{q.questions.length} Questions</p>
                                 </div>
                                 <button onClick={() => navigate(`/play/${q.id}`)} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                                     Play
                                 </button>
                             </div>
                         ))}
                         {quizzes.length === 0 && <div className="text-slate-500 italic p-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">No quizzes yet.</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChapterView;