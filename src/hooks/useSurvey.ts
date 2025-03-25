import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { surveyService } from "../services/surveyService";

export const questions = [
  {
    id: "q1",
    text: "大勢の人と一緒にいることでエネルギーを得る方ですか、それとも一人で静かに過ごすことでリフレッシュしますか？",
    category: "外向性（E） vs. 内向性（I）",
  },
  {
    id: "q2",
    text: "新しい人と会うとき、すぐに打ち解けて話すことができますか、それとも少し時間をかけて慣れるタイプですか？",
    category: "外向性（E） vs. 内向性（I）",
  },
  {
    id: "q3",
    text: "週末に友人と集まる計画を立てるのが好きですか、それとも家でゆっくり過ごすことを好みますか？",
    category: "外向性（E） vs. 内向性（I）",
  },
  {
    id: "q4",
    text: "物事を考えるとき、具体的な事実や詳細に注目しますか、それとも全体的なパターンや可能性に目を向けますか？",
    category: "感覚（S） vs. 直観（N）",
  },
  {
    id: "q5",
    text: "新しいプロジェクトを始めるとき、まず具体的な手順や計画を立てますか、それとも大きなビジョンやアイデアから始めますか？",
    category: "感覚（S） vs. 直観（N）",
  },
  {
    id: "q6",
    text: "過去の経験や実績に基づいて決断を下すことが多いですか、それとも未来の可能性や直感を重視しますか？",
    category: "感覚（S） vs. 直観（N）",
  },
  {
    id: "q7",
    text: "意見の対立が生じたとき、論理的な根拠を重視して解決しようとしますか、それとも人々の感情や関係を優先しますか？",
    category: "思考（T） vs. 感情（F）",
  },
  {
    id: "q8",
    text: "重要な決断を下す際、客観的なデータや事実を基にしますか、それとも自分の価値観や人への影響を考慮しますか？",
    category: "思考（T） vs. 感情（F）",
  },
  {
    id: "q9",
    text: "批判やフィードバックを受けるとき、内容の正確さや論理性を重視しますか、それとも伝え方や相手の意図に敏感ですか？",
    category: "思考（T） vs. 感情（F）",
  },
  {
    id: "q10",
    text: "日常生活で、計画を立てて物事を進めることを好みますか、それとも状況に応じて柔軟に対応することを好みますか？",
    category: "判断（J） vs. 知覚（P）",
  },
  {
    id: "q11",
    text: "締め切りやスケジュールが厳しいプロジェクトでは、早めに終わらせることを目指しますか、それとも最後の瞬間まで調整を続けますか？",
    category: "判断（J） vs. 知覚（P）",
  },
  {
    id: "q12",
    text: "新しい情報を得たとき、すぐに結論を出して行動に移りたいと思いますか、それとも情報を集め続けて選択肢を広げたいと思いますか？",
    category: "判断（J） vs. 知覚（P）",
  },
  {
    id: "q13",
    text: "チームで作業するとき、リーダーシップを発揮して方向性を示す役割を好みますか、それともサポート役として裏方で働くことを好みますか？",
    category: "総合",
  },
  {
    id: "q14",
    text: "問題に直面したとき、まず論理的に分析して解決策を見つけますか、それとも感情的な側面を考慮して対処しますか？",
    category: "総合",
  },
  {
    id: "q15",
    text: "日常生活で、ルーチンや習慣を守ることが多いですか、それとも新しいことに挑戦することを楽しんでいますか？",
    category: "総合",
  },
  {
    id: "q16",
    text: "人間関係で聞き手と話し手のどちらの役割を好みますか？",
    category: "総合",
  },
  {
    id: "q17",
    text: "意見の対立が生じたとき、どのように対処しますか？（例: 話し合い、妥協、避ける）",
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
      navigate("/groups");
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
