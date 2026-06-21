import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isComplete = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={label} className="flex-1 flex items-center">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold border-2 transition ${
                  isComplete
                    ? 'bg-brand-700 border-brand-700 text-white'
                    : isActive
                    ? 'border-brand-700 text-brand-700 bg-white'
                    : 'border-surface-200 text-slate-400 bg-white'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={`text-xs font-medium text-center hidden sm:block ${
                  isActive ? 'text-brand-700' : isComplete ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {stepNum !== steps.length && (
              <div className={`h-0.5 flex-1 mx-1 ${isComplete ? 'bg-brand-700' : 'bg-surface-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
