export const ProgressSteps = ({
  steps,
  currentStep,
  onStepChange
}: {
  steps: string[];
  currentStep: number;
  onStepChange?: (stepIndex: number) => void;
}) => (
  <div className="flex flex-wrap gap-3">
    {steps.map((step, index) => {
      const active = index <= currentStep;
      return (
        <button key={step} type="button" onClick={() => onStepChange?.(index)} className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${active ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'glass-panel text-slate-500 dark:text-slate-300'}`}>
            {index + 1}
          </div>
          <span className={`text-sm ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{step}</span>
        </button>
      );
    })}
  </div>
);
