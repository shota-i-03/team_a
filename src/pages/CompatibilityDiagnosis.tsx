import React, { useState } from "react";
import { useCompatibility } from "../hooks/useCompatibility";
import { CompatibilityResult } from "../types";
import { useNavigate } from "react-router-dom";

export const CompatibilityDiagnosis: React.FC = () => {
  const navigate = useNavigate();
  const { members, loading, error, fetchCompatibility } = useCompatibility();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [compatibilityResult, setCompatibilityResult] =
    useState<CompatibilityResult | null>(null);
  const [resultLoading, setResultLoading] = useState(false);

  const handleMemberClick = async (memberId: string) => {
    setSelectedMember(memberId);
    setResultLoading(true);
    try {
      const result = await fetchCompatibility(memberId);
      setCompatibilityResult(result);
    } catch (err) {
      console.error("相性診断の取得に失敗:", err);
    } finally {
      setResultLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">相性診断</h1>
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              ホームへ戻る
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.user_id}
                className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all ${
                  selectedMember === member.user_id
                    ? "ring-2 ring-indigo-500"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleMemberClick(member.user_id)}
              >
                <div className="flex items-center">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {member.name}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-indigo-600">
                      {compatibilityResult.degree}%
                    </div>
                    <div className="text-sm text-gray-500">相性スコア</div>
                  </div>
                  <div className="prose max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: compatibilityResult.description,
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      アドバイス
                    </h3>
                    <p className="text-gray-600">
                      {compatibilityResult.advice}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  相性診断結果を取得できませんでした。
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
