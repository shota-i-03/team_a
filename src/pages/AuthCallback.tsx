import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      try {
        // URLフラグメント内のアクセストークンをSupabaseが処理できるようにする
        // ハッシュフラグメントが存在する場合、Supabaseはこれを自動的に処理する
        console.log("認証コールバック処理中...");
        
        // セッションの取得を待つ
        let retryCount = 0;
        const maxRetries = 5;
        let session = null;

        while (retryCount < maxRetries) {
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();
          if (currentSession) {
            session = currentSession;
            break;
          }
          // 1秒待って再試行
          await new Promise((resolve) => setTimeout(resolve, 1000));
          retryCount++;
        }

        if (!session) {
          console.error("セッションの取得に失敗しました");
          navigate("/register");
          return;
        }

        // プロフィール情報を取得
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error || !profile) {
          // プロフィールが存在しない場合は設定ページへ
          navigate("/profile-setup");
        } else {
          // プロフィールが存在する場合、アンケート回答状況を確認
          const { data: surveyResponse, error: surveyError } = await supabase
            .from("survey_responses")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (surveyError) {
            console.error("Survey response check failed:", surveyError);
          }

          if (!surveyResponse) {
            // アンケートに回答していない場合はアンケートページへ
            navigate("/survey");
          } else {
            // アンケートに回答済みの場合はホームへ
            navigate("/home");
          }
        }
      } catch (error) {
        console.error("認証コールバックエラー:", error);
        navigate("/register");
      }
    };

    checkProfileAndRedirect();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">ログイン処理中...</p>
      </div>
    </div>
  );
}
