import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { surveyService } from "../services/surveyService";

export const questions = [
  {
    id: "q1",
    text: "大勢の人と一緒にいることでエネルギーを得る方だ",
    category: "外向性（E） vs. 内向性（I）",
  },
  {
    id: "q2",
    text: "新しい人と会うとき、すぐに打ち解けて話すことができる",
    category: "外向性（E） vs. 内向性（I）",
  },
  {
    id: "q3",
    text: "週末に友人と集まる計画を立てるのが好きだ",
    category: "外向性（E） vs. 内向性（I）",
  },
  {
    id: "q4",
    text: "物事を考えるとき、全体的なパターンや可能性に目を向ける方だ",
    category: "感覚（S） vs. 直観（N）",
  },
  {
    id: "q5",
    text: "新しいプロジェクトを始めるとき、大きなビジョンやアイデアから考える",
    category: "感覚（S） vs. 直観（N）",
  },
  {
    id: "q6",
    text: "未来の可能性や直感を重視して決断を下すことが多い",
    category: "感覚（S） vs. 直観（N）",
  },
  {
    id: "q7",
    text: "意見の対立が生じたとき、人々の感情や関係を優先する",
    category: "思考（T） vs. 感情（F）",
  },
  {
    id: "q8",
    text: "重要な決断を下す際、自分の価値観や人への影響を考慮する",
    category: "思考（T） vs. 感情（F）",
  },
  {
    id: "q9",
    text: "批判やフィードバックを受けるとき、伝え方や相手の意図に敏感だ",
    category: "思考（T） vs. 感情（F）",
  },
  {
    id: "q10",
    text: "日常生活で、状況に応じて柔軟に対応することを好む",
    category: "判断（J） vs. 知覚（P）",
  },
  {
    id: "q11",
    text: "締め切りやスケジュールが厳しいプロジェクトでも、最後まで調整を続ける",
    category: "判断（J） vs. 知覚（P）",
  },
  {
    id: "q12",
    text: "新しい情報を得たとき、情報を集め続けて選択肢を広げたいと思う",
    category: "判断（J） vs. 知覚（P）",
  },
  {
    id: "q13",
    text: "チームで作業するとき、リーダーシップを発揮して方向性を示す役割を好む",
    category: "総合",
  },
  {
    id: "q14",
    text: "問題に直面したとき、感情的な側面を考慮して対処する",
    category: "総合",
  },
  {
    id: "q15",
    text: "日常生活で、新しいことに挑戦することを楽しんでいる",
    category: "総合",
  },
  {
    id: "q16",
    text: "人間関係では話し手の役割を好む",
    category: "総合",
  },
  {
    id: "q17",
    text: "意見の対立が生じたとき、自分の意見を主張する方だ",
    category: "総合",
  },
  {
    id: "q18",
    text: "新しい環境に適応するのが得意だ",
    category: "適応性",
  },
  {
    id: "q19",
    text: "人と競争するのが好きだ",
    category: "競争心",
  },
];

export function useSurvey() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [desiredTraits, setDesiredTraits] = useState("");
  const [avoidTraits, setAvoidTraits] = useState("");
  const [idealRelationship, setIdealRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

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
      setIsLoading(true);
      setLoadingMessage("プロフィールを設定しています...");

      await Promise.all([
        surveyService.saveSurveyResponse(answers),
        surveyService.savePersonalityComment(
          {
            desired_traits: desiredTraits,
            avoid_traits: avoidTraits,
            ideal_relationship: idealRelationship,
          },
          (message) => setLoadingMessage(message)
        ),
      ]);

      navigate("/home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  return {
    currentStep,
    answers,
    desiredTraits,
    avoidTraits,
    idealRelationship,
    error,
    isLoading,
    loadingMessage,
    handleAnswer,
    handleNext,
    handleBack,
    handleSubmit,
    setDesiredTraits,
    setAvoidTraits,
    setIdealRelationship,
  };
}
