import React from "react";

interface ErrorMessageProps {
  message: string;
  fullScreen?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  fullScreen = false,
}) => {
  const errorContent = (
    <div className="text-red-600">
      <p className="font-medium">エラーが発生しました</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {errorContent}
      </div>
    );
  }

  return errorContent;
};
