
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OtpValidation = ({ onVerify }: { onVerify: () => void }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerify();
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-dark p-6">
      <div className="w-full max-w-md space-y-8 animate-[fadeIn_0.4s_ease-out]">
        <div className="text-center space-y-4 flex flex-col items-center">
          <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-4xl">lock_open</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Verify your identity</h1>
          <p className="text-text-secondary text-sm">
            We've sent a 6-digit code to <span className="font-bold text-white">alex.morgan@company.com</span>. Please enter it below to confirm your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block text-center">Verification Code</label>
            <input 
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-transparent border border-border-dark rounded-2xl py-5 text-center text-4xl font-black tracking-[0.5em] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-800" 
              placeholder="000000"
            />
            <p className="text-center text-sm text-slate-500">
              Code expires in <span className="text-primary font-black">04:59</span>
            </p>
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2">
            Verify & Continue
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>

        <div className="pt-6 border-t border-border-dark flex flex-col items-center gap-4">
          <p className="text-sm text-slate-500">
            Didn't receive the email? <button className="text-primary font-bold hover:underline">Click to resend</button>
          </p>
          <button onClick={() => navigate('/auth/signup')} className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpValidation;
