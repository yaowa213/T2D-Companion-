import React from 'react';
import { useNavigate } from 'react-router-dom';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white flex flex-col px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white/20 rounded-3xl mb-8 flex items-center justify-center backdrop-blur-md shadow-xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold mb-4">T2D Companion</h1>
        <p className="text-xl text-blue-100 mb-8 max-w-xs">
          Your privacy-first partner for managing Type 2 Diabetes.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white text-blue-600 font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all min-h-[56px]"
        >
          Get Started
        </button>
        <p className="text-center text-blue-200 text-sm">
          Secure • Offline-ready • Compassionate
        </p>
      </div>
    </div>
  );
};
