import React, { useState } from "react";
import { useCompatibility } from "../hooks/useCompatibility";
import { CompatibilityResult } from "../types";
import { useNavigate } from "react-router-dom";
import { useCompatibilityAnimation } from "../hooks/useCompatibilityAnimation";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

// 最終更新時間を表示するコンポーネントを追加
const LastUpdatedInfo = ({ lastUpdateTime, isBackgroundUpdating }: { lastUpdateTime: Date | null, isBackgroundUpdating: boolean }) => {
  if (!lastUpdateTime) return null;

  return (
    <div className="text-xs text-gray-500 flex items-center mt-2">
      {isBackgroundUpdating && (
        <span className="inline-block mr-2">
          <div className="animate-spin h-3 w-3 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
        </span>
      )}
      最終更新: {new Date(lastUpdateTime).toLocaleString()}
      {isBackgroundUpdating && <span className="ml-1">（更新中...）</span>}
    </div>
  );
};

export const CompatibilityDiagnosis: React.FC = () => {
  const navigate = useNavigate();
  const {
    members,
    loading,
    error,
    fetchCompatibility,
    groupName,
    groupCompatibilityResult,
    groupDiagnosisLoading,
    generateGroupCompatibility,
    isBackgroundUpdating,
    lastUpdateTime
  } = useCompatibility();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [compatibilityResult, setCompatibilityResult] =
    useState<CompatibilityResult | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [showGroupResult, setShowGroupResult] = useState(false);

  const {
    showAnimation,
    countUpValue,
    getCompatibilityColor,
    getCompatibilityMessage,
    resetAnimation,
  } = useCompatibilityAnimation(compatibilityResult);

  const handleMemberClick = async (memberId: string) => {
    // Reset group result display
    setShowGroupResult(false);
    resetAnimation();

    if (selectedMember === memberId) {
      setSelectedMember(null);
      setCompatibilityResult(null);
      return;
    }
    setSelectedMember(memberId);
    setResultLoading(true);
    try {
      const result = await fetchCompatibility(memberId);
      // Parse JSON strings into objects
      if (typeof result.description === "string") {
        result.description = JSON.parse(result.description);
      }
      if (typeof result.advice === "string") {
        result.advice = JSON.parse(result.advice);
      }
      setCompatibilityResult(result);
    } catch (err) {
      console.error("相性診断の取得に失敗:", err);
    } finally {
      setResultLoading(false);
    }
  };

  const handleGroupDiagnosisClick = () => {
    setSelectedMember(null);
    setCompatibilityResult(null);
    setShowGroupResult(true);
    
    // groupCompatibilityResultがない場合のみ生成を行う
    if (!groupCompatibilityResult) {
      generateGroupCompatibility(true);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return <ErrorMessage message={error} fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{groupName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                メンバーを選択して相性を確認できます
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGroupDiagnosisClick}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                disabled={groupDiagnosisLoading}
              >
                {groupDiagnosisLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                ) : (
                  <span className="mr-2">👪</span>
                )}
                グループ全体の相性診断
              </button>
              <button
                onClick={() => navigate("/home")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                ホームへ戻る
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.user_id}
                className={`bg-white rounded-lg shadow-sm p-6 transition-all ${
                  selectedMember === member.user_id
                    ? "ring-2 ring-indigo-500"
                    : "hover:shadow-md"
                }`}
              >
                <div className="flex flex-col space-y-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {member.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => handleMemberClick(member.user_id)}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedMember === member.user_id
                        ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {selectedMember === member.user_id ? (
                      "選択を解除"
                    ) : (
                      <>
                        <span className="mr-2">👥</span>
                        この人との相性を見る
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* グループ全体の相性診断結果表示 */}
          {showGroupResult && (
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">👪</span>
                グループ全体の相性診断結果
                <LastUpdatedInfo
                  lastUpdateTime={lastUpdateTime}
                  isBackgroundUpdating={isBackgroundUpdating}
                />
              </h2>

              {groupDiagnosisLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : groupCompatibilityResult ? (
                <div className="space-y-8">
                  {/* 概要セクション */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:justify-between relative z-10">
                      {/* 平均相性スコア */}
                      <div className="text-center px-6 py-4">
                        <div className="text-lg text-gray-600 font-medium mb-2">グループ平均</div>
                        <div
                          className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getCompatibilityColor(
                            groupCompatibilityResult.average_degree
                          )}`}
                        >
                          {groupCompatibilityResult.average_degree}%
                        </div>
                        <div className="mt-2 text-gray-500">相性スコア</div>
                      </div>

                      {/* ベストペア */}
                      <div className="text-center border-t md:border-t-0 md:border-l border-gray-200 px-6 py-4">
                        <div className="text-lg text-gray-600 font-medium mb-2">
                          最も相性の良いペア
                        </div>
                        <div className="text-emerald-600 font-bold text-2xl">
                          {groupCompatibilityResult.best_pair.degree}%
                        </div>
                        <div className="mt-1 text-sm text-gray-800">
                          {groupCompatibilityResult.best_pair.names[0]}
                          <span className="mx-2">と</span>
                          {groupCompatibilityResult.best_pair.names[1]}
                        </div>
                      </div>

                      {/* ワーストペア */}
                      <div className="text-center border-t md:border-t-0 md:border-l border-gray-200 px-6 py-4">
                        <div className="text-lg text-gray-600 font-medium mb-2">
                          改善が必要なペア
                        </div>
                        <div className="text-rose-600 font-bold text-2xl">
                          {groupCompatibilityResult.worst_pair.degree}%
                        </div>
                        <div className="mt-1 text-sm text-gray-800">
                          {groupCompatibilityResult.worst_pair.names[0]}
                          <span className="mx-2">と</span>
                          {groupCompatibilityResult.worst_pair.names[1]}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 分析セクション */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 全体評価 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-indigo-400 hover:shadow-md transition-shadow col-span-full">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">🔍</span>
                        全体評価
                      </h3>
                      <div className="prose prose-indigo max-w-none">
                        {groupCompatibilityResult.analysis.overall_assessment}
                      </div>
                    </div>

                    {/* グループの強み */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-emerald-400 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">✨</span>
                        グループの強み
                      </h3>
                      <div className="prose prose-emerald max-w-none">
                        {groupCompatibilityResult.analysis.group_strengths}
                      </div>
                    </div>

                    {/* グループの課題 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-amber-400 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">💭</span>
                        グループの課題
                      </h3>
                      <div className="prose prose-amber max-w-none">
                        {groupCompatibilityResult.analysis.group_challenges}
                      </div>
                    </div>

                    {/* 関係性ダイナミクス */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-violet-400 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">🔄</span>
                        関係性ダイナミクス
                      </h3>
                      <div className="prose prose-violet max-w-none">
                        {groupCompatibilityResult.analysis.relationship_dynamics}
                      </div>
                    </div>

                    {/* 成長機会 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-sky-400 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">🌱</span>
                        成長機会
                      </h3>
                      <div className="prose prose-sky max-w-none">
                        {groupCompatibilityResult.analysis.growth_opportunities}
                      </div>
                    </div>
                  </div>

                  {/* アドバイスセクション */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">💌</span>
                      グループへのアドバイス
                    </h3>
                    <div className="prose prose-purple max-w-none space-y-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        {groupCompatibilityResult.analysis.action_plan}
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <span className="mr-2">📝</span>
                          推奨ステップ
                        </h4>
                        <ul className="list-none space-y-2">
                          {groupCompatibilityResult.analysis.recommendations.map((step, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-purple-500 font-medium">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-lg">
                    グループ相性診断結果を準備中です
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    「診断開始」ボタンをクリックして詳細な相性診断を行ってください。
                  </p>
                  <button
                    onClick={() => generateGroupCompatibility(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    disabled={groupDiagnosisLoading}
                  >
                    {groupDiagnosisLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                        <span>診断中...</span>
                      </div>
                    ) : (
                      "診断開始"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedMember && (
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                相性診断結果
              </h2>
              {resultLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : compatibilityResult ? (
                <div className="space-y-6">
                  {/* スコアセクション */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 shadow-sm text-center relative overflow-hidden">
                    <div className="flex flex-col items-center justify-center relative z-10">
                      <div
                        className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getCompatibilityColor(
                          compatibilityResult.degree
                        )} transition-colors duration-300 mb-2 flex items-center justify-center`}
                      >
                        <span>{countUpValue}</span>
                        <span className="ml-1">%</span>
                      </div>
                      <div className="text-lg text-gray-600 font-medium">
                        相性スコア
                      </div>
                      <div
                        className={`mt-2 px-4 py-1 rounded-full text-sm font-medium ${
                          compatibilityResult.degree >= 60
                            ? "bg-emerald-100 text-emerald-800"
                            : compatibilityResult.degree >= 40
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {getCompatibilityMessage(compatibilityResult.degree)}
                      </div>
                    </div>
                    {/* アニメーションエフェクト */}
                    {showAnimation && (
                      <>
                        {/* 高相性（80%以上）の場合の派手なアニメーション */}
                        {compatibilityResult.degree >= 80 && (
                          <>
                            <div className="absolute inset-0 animate-pulse-slow bg-gradient-to-r from-emerald-200/30 to-emerald-300/30" />
                            <div className="absolute -inset-1 animate-spin-slow origin-center">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full absolute top-0 left-1/2" />
                              <div className="w-2 h-2 bg-emerald-400 rounded-full absolute top-1/2 right-0" />
                              <div className="w-2 h-2 bg-emerald-400 rounded-full absolute bottom-0 left-1/2" />
                              <div className="w-2 h-2 bg-emerald-400 rounded-full absolute top-1/2 left-0" />
                            </div>
                          </>
                        )}
                        {/* 良い相性（60-79%）の場合のアニメーション */}
                        {compatibilityResult.degree >= 60 &&
                          compatibilityResult.degree < 80 && (
                            <div className="absolute inset-0 animate-pulse-slow bg-gradient-to-r from-indigo-200/30 to-purple-300/30" />
                          )}
                        {/* 普通の相性（40-59%）の場合のアニメーション */}
                        {compatibilityResult.degree >= 40 &&
                          compatibilityResult.degree < 60 && (
                            <div className="absolute inset-0 animate-pulse-slow bg-gradient-to-r from-amber-200/30 to-amber-300/30" />
                          )}
                        {/* 低相性（40%未満）の場合のアニメーション */}
                        {compatibilityResult.degree < 40 && (
                          <div className="absolute inset-0 animate-pulse-slow bg-gradient-to-r from-rose-200/30 to-rose-300/30" />
                        )}
                      </>
                    )}
                  </div>

                  {/* 診断内容セクション */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 診断理由 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-indigo-400 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">🔍</span>
                        診断理由
                      </h3>
                      <div className="prose prose-indigo max-w-none">
                        {typeof compatibilityResult?.description === "string"
                          ? JSON.parse(compatibilityResult.description)
                              .diagnosis_reasons
                          : compatibilityResult?.description
                              ?.diagnosis_reasons ||
                            "診断理由は設定されていません"}
                      </div>
                    </div>

                    {/* 長所 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-emerald-400 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">✨</span>
                        長所
                      </h3>
                      <div className="prose prose-emerald max-w-none">
                        {typeof compatibilityResult?.description === "string"
                          ? JSON.parse(compatibilityResult.description)
                              .strengths
                          : compatibilityResult?.description?.strengths ||
                            "長所は設定されていません"}
                      </div>
                    </div>

                    {/* 短所 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-amber-400 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">💭</span>
                        改善ポイント
                      </h3>
                      <div className="prose prose-amber max-w-none">
                        {typeof compatibilityResult?.description === "string"
                          ? JSON.parse(compatibilityResult.description)
                              .weaknesses
                          : compatibilityResult?.description?.weaknesses ||
                            "改善ポイントは設定されていません"}
                      </div>
                    </div>

                    {/* ネガティブな視点 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-rose-400 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">⚠️</span>
                        注意点
                      </h3>
                      <div className="prose prose-rose max-w-none">
                        {typeof compatibilityResult?.description === "string"
                          ? JSON.parse(compatibilityResult.description)
                              .negative_perspectives
                          : compatibilityResult?.description
                              ?.negative_perspectives ||
                            "注意点は設定されていません"}
                      </div>
                    </div>

                    {/* ポジティブな視点 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-sky-400 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">🌱</span>
                        成長の機会
                      </h3>
                      <div className="prose prose-sky max-w-none">
                        {typeof compatibilityResult?.description === "string"
                          ? JSON.parse(compatibilityResult.description)
                              .positive_perspectives
                          : compatibilityResult?.description
                              ?.positive_perspectives ||
                            "成長の機会は設定されていません"}
                      </div>
                    </div>
                  </div>

                  {/* アドバイスセクション */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">💌</span>
                      アドバイス
                    </h3>
                    <div className="prose prose-purple max-w-none space-y-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        {typeof compatibilityResult?.advice === "string"
                          ? JSON.parse(compatibilityResult.advice).action_plan
                          : compatibilityResult?.advice?.action_plan ||
                            "アクションプランは設定されていません"}
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <span className="mr-2">📝</span>
                          具体的なステップ
                        </h4>
                        <ul className="list-none space-y-2">
                          {(typeof compatibilityResult?.advice === "string"
                            ? JSON.parse(compatibilityResult.advice).steps
                            : compatibilityResult?.advice?.steps
                          )?.map((step: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <span className="text-purple-500 font-medium">
                                {index + 1}.
                              </span>
                              <span>{step}</span>
                            </li>
                          )) || (
                            <li className="text-gray-500 italic">
                              具体的なステップは設定されていません
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-lg">
                    相性診断結果を取得できませんでした。
                  </p>
                  <p className="text-sm text-gray-400">
                    別のメンバーを選択してください。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};