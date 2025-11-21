
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Clock, AlertCircle, Home } from 'lucide-react';
import { Question, QuizAttempt } from '../types';
import { Link } from 'react-router-dom';

interface QuizRunnerProps {
  courseId: string;
  questions: Question[];
  onComplete: (attempt: QuizAttempt) => void;
  onExit: () => void;
}

const QuizRunner: React.FC<QuizRunnerProps> = ({ courseId, questions, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const getCorrectIndex = (q: Question): number => {
      // Assuming for MCQs the correctAnswer is stored as a stringified index "0", "1" etc.
      // Or handle generic checking. Since this runner seems specific to index selection:
      return parseInt(String(q.correctAnswer), 10);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (showExplanation || isFinished) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(selectedAnswers[currentIndex + 1] !== -1); // Show if already answered (review)
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    const score = selectedAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === getCorrectIndex(questions[idx]) ? 1 : 0);
    }, 0);

    onComplete({
      courseId,
      answers: selectedAnswers,
      score,
      completedAt: Date.now()
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    const score = selectedAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === getCorrectIndex(questions[idx]) ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="mb-6 inline-flex p-4 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
             <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Quiz Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">You scored</p>
          
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 mb-8">
            {percentage}%
          </div>
          
          <p className="mb-8 text-lg font-medium text-slate-700 dark:text-slate-300">
            {score} out of {questions.length} correct
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onExit}
              className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Back to Study Guide
            </button>
            <button 
              onClick={() => {
                setIsFinished(false);
                setCurrentIndex(0);
                setSelectedAnswers(new Array(questions.length).fill(-1));
                setShowExplanation(false);
                setTimeLeft(questions.length * 60);
              }}
              className="px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
            >
              <RefreshCw size={20} />
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const currentAnswer = selectedAnswers[currentIndex];
  const correctIndex = getCorrectIndex(question);
  const isCorrect = currentAnswer === correctIndex;

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="text-slate-500 dark:text-slate-400 font-medium">
          Question {currentIndex + 1} / {questions.length}
        </div>
        <div className={`flex items-center gap-2 font-mono font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options?.map((option, idx) => {
            let stateClass = "border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700/50";
            
            if (showExplanation) {
              if (idx === correctIndex) {
                stateClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
              } else if (idx === currentAnswer) {
                stateClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
              } else {
                stateClass = "border-slate-200 dark:border-slate-700 opacity-50";
              }
            } else if (currentAnswer === idx) {
               stateClass = "border-primary-500 bg-primary-50 dark:bg-primary-900/20";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between ${stateClass}`}
              >
                <span>{option}</span>
                {showExplanation && idx === correctIndex && <CheckCircle size={20} className="text-green-500 flex-shrink-0" />}
                {showExplanation && idx === currentAnswer && idx !== correctIndex && <XCircle size={20} className="text-red-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">Explanation</p>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!showExplanation}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all
              ${showExplanation 
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 transform hover:-translate-y-0.5' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
          >
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizRunner;
