import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { surveyService } from "../services/surveyService";

export const questions = [
  {
    id: "q1",
    text: "大勢の人と一緒にいることでエネルギーを得る方ですか、それとも一人で静かに過ごすことでリフレッシュしますか？",
    category: "外向性（E） vs. 内向性（I）",
  },
  // ... 他の質問は同じ ...
];

export function useSurvey() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [desiredTraits, setDesiredTraits] = useState("");
  const [avoidTraits, setAvoidTraits] = useState("");
  const [idealRelationship, setIdealRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await Promise.all([
        surveyService.saveSurveyResponse(answers),
        surveyService.savePersonalityComment({
          desired_traits: desiredTraits,
          avoid_traits: avoidTraits,
          ideal_relationship: idealRelationship,
        }),
      ]);
      navigate("/group-registration");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました"
      );
    }
  };

  return {
    currentStep,
    answers,
    desiredTraits,
    avoidTraits,
    idealRelationship,
    error,
    handleAnswer,
    handleNext,
    handleBack,
    handleSubmit,
    setDesiredTraits,
    setAvoidTraits,
    setIdealRelationship,
  };
}
