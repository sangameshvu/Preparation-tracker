import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCw, Sparkles, HelpCircle } from 'lucide-react';
import { QuizQuestion } from '../../types/vocabulary';

interface VocabQuizProps {
  questions: QuizQuestion[];
  onFinishQuiz: (score: number, total: number) => void;
  onRetakeQuiz: () => void;
}

export const VocabQuiz: React.FC<VocabQuizProps> = ({
  questions,
  onFinishQuiz,
  onRetakeQuiz
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121826] p-8 text-center max-w-lg mx-auto shadow-sm">
        <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No Daily Session Active
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your 5 high-frequency words and 5 root words first to generate today's adaptive mini assessment.
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
      const finalScore = score + (selectedOption === currentQ.correctIndex ? 1 : 0);
      onFinishQuiz(finalScore, questions.length);
    }
  };

  if (isCompleted) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);

    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826] p-8 text-center max-w-lg mx-auto shadow-lg space-y-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/15 text-blue-600 dark:text-blue-400 mx-auto">
          <Award className="h-8 w-8" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Daily Assessment Completed!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Adaptive retention test for today's vocabulary & roots
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {finalScore} / {questions.length}
          </div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
            {percentage >= 80 ? '🌟 Outstanding Mastery!' : percentage >= 60 ? '👍 Good Progress!' : '🔄 Needs Further Review'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setCurrentIndex(0);
            setSelectedOption(null);
            setIsAnswerSubmitted(false);
            setScore(0);
            setIsCompleted(false);
            onRetakeQuiz();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <RotateCw className="h-4 w-4" />
          <span>Retake Assessment</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121826] p-6 sm:p-8 shadow-md space-y-6">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Score: {score}
        </div>
      </div>

      {/* Question Text */}
      <div>
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {currentQ.question}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.correctIndex;

          let btnStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 hover:border-slate-300';
          if (isAnswerSubmitted) {
            if (isCorrect) {
              btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
            } else if (isSelected) {
              btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold';
            } else {
              btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
            }
          } else if (isSelected) {
            btnStyle = 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold ring-2 ring-blue-500/20';
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
            >
              <span>{opt}</span>
              {isAnswerSubmitted && isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
              )}
              {isAnswerSubmitted && isSelected && !isCorrect && (
                <XCircle className="h-4 w-4 text-rose-600 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {isAnswerSubmitted && (
        <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
          <strong>Explanation:</strong> {currentQ.explanation}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end pt-2">
        {!isAnswerSubmitted ? (
          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <span>Submit Answer</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextQuestion}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
