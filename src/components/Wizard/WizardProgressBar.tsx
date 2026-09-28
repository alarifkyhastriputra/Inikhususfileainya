import React from 'react';
import { Check } from 'lucide-react';

interface WizardProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick: (stepIndex: number) => void;
}

export const WizardProgressBar: React.FC<WizardProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick,
}) => {
  const percent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full bg-[#111827] border-b border-slate-800 px-4 py-3 sticky top-[61px] z-30 shadow-md">
      <div className="max-w-6xl mx-auto space-y-2">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full">
              Langkah {currentStep} dari {totalSteps}
            </span>
            <span className="font-semibold text-slate-200 hidden sm:inline">
              {stepTitles[currentStep - 1]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">{percent}% Selesai</span>
            <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Step Dots / Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onStepClick(stepNum)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0 transition font-medium ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : isCompleted
                    ? 'bg-[#1e293b] text-indigo-300 hover:bg-slate-800'
                    : 'bg-[#111827] text-slate-500 hover:text-slate-300 hover:bg-[#1e293b]/50 border border-slate-800'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-white text-indigo-700' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : stepNum}
                </span>
                <span className="whitespace-nowrap">{title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
