import React from "react";
import { useProfile } from "../hooks/useProfile";

export function ProfileSetup() {
  const { formData, setFormData, error, handleSubmit } = useProfile();

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          プロフィール登録
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              名前
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              血液型
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.blood_type}
              onChange={(e) =>
                setFormData({ ...formData, blood_type: e.target.value })
              }
            >
              <option value="">選択してください</option>
              <option value="A">A型</option>
              <option value="B">B型</option>
              <option value="O">O型</option>
              <option value="AB">AB型</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              生年月日
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.birthdate}
              onChange={(e) =>
                setFormData({ ...formData, birthdate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              干支
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.zodiac}
              onChange={(e) =>
                setFormData({ ...formData, zodiac: e.target.value })
              }
            >
              <option value="">選択してください</option>
              <option value="子">子（ね）</option>
              <option value="丑">丑（うし）</option>
              <option value="寅">寅（とら）</option>
              <option value="卯">卯（う）</option>
              <option value="辰">辰（たつ）</option>
              <option value="巳">巳（み）</option>
              <option value="午">午（うま）</option>
              <option value="未">未（ひつじ）</option>
              <option value="申">申（さる）</option>
              <option value="酉">酉（とり）</option>
              <option value="戌">戌（いぬ）</option>
              <option value="亥">亥（い）</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              MBTI（任意）
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.mbti}
              onChange={(e) =>
                setFormData({ ...formData, mbti: e.target.value })
              }
              placeholder="例: INTJ"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            次へ
          </button>
        </form>
      </div>
    </div>
  );
}
