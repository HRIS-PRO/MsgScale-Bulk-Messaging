
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../RoleContext';

const Login = () => {
   const navigate = useNavigate();
   const { login, isLoading, error: authError } = useRole();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState<string | null>(null);

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
         await login(email, password);
         navigate('/auth/workspaces');
      } catch (err: any) {
         setError(err.message || 'Invalid email or password');
      }
   };

   return (
      <div className="flex min-h-screen w-full flex-row">
         <div className="hidden lg:flex lg:w-1/2 relative flex-col bg-[#111722] overflow-hidden p-12 justify-between">
            <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAUZif4GwHFFGyO7WhT6C7Sj0t6r8FU6ZFm4HIROppLxght68wlNGc7pRR7ItnXbBQGByRbG4dIGG1B2NVkMdcSt2oVWp4uFoVA5vBaJOQJxp7srspztaSgVUJUR26gkcn1R_4WQqCNzlTCYx7vK3FYK5vZTyNKdyDVaWgMS1peAVNxzOGq7vv-QxUaN4ozjlOEOY1Jgn5C305E1uHMBQ-rMJD2eEEiOfpEln25gDockTLbmV7Trt7GO6jQvX87LXnW3Oo7T8EW1mR4q')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#101622] via-transparent to-transparent"></div>
            <div className="relative z-10 flex items-center gap-2">
               <div className="size-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center"><span className="material-symbols-outlined">hub</span></div>
               <span className="text-xl font-black text-white tracking-tight">MsgScale</span>
            </div>
            <div className="relative z-10 max-w-md space-y-4">
               <span className="material-symbols-outlined text-4xl text-primary">format_quote</span>
               <h2 className="text-4xl font-black text-white leading-tight">One voice. Every channel. Zero compromise.</h2>
               <p className="text-text-secondary text-lg">Purpose-built for teams managing high-volume, brand-critical communications.</p>
            </div>
         </div>

         <div className="flex flex-1 flex-col justify-center items-center p-8 bg-background-dark">
            <div className="w-full max-w-md space-y-8">
               <div className="space-y-2">
                  <h1 className="text-3xl font-black text-white">Welcome back</h1>
                  <p className="text-text-secondary">Enter your credentials to access your workspace.</p>
               </div>

               <div className="flex border-b border-border-dark">
                  <button className="border-b-2 border-primary pb-3 px-1 text-primary font-bold text-sm">Log In</button>
                  {/* <span className="pb-3 px-8 text-text-secondary opacity-50 cursor-not-allowed text-sm font-bold">Create Account (Managed via HRIS)</span> */}
               </div>

               {(error || authError) && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold animate-shake">
                     {error || authError}
                  </div>
               )}

               <form className="space-y-5" onSubmit={handleLogin}>
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Email</label>
                        <input
                           type="email"
                           required
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-[#111722] border border-border-dark rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none transition-all"
                           placeholder="name@company.com"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                        <input
                           type="password"
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-[#111722] border border-border-dark rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none transition-all"
                           placeholder="••••••••"
                        />
                     </div>
                  </div>
                  <button
                     type="submit"
                     disabled={isLoading}
                     className="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                     {isLoading ? (
                        <>
                           <span className="animate-spin material-symbols-outlined text-xl">refresh</span>
                           Signing in...
                        </>
                     ) : (
                        'Sign In'
                     )}
                  </button>
               </form>

               <div className="relative flex items-center gap-4 text-xs font-black text-slate-500 uppercase tracking-widest py-2">
                  <div className="flex-1 h-px bg-border-dark"></div>
                  <span>Or continue with</span>
                  <div className="flex-1 h-px bg-border-dark"></div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button disabled className="opacity-50 cursor-not-allowed flex items-center justify-center gap-2 py-3 rounded-xl border border-border-dark text-sm font-bold">
                     <img src="https://www.svgrepo.com/show/355037/google.svg" className="size-4" alt="Google" />
                     Google
                  </button>
                  <button disabled className="opacity-50 cursor-not-allowed flex items-center justify-center gap-2 py-3 rounded-xl border border-border-dark text-sm font-bold">
                     <img src="https://www.svgrepo.com/show/303123/microsoft-icon.svg" className="size-4" alt="Microsoft" />
                     Microsoft
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Login;
