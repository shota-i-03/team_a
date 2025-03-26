import { useState, useEffect } from "react";
import { CompatibilityResult } from "../types";

interface UseCompatibilityAnimationReturn {
  showAnimation: boolean;
  countUpValue: number;
  getCompatibilityColor: (degree: number) => string;
  getCompatibilityMessage: (degree: number) => string;
  resetAnimation: () => void;
}

export const useCompatibilityAnimation = (
  compatibilityResult: CompatibilityResult | null
): UseCompatibilityAnimationReturn => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [countUpValue, setCountUpValue] = useState(0);

  // カウントアップアニメーション
  useEffect(() => {
    if (!compatibilityResult) {
      setCountUpValue(0);
      return;
    }

    const targetValue = compatibilityResult.degree;
    const duration = 1000; // 1秒
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      setCountUpValue(Math.floor(progress * targetValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCountUpValue(targetValue);
        setShowAnimation(true);
      }
    };

    window.requestAnimationFrame(step);

    return () => {
      startTimestamp = null;
    };
  }, [compatibilityResult]);

  // 相性度に応じた色を返す関数
  const getCompatibilityColor = (degree: number): string => {
    if (degree >= 80) return "from-emerald-600 to-emerald-500";
    if (degree >= 60) return "from-indigo-600 to-purple-600";
    if (degree >= 40) return "from-amber-600 to-amber-500";
    return "from-rose-600 to-rose-500";
  };

  // 相性度に応じたメッセージを返す関数
  const getCompatibilityMessage = (degree: number): string => {
    if (degree >= 80) return "とても相性が良い！";
    if (degree >= 60) return "相性が良い";
    if (degree >= 40) return "普通の相性";
    return "要注意";
  };

  // アニメーションをリセットする関数
  const resetAnimation = () => {
    setShowAnimation(false);
    setCountUpValue(0);
  };

  return {
    showAnimation,
    countUpValue,
    getCompatibilityColor,
    getCompatibilityMessage,
    resetAnimation,
  };
};
