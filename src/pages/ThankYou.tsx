import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/register");
    }, 3000); // 3秒後に登録ページにリダイレクト

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ご利用ありがとうございました
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          アカウントの削除が完了しました
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          3秒後に登録ページに移動します
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
