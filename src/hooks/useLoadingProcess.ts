import { useState, useEffect } from "react";

interface LoadingProcessOptions {
  steps: string[];
  durationPerStep?: number;
  onComplete?: () => void;
}

export const useLoadingProcess = ({
  steps,
  durationPerStep = 1200,
  onComplete
}: LoadingProcessOptions) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (steps.length === 0) return;

    setStartTime(Date.now());
    setStepStartTime(Date.now());

    const animateStep = (timestamp: number) => {
      if (!stepStartTime) return;
      
      const elapsedTime = timestamp - stepStartTime;
      const stepProgress = Math.min(elapsedTime / durationPerStep, 1);
      
      const overallProgress = ((currentStep + stepProgress) / steps.length) * 100;
      setProgress(overallProgress);

      if (stepProgress < 1) {
        requestAnimationFrame(animateStep);
      } else if (currentStep < steps.length - 1) {
        // 次のステップへ
        setCurrentStep(prev => prev + 1);
        setStepStartTime(Date.now());
        requestAnimationFrame(animateStep);
      } else {
        // 全ステップ完了
        setIsCompleted(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    const animationId = requestAnimationFrame(animateStep);
    return () => cancelAnimationFrame(animationId);
  }, [currentStep, steps.length, durationPerStep, stepStartTime, onComplete]);

  const reset = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsCompleted(false);
    setStartTime(null);
    setStepStartTime(null);
  };

  return {
    currentStep,
    progress,
    isCompleted,
    reset,
    currentStepName: steps[currentStep] || "",
  };
};
