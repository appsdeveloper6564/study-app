import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { CheckCircle, XCircle, ArrowRight, Home, AlertCircle } from 'lucide-react';
import { Question } from '../types';

const QuizPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { quizzes, saveQuizResult } = useStore();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(quizzes.find(q => q.id === id));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!quiz && quizzes.length > 0) {
        const found = quizzes.find(q => q.id === id);
        if(found) setQuiz(found);
    }
  }, [quizzes, id, quiz]);

  if (!quiz) return <div className="p-8 text-center">Loading quiz...</div>;

  const question = quiz.questions[currentIndex];

  const handleAnswer = (ans: any) => {
    if (showFeedback) return;
    
    const newAnswers = [...answers];
    newAnswers[currentIndex] = ans;
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const checkAnswer = (userAns: any, q: Question): boolean => {
    if (q.type === 'mcq') {
      return String(userAns) === String(q.correctAnswer);
    }
    if (q.type === 'true_false') {
      return String(userAns).toLowerCase() === String(q.correctAnswer).toLowerCase();
    }
    // Simple string matching for others (loose equality)
    return String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
  };

  const handleNext = async () => {
    setShowFeedback(false);
    setTextAnswer('');
    
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      // Calculate score
      let score = 0;
      answers.forEach((ans, idx) => {
        if (checkAnswer(ans, quiz.questions[idx])) score++;
      });
      
      await saveQuizResult({
        id: crypto.randomUUID(),
        quizId: quiz.id,
        score,
        totalQuestions: quiz.questions.length,
        answers,
        completedAt: Date.now()
      });
    }
  };

  if (isFinished) {
    const score = answers.reduce((acc, ans, idx) => acc + (checkAnswer(ans, quiz.questions[idx]) ? 1 : 0), 0);
    const percent = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
         <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Quiz Complete!</h2>
            <div className="text-6xl font-black text-primary-600 mb-2">{percent}%</div>
            <p className="text-slate-500 mb-8">You got {score} out of {quiz.questions.length} correct</p>
            <button onClick={() => navigate('/')} className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 font-semibold">Back Home</button>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <span className="text-sm font-mono text-slate-500">Q{currentIndex + 1} / {quiz.questions.length}</span>
        <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 uppercase tracking-wide text-slate-500 font-bold">{question.type.replace('_', ' ')}</span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{question.text}</h2>

        {/* Options Area */}
        <div className="space-y-3">
          {question.type === 'mcq' && question.options?.map((opt, idx) => {
            const isSelected = answers[currentIndex] === String(idx);
            const isCorrect = String(question.correctAnswer) === String(idx);
            let className = "w-full p-4 text-left rounded-xl border-2 transition-all ";
            
            if (showFeedback) {
              if (isCorrect) className += "border-green-500 bg-green-50 dark:bg-green-900/20";
              else if (isSelected) className += "border-red-500 bg-red-50 dark:bg-red-900/20";
              else className += "border-slate-100 dark:border-slate-700 opacity-50";
            } else {
              className += "border-slate-100 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700";
            }

            return (
              <button key={idx} onClick={() => handleAnswer(String(idx))} disabled={showFeedback} className={className}>
                {opt}
              </button>
            );
          })}

          {question.type === 'true_false' && ['True', 'False'].map((opt) => {
            const isSelected = answers[currentIndex] === opt;
            const isCorrect = String(question.correctAnswer).toLowerCase() === opt.toLowerCase();
            let className = "w-full p-4 text-left rounded-xl border-2 transition-all ";

            if (showFeedback) {
                if (isCorrect) className += "border-green-500 bg-green-50 dark:bg-green-900/20";
                else if (isSelected) className += "border-red-500 bg-red-50 dark:bg-red-900/20";
                else className += "border-slate-100 dark:border-slate-700 opacity-50";
            } else {
                className += "border-slate-100 dark:border-slate-700 hover:border-primary-400";
            }
            return <button key={opt} onClick={() => handleAnswer(opt)} disabled={showFeedback} className={className}>{opt}</button>;
          })}

          {(question.type === 'short_answer' || question.type === 'fill_blank') && (
            <div className="space-y-4">
              <input 
                type="text" 
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={showFeedback}
                placeholder="Type your answer here..."
                className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
              />
              {!showFeedback && (
                <button 
                  onClick={() => handleAnswer(textAnswer)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium"
                >
                  Submit Answer
                </button>
              )}
              {showFeedback && (
                 <div className={`p-4 rounded-lg ${
                    checkAnswer(textAnswer, question) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                 }`}>
                    Your answer: {textAnswer}
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Explanation */}
        {showFeedback && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl animate-fade-in">
            <div className="flex gap-2 text-blue-700 dark:text-blue-300 font-bold mb-1">
               <AlertCircle size={20} /> Explanation
            </div>
            <p className="text-blue-800 dark:text-blue-200">{question.explanation}</p>
            {question.type !== 'mcq' && (
                <p className="text-xs mt-2 text-blue-600">Correct Answer: {question.correctAnswer}</p>
            )}
          </div>
        )}
      </div>

      {showFeedback && (
        <div className="flex justify-end">
          <button onClick={handleNext} className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg">
            {currentIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;