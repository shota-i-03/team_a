import React from "react";
import { useNavigate } from "react-router-dom";
import { useGroupRegistration } from "../hooks/useGroupRegistration";

export default function GroupRegistration() {
  const navigate = useNavigate();
  const {
    mode,
    setMode,
    formData,
    setFormData,
    error,
    groups,
    loading,
    handleSubmit,
  } = useGroupRegistration();

  if (!mode) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                グループの選択
              </h2>
              <button
                onClick={() => navigate("/home")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ホームに戻る
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setMode("create")}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                新規グループを作成
              </button>
              <button
                onClick={() => setMode("join")}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                既存のグループに参加
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {mode === "create" ? "新規グループ作成" : "グループに参加"}
            </h2>
            <div className="space-x-4">
              <button
                onClick={() => setMode(null)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                戻る
              </button>
              <button
                onClick={() => navigate("/home")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ホームに戻る
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "create" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  グループ名
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="例: 家族グループ"
                />
              </div>
            )}

            {mode === "join" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参加するグループを選択
                </label>
                {loading ? (
                  <div className="text-center py-4">読み込み中...</div>
                ) : groups.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {groups.map((group) => (
                      <button
                        key={group.group_id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, group_id: group.group_id })
                        }
                        className={`w-full text-left p-3 rounded-md border ${
                          formData.group_id === group.group_id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-500"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {group.name}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    参加可能なグループはありません
                  </div>
                )}
              </div>
            ) : null}

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={(mode === "join" && !formData.group_id) || loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  <span>処理中...</span>
                </div>
              ) : (
                mode === "create" ? "グループを作成" : "グループに参加"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
