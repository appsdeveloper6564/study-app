import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { BookOpen, List, GraduationCap, ArrowLeft, FileText, Sparkles } from 'lucide-react';
import QuizRunner from '../components/QuizRunner';
import { Quiz, QuizResult, Note } from '../types';
import AdBanner from '../components/AdBanner';

// Simple markdown renderer component
const MarkdownView: React.FC<{ content: string }> = ({ content }) => {
  const lines = content ? content.split('\n') : [];
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {lines.map((line, i) => {
        const cleanLine = line.trim();
        if (!cleanLine) return <div key={i} className="h-4" />;
        
        if (cleanLine.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-100">{cleanLine.replace('### ', '')}</h3>;
        if (cleanLine.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">{cleanLine.replace('## ', '')}</h2>;
        if (cleanLine.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-8 mb-6 text-slate-900 dark:text-white">{cleanLine.replace('# ', '')}</h1>;
        
        if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-4 mb-2">
              <span className="text-primary-500 mt-1.5">•</span>
              <span className="leading-relaxed text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{
                __html: cleanLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} />
            </div>
          );
        }

        return <p key={i} className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{
           __html: cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        }} />;
      })}
    </div>
  );
};

const CourseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { quizzes, saveQuizResult } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'summary' | 'notes' | 'quiz'>('summary');
  
  const course = quizzes.find(q => q.id === id);

  if (!course) {
    return <div className="p-8 text-center">Course/Quiz not found. <button onClick={() => navigate('/')} className="text-primary-600 underline">Go Home</button></div>;
  }

  if (activeTab === 'quiz') {
    return (
      <QuizRunner 
        courseId={course.id} 
        questions={course.questions} 
        onComplete={(attempt) => {
           saveQuizResult({
             id: crypto.randomUUID(),
             quizId: attempt.courseId || course.id,
             score: attempt.score,
             totalQuestions: course.questions.length,
             answers: attempt.answers,
             completedAt: attempt.completedAt
           });
           setActiveTab('summary');
        }}
        onExit={() => setActiveTab('summary')}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Back to Topics
      </button>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
          {course.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
           <span className="flex items-center gap-1"><FileText size={16}/> {course.questions.length} Questions</span>
           <span>•</span>
           <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400"><Sparkles size={14} /> AI Generated Content</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap transition-colors
            ${activeTab === 'summary' 
              ? 'border-primary-600 text-primary-600 dark:text-primary-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <List size={18} />
          Summary
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap transition-colors
            ${activeTab === 'notes' 
              ? 'border-primary-600 text-primary-600 dark:text-primary-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <BookOpen size={18} />
          Study Notes
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className="flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap transition-colors border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <GraduationCap size={18} />
          Practice Quiz
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 min-h-[400px]">
        {activeTab === 'summary' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Quick Summary</h2>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              Summary not available for this quiz type.
            </p>
            
            <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-center">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">Ready to test your knowledge?</h3>
              <p className="text-indigo-700 dark:text-indigo-300 mb-4 text-sm">Take the {course.questions.length}-question quiz to reinforce your learning.</p>
              <button 
                onClick={() => setActiveTab('quiz')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
              >
                <GraduationCap size={18} />
                Start Quiz
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="animate-fade-in">
             <div className="text-center text-slate-500">No specific study notes attached to this quiz.</div>
          </div>
        )}
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

export default CourseView;