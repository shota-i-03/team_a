import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, User } from "../services/authService";

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authService.checkAuth();
      if (session?.user) {
        setUser(session.user as unknown as User);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("認証確認エラー:", err);
      setError("認証の確認に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      console.error("ログインエラー:", err);
      setError("ログインに失敗しました。");
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("ログアウトエラー:", err);
      setError("ログアウトに失敗しました。");
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    checkAuth,
  };
}
