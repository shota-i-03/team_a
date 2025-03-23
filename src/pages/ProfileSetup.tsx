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
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.mbti || ""}
              onChange={(e) =>
                setFormData({ ...formData, mbti: e.target.value })
              }
            >
              <option value="">選択してください</option>
              <option value="INTJ">INTJ - 建築家 (Architect)</option>
              <option value="INTP">INTP - 論理学者 (Logician)</option>
              <option value="ENTJ">ENTJ - 指揮官 (Commander)</option>
              <option value="ENTP">ENTP - 討論者 (Debater)</option>
              <option value="INFJ">INFJ - 提唱者 (Advocate)</option>
              <option value="INFP">INFP - 仲介者 (Mediator)</option>
              <option value="ENFJ">ENFJ - 主人公 (Protagonist)</option>
              <option value="ENFP">ENFP - 広報活動家 (Campaigner)</option>
              <option value="ISTJ">ISTJ - 管理者 (Logistician)</option>
              <option value="ISFJ">ISFJ - 擁護者 (Defender)</option>
              <option value="ESTJ">ESTJ - 幹部 (Executive)</option>
              <option value="ESFJ">ESFJ - 領事 (Consul)</option>
              <option value="ISTP">ISTP - 巨匠 (Virtuoso)</option>
              <option value="ISFP">ISFP - 冒険家 (Adventurer)</option>
              <option value="ESTP">ESTP - 起業家 (Entrepreneur)</option>
              <option value="ESFP">ESFP - エンターテイナー (Entertainer)</option>
            </select>
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
