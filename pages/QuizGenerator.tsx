import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Type, Upload, Sparkles, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generateQuiz, extractTopicsFromText } from '../services/geminiService';
import { extractTextFromPDF } from '../services/pdfService';
import AdBanner from '../components/AdBanner';

const QuizGenerator: React.FC = () => {
  const [mode, setMode] = useState<'topic' | 'text' | 'pdf'>('topic');
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { addQuiz, addSubject, addChapter } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let context = "";
      let topicName = "";

      if (mode === 'topic') {
        topicName = input;
      } else if (mode === 'text') {
        context = input;
        const topics = await extractTopicsFromText(input);
        topicName = topics[0] || "General Knowledge";
      } else if (mode === 'pdf' && file) {
        context = await extractTextFromPDF(file);
        const topics = await extractTopicsFromText(context);
        topicName = topics[0] || file.name.replace('.pdf', '');
      }

      if (!topicName) throw new Error("Could not determine topic");

      const quizData = await generateQuiz(context, topicName, 'medium');
      
      const quiz = {
        id: crypto.randomUUID(),
        title: quizData.title || topicName + " Quiz",
        questions: quizData.questions as any[],
        createdAt: Date.now(),
        sourceType: mode
      };

      await addQuiz(quiz);
      navigate(`/play/${quiz.id}`);

    } catch (error) {
      console.error(error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Quiz Generator</h1>

      {/* Ad: 468x60 */}
      <AdBanner 
        atOptions={{
          key: 'a227841c668bc753c8dab78ed9c9170b',
          format: 'iframe',
          height: 60,
          width: 468,
          params: {}
        }}
        className="mb-6 hidden sm:flex"
      />
      <AdBanner 
        atOptions={{
          key: 'cc195540a99560ecf2fec170f25610ae',
          format: 'iframe',
          height: 50,
          width: 320,
          params: {}
        }}
        className="mb-6 sm:hidden"
      />

      {/* Mode Switcher */}
      <div className="grid grid-cols-3 gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {(['topic', 'text', 'pdf'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize flex items-center justify-center gap-2
              ${mode === m 
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {m === 'topic' && <Type size={16} />}
            {m === 'text' && <FileText size={16} />}
            {m === 'pdf' && <Upload size={16} />}
            {m}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        {mode === 'topic' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enter a Topic</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Quantum Physics, Roman Empire, React Hooks"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
            />
          </div>
        )}

        {mode === 'text' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paste Study Material</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your notes or article here..."
              className="w-full h-48 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none dark:text-white resize-none"
            />
          </div>
        )}

        {mode === 'pdf' && (
          <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Upload size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-900 dark:text-white font-medium">{file ? file.name : "Click to upload PDF"}</p>
            <p className="text-sm text-slate-500 mt-1">We'll extract text locally to generate questions</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || (mode === 'topic' && !input) || (mode === 'text' && !input) || (mode === 'pdf' && !file)}
          className={`w-full mt-8 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
            ${loading ? 'bg-slate-400 cursor-wait' : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:shadow-lg hover:shadow-primary-500/25 active:scale-95'}`}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {loading ? "Analyzing & Generating..." : "Generate Quiz"}
        </button>
      </div>
    </div>
  );
};

export default QuizGenerator;