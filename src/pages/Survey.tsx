import React from "react";
import { questions, useSurvey } from "../hooks/useSurvey";

export default function Survey() {
  const {
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
  } = useSurvey();

  // Fix progress calculation to account for all steps including the final form
  const totalSteps = questions.length + 1; // +1 for the final comments step
  const progress = Math.min(((currentStep + 1) / totalSteps) * 100, 100);

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
                {currentStep + 1} / {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
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
                  <div className="flex flex-col space-y-2">
                    <div className="text-sm text-gray-500 mb-4">
                      1 = 全く当てはまらない、5 = かなり当てはまる
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() =>
                            handleAnswer(questions[currentStep].id, value)
                          }
                          className={`
                            relative p-4 flex flex-col items-center justify-center
                            rounded-lg border-2 transition-all duration-200
                            ${
                              answers[questions[currentStep].id] === value
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50"
                            }
                          `}
                        >
                          <span
                            className={`
                            text-2xl font-bold mb-1
                            ${
                              answers[questions[currentStep].id] === value
                                ? "text-indigo-600"
                                : "text-gray-700"
                            }
                          `}
                          >
                            {value}
                          </span>
                          <span
                            className={`
                            text-xs
                            ${
                              answers[questions[currentStep].id] === value
                                ? "text-indigo-600"
                                : "text-gray-500"
                            }
                          `}
                          >
                            {value === 1 && "全く当てはまらない"}
                            {value === 2 && "あまり当てはまらない"}
                            {value === 3 && "どちらとも言えない"}
                            {value === 4 && "やや当てはまる"}
                            {value === 5 && "かなり当てはまる"}
                          </span>
                          {answers[questions[currentStep].id] === value && (
                            <div className="absolute -top-2 -right-2 h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center">
                              <svg
                                className="h-4 w-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
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
