import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Github, 
  Chrome,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useFirebase } from './FirebaseContext';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { user, profile, login, signUpWithEmail, loginWithEmail, resetPassword } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      const isAdmin = profile.role === 'admin' || user.email === "johansonsebudi@gmail.com";
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        if (!name) throw new Error('Please enter your name');
        await signUpWithEmail(email, password, name);
      }
      // Redirection is handled by useEffect
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await login();
      // Redirection is handled by useEffect
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      setError(err.message || 'Google login failed');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-md w-full">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black mb-8 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-black/5"
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl font-display font-bold uppercase tracking-tight mb-2">
                {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
              </h1>
              <p className="text-black/60 text-sm">
                {isForgotPassword 
                  ? 'Enter your email to receive a reset link' 
                  : (isLogin ? 'Login to your fashionFIT account' : 'Join the fashionFIT community today')}
              </p>
            </div>

            {isForgotPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1.5 ml-4">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email"
                      className="w-full pl-12 pr-4 py-3.5 bg-black/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-botswana-blue/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-600 text-xs leading-relaxed"
                  >
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-50 rounded-2xl flex items-start gap-3 text-emerald-600 text-xs leading-relaxed"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <ArrowRight size={10} />
                    </div>
                    <p>{success}</p>
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-black/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full py-4 border border-black/5 rounded-2xl font-bold text-sm hover:bg-black/5 transition-all"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1.5 ml-4">Full Name</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20">
                            <UserIcon size={18} />
                          </div>
                          <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Thabo Mbeki"
                            className="w-full pl-12 pr-4 py-3.5 bg-black/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-botswana-blue/20 transition-all outline-none"
                            required={!isLogin}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1.5 ml-4">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20">
                        <Mail size={18} />
                      </div>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email"
                        className="w-full pl-12 pr-4 py-3.5 bg-black/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-botswana-blue/20 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5 ml-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40">Password</label>
                      {isLogin && (
                        <button 
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-[10px] font-bold uppercase tracking-widest text-botswana-blue hover:underline mr-4"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20">
                        <Lock size={18} />
                      </div>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-black/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-botswana-blue/20 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-600 text-xs leading-relaxed"
                    >
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-black/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Login' : 'Create Account'} <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="px-4 bg-white text-black/20">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={handleGoogleLogin}
                    className="py-4 border border-black/5 rounded-2xl font-bold text-sm hover:bg-black/5 transition-all flex items-center justify-center gap-3"
                  >
                    <Chrome size={18} /> Google
                  </button>
                </div>

                <p className="text-center mt-8 text-sm text-black/40 font-medium">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-botswana-blue font-bold hover:underline"
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
