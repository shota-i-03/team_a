import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const questions = [
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
    text: "感情をオープンに表現しますか、それとも内に秘めることが多いですか？",
    category: "総合",
  },
  { id: "q19", text: "新しい環境に適応するのが得意だ", category: "適応性" },
  { id: "q20", text: "人と競争するのが好きだ", category: "競争心" },
];

export default function Survey() {
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("認証されていません");

      // アンケート回答を保存
      const { error: surveyError } = await supabase
        .from("survey_responses")
        .upsert({
          id: user.id,
          user_id: user.id,
          responses: answers,
        });

      if (surveyError) throw surveyError;

      // 性格コメントを保存
      const { error: commentError } = await supabase
        .from("personality_comments")
        .upsert({
          id: user.id,
          user_id: user.id,
          desired_traits: desiredTraits,
          avoid_traits: avoidTraits,
          ideal_relationship: idealRelationship,
        });

      if (commentError) throw commentError;

      navigate("/groups");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました"
      );
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                進捗状況
              </span>
              <span className="text-sm font-medium text-gray-700">
                {currentStep + 1} / {questions.length + 1}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {currentStep < questions.length ? (
              <>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {questions[currentStep].text}
                  </h3>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label
                        key={value}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="radio"
                          name={`question-${questions[currentStep].id}`}
                          value={value}
                          checked={answers[questions[currentStep].id] === value}
                          onChange={() =>
                            handleAnswer(questions[currentStep].id, value)
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!answers[questions[currentStep].id]}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  補足コメント
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    パートナーや友人に求める最も重要な特性は？
                  </label>
                  <textarea
                    value={desiredTraits}
                    onChange={(e) => setDesiredTraits(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    人間関係で避けたい特性は？
                  </label>
                  <textarea
                    value={avoidTraits}
                    onChange={(e) => setAvoidTraits(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    理想の関係性とは？
                  </label>
                  <textarea
                    value={idealRelationship}
                    onChange={(e) => setIdealRelationship(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !desiredTraits || !avoidTraits || !idealRelationship
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    送信
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
