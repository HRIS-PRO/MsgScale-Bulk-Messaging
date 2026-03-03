
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/auth/otp');
  };

  return (
    <div className="flex min-h-screen w-full flex-row">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col bg-[#111722] overflow-hidden p-12 justify-between">
        <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAUZif4GwHFFGyO7WhT6C7Sj0t6r8FU6ZFm4HIROppLxght68wlNGc7pRR7ItnXbBQGByRbG4dIGG1B2NVkMdcSt2oVWp4uFoVA5vBaJOQJxp7srspztaSgVUJUR26gkcn1R_4WQqCNzlTCYx7vK3FYK5vZTyNKdyDVaWgMS1peAVNxzOGq7vv-QxUaN4ozjlOEOY1Jgn5C305E1uHMBQ-rMJD2eEEiOfpEln25gDokTLbmV7Trt7GO6jQvX87LXnW3Oo7T8EW1mR4q')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#101622] via-transparent to-transparent"></div>
        <div className="relative z-10 flex items-center gap-2">
           <div className="size-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center"><span className="material-symbols-outlined">hub</span></div>
           <span className="text-xl font-black text-white tracking-tight">MsgScale</span>
        </div>
        <div className="relative z-10 max-w-md space-y-4">
           <span className="material-symbols-outlined text-4xl text-primary">format_quote</span>
           <h2 className="text-4xl font-black text-white leading-tight">Scale your messaging securely across the globe.</h2>
           <p className="text-text-secondary text-lg">Trusted by 10,000+ enterprises.</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center items-center p-8 bg-background-dark">
        <div className="w-full max-w-md space-y-8 animate-[fadeIn_0.5s_ease-out]">
           <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight">Create your account</h1>
              <p className="text-text-secondary">Start managing your bulk messaging campaigns today.</p>
           </div>
           
           <div className="flex border-b border-border-dark">
              <Link to="/auth/login" className="pb-3 px-1 text-text-secondary hover:text-white transition-colors text-sm font-bold">Log In</Link>
              <button className="border-b-2 border-primary pb-3 px-8 text-primary font-bold text-sm">Create Account</button>
           </div>

           <form className="space-y-5" onSubmit={handleSignup}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Email</label>
                  <input type="email" required className="w-full bg-[#111722] border border-border-dark rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="name@company.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <input type="password" required className="w-full bg-[#111722] border border-border-dark rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
                  <input type="password" required className="w-full bg-[#111722] border border-border-dark rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20">Create Account</button>
           </form>

           <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
              By continuing, you agree to our <a href="#" className="text-primary underline">Terms of Service</a> and <a href="#" className="text-primary underline">Privacy Policy</a>.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
