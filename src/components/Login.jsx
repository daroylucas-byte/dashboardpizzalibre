import React, { useState, useEffect } from 'react'

export default function Login({ onLogin, onNavigateToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Subtle mouse move effect on the glowing background blobs
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      const blur1 = document.getElementById('bg-blur-1');
      const blur2 = document.getElementById('bg-blur-2');
      
      if (blur1 && blur2) {
        blur1.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        blur2.style.transform = `translate(${x * -30}px, ${y * -30}px)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulating authentication flow
    setTimeout(() => {
      if (email.trim() && password.trim()) {
        setLoading(false)
        onLogin({ email, remember })
      } else {
        setError('Por favor complete todos los campos requeridos.')
        setLoading(false)
      }
    }, 1000)
  };

  const togglePassword = () => {
    setShowPassword(!showPassword)
  };

  const handleBypass = () => {
    onLogin({ email: 'admin@pizzalibre.com', remember: true })
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen w-full flex items-center justify-center selection:bg-primary selection:text-on-primary relative overflow-hidden">
      
      {/* Background Atmospheric Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          id="bg-blur-1" 
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] transition-transform duration-300 ease-out"
        ></div>
        <div 
          id="bg-blur-2" 
          className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] transition-transform duration-300 ease-out"
        ></div>
      </div>

      {/* Login Container */}
      <main className="w-full max-w-[440px] px-container-padding relative z-10 my-8">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/10 mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-[32px]">restaurant</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-1">RestoManager Pro</h1>
          <p className="text-on-surface-variant font-body-md text-body-md">Enterprise Multi-unit Administration</p>
        </div>

        {/* Login Card */}
        <div className="gradient-border-card emerald-glow p-8 md:p-10 bg-surface-container">
          <form className="space-y-6" id="loginForm" onSubmit={handleSubmit}>
            
            {/* Error Message Alert */}
            {error && (
              <div className="p-3 rounded bg-error-container/20 border border-error/30 text-error flex items-center gap-2 text-xs font-medium">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2" htmlFor="email">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                EMAIL ADDRESS
              </label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-on-surface-variant/30 text-body-md" 
                  id="email" 
                  name="email" 
                  placeholder="administrator@restomanager.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2" htmlFor="password">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  PASSWORD
                </label>
                <a className="font-label-caps text-label-caps text-primary hover:text-primary-fixed-dim transition-colors text-[11px]" href="#forgot">FORGOT PASSWORD?</a>
              </div>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-on-surface-variant/30 text-body-md" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none" 
                  onClick={togglePassword} 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]" id="passwordToggleIcon">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center gap-3">
              <div 
                className="relative inline-flex items-center cursor-pointer group"
                onClick={() => !loading && setRemember(!remember)}
              >
                <input 
                  className="sr-only peer" 
                  id="remember" 
                  type="checkbox"
                  checked={remember}
                  readOnly
                />
                <div className={`w-10 h-5 rounded-full transition-all duration-300 ${remember ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 ${remember ? 'translate-x-5 bg-on-primary' : 'translate-x-1 bg-on-surface-variant'}`}></div>
              </div>
              <span 
                className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none"
                onClick={() => !loading && setRemember(!remember)}
              >
                Remember this device
              </span>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-4 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-75 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>

            {/* Bypass/Demo Login Button */}
            <button 
              type="button"
              onClick={handleBypass}
              disabled={loading}
              className="w-full bg-surface-container-low hover:bg-surface-container border border-outline-variant text-primary hover:text-primary-fixed font-label-caps text-label-caps py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer mt-3 shadow-md shadow-black/40"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
              <span>Acceso Demo (Bypass)</span>
            </button>
          </form>

          {/* Registration Prompt */}
          <div className="mt-8 pt-8 border-t border-outline-variant text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              New to the platform?{' '}
              <a 
                className="text-primary font-semibold hover:underline underline-offset-4 decoration-primary/30 transition-all text-body-md cursor-pointer" 
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToRegister();
                }}
              >
                Register here
              </a>
            </p>
          </div>
        </div>

        {/* Footer Meta */}
        <footer className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors" href="#privacy">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors" href="#terms">Terms of Service</a>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors" href="#support">Support</a>
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant/40 uppercase tracking-widest">© 2026 RestoManager Pro Systems</p>
        </footer>
      </main>

      {/* Side Graphic (Floating Image Card) - Desktop Only */}
      <div className="hidden xl:block fixed right-12 top-1/2 -translate-y-1/2 w-[500px] z-10">
        <div className="gradient-border-card overflow-hidden emerald-glow group">
          <img 
            alt="Kitchen Management" 
            className="w-full h-[600px] object-cover opacity-60 grayscale-[40%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlH2unG-DnVwPytUkf5TaBQMAa4ShN6OQKEah4iJlPH_gXbD_AgNEe66n-O2FnAHfUZKrC60MBvTXxN-pgnd_MiY1lwCFn5ssH769qJxBz4ex1ijK7-oXKWOyjGH0qD2a7ShDOm3w2z8yvxZf-owD2z2Y2OP8coIyoq61ORg9iG4bGI8_U9OUHcik-BLH0klhtJceuKKC_FTUTdiOY-g5XML5QuAkGnDHiajtRtTP6Oq-M7EetFGAMhXte32ZRR7nA-Lfz686XU3-4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90"></div>
          <div className="absolute bottom-10 left-10 right-10">
            <div className="bg-primary-container/20 backdrop-blur-md border border-primary/20 p-6 rounded-xl">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">Real-time Efficiency</h3>
              <p className="text-on-surface-variant">Empowering multi-unit managers with precision data and AI-driven insights to scale restaurant operations seamlessly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
