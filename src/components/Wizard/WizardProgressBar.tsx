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
    <div className="w-full bg-black/95 backdrop-blur border-b border-zinc-800 px-4 py-3 sticky top-[57px] z-30 shadow-md font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-2">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white bg-zinc-900 border border-zinc-700 px-2.5 py-0.5 rounded-full">
              Langkah {currentStep} dari {totalSteps}
            </span>
            <span className="font-semibold text-zinc-200 hidden sm:inline">
              {stepTitles[currentStep - 1]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">{percent}% Selesai</span>
            <div className="w-24 sm:w-36 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-white transition-all duration-300"
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0 transition font-medium cursor-pointer ${
                  isCurrent
                    ? 'bg-white text-black font-bold shadow-sm'
                    : isCompleted
                    ? 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                    : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-zinc-900'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isCompleted 
                      ? 'bg-zinc-800 text-white' 
                      : isCurrent 
                      ? 'bg-black text-white font-bold' 
                      : 'bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : stepNum}
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
