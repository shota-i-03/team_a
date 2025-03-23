import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "../services/profileService";

export function useProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    blood_type: "",
    birthdate: "",
    zodiac: "",
    mbti: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profileService.upsertProfile(formData);
      navigate("/survey");
    } catch (err) {
      console.error("プロフィール保存エラー:", err);
      setError("プロフィールの保存に失敗しました。もう一度お試しください。");
    }
  };

  return {
    formData,
    setFormData,
    error,
    handleSubmit,
  };
}
