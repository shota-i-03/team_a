import React from "react";

interface EnhancedLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  fullScreen?: boolean;
  message?: string;
  progress?: number;
  steps?: string[];
  currentStep?: number;
}

export const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({
  size = "md",
  color = "indigo",
  fullScreen = false,
  message,
  progress = 0,
  steps = [],
  currentStep = 0,
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const colorClasses = {
    indigo: "border-indigo-600",
    blue: "border-blue-600",
    green: "border-green-600",
  };

  const getStepColor = (index: number) => {
    if (index < currentStep) return "text-green-600"; // 完了したステップ
    if (index === currentStep) return "text-indigo-600 font-medium"; // 現在のステップ
    return "text-gray-400"; // これからのステップ
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${
          colorClasses[color as keyof typeof colorClasses]
        }`}
      />
      
      {message && <p className="mt-4 text-gray-700 text-sm font-medium">{message}</p>}
      
      {/* 進捗バー */}
      {progress > 0 && (
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">進捗状況</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* 処理ステップ表示 */}
      {steps.length > 0 && (
        <div className="w-full max-w-md mt-6">
          <ul className="space-y-2">
            {steps.map((step, index) => (
              <li 
                key={index} 
                className={`flex items-center space-x-2 ${getStepColor(index)}`}
              >
                {index < currentStep ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : index === currentStep ? (
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-300" />
                )}
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};
