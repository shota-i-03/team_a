import React from 'react';
import { supabase } from '../lib/supabase';
import { Users } from 'lucide-react';

export function Register() {
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error signing in with Google:', err);
      alert(err instanceof Error ? err.message : 'An error occurred during sign in');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="text-center mb-8">
          <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900">Welcome to Compatibility Diagnosis</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to start exploring personality matches</p>
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-5 h-5"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}