import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/");
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
    };

    checkProfileAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
