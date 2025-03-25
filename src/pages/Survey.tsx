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
