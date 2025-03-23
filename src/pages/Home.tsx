import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Group {
  group_id: string;
  name: string;
  created_at: string;
  member_count: number;
}

interface MemberGroup {
  group_id: string;
  groups: {
    name: string;
    created_at: string;
  };
}

interface Profile {
  email: string;
  name: string;
  avatar_url?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    checkAuthAndFetchGroups();
  }, []);

  const checkAuthAndFetchGroups = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      // プロフィール情報を取得
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("プロフィール取得エラー:", profileError);
        setProfile({
          email: user.email || "",
          name: user.email?.split("@")[0] || "",
        });
      } else {
        setProfile({
          email: user.email || "",
          name: profileData.name,
        });
      }

      await fetchGroups();
    } catch (error) {
      console.error("認証エラー:", error);
      navigate("/");
    }
  };

  const fetchGroups = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // ユーザーが所属するグループを取得
      const { data: memberGroups, error: memberError } = await supabase
        .from("group_members")
        .select(
          `
          group_id,
          groups:group_id (
            name,
            created_at
          )
        `
        )
        .eq("user_id", user.id);

      if (memberError) {
        console.error("グループ取得エラー:", memberError);
        throw memberError;
      }

      if (!memberGroups) {
        console.error("グループデータが取得できませんでした");
        setError("グループデータが取得できませんでした");
        return;
      }

      // 各グループのメンバー数を取得
      const groupsWithCount = await Promise.all(
        (memberGroups as unknown as MemberGroup[]).map(async (mg) => {
          const { count, error: countError } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", mg.group_id);

          if (countError) {
            console.error("メンバー数取得エラー:", countError);
            return {
              group_id: mg.group_id,
              name: mg.groups.name,
              created_at: mg.groups.created_at,
              member_count: 0,
            };
          }

          return {
            group_id: mg.group_id,
            name: mg.groups.name,
            created_at: mg.groups.created_at,
            member_count: count || 0,
          };
        })
      );

      setGroups(groupsWithCount);
    } catch (error) {
      console.error("グループ取得エラー:", error);
      setError(
        `グループ一覧の取得に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("ログアウトエラー:", error);
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
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* プロフィールセクション */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {profile?.name}
              </h3>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => navigate("/groups")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              グループを作成・参加する
            </button>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">マイグループ</h2>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ログアウト
            </button>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {groups.length === 0 ? (
                <li className="px-4 py-4 sm:px-6">
                  <div className="text-center text-gray-500">
                    グループはありません
                  </div>
                </li>
              ) : (
                groups.map((group) => (
                  <li key={group.group_id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-indigo-600">
                          {group.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          メンバー数: {group.member_count}名
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/compatibility/${group.group_id}`)
                        }
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        相性診断を見る
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
