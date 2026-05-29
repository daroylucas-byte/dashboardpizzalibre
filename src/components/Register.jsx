import React, { useState } from 'react'

export default function Register({ onRegister, onNavigateToLogin }) {
  const [restaurantName, setRestaurantName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Track which field is currently focused to trigger custom micro-interactions
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Basic Validation
    if (!restaurantName.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
      setError('Por favor complete todos los campos obligatorios.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)

    // Simulate account registration
    setTimeout(() => {
      setLoading(false)
      onRegister({ email, fullName, restaurantName })
    }, 1500)
  }

  // Focus utility helper
  const getFocusClasses = (fieldName) => {
    return focusedField === fieldName ? 'text-primary' : 'text-on-surface-variant'
  }

  return (
    <div className="bg-[#0e1511] text-[#dde4dd] min-h-screen w-full flex items-center justify-center p-container-padding relative overflow-hidden font-body-md text-body-md selection:bg-primary selection:text-on-primary">
      
      {/* Decorative Glows */}
      <div className="glow-effect top-[-100px] left-[-100px]"></div>
      <div className="glow-effect bottom-[-100px] right-[-100px]"></div>

      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 my-8">
        
        {/* Left Side: Branding & Value Prop - Desktop Only */}
        <div className="hidden lg:flex lg:col-span-6 flex-col space-y-8 pr-8 text-left">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary mb-2">RestoManager Pro</h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">EMERALD EXECUTIVE SUITE</p>
          </div>
          
          <div className="space-y-6">
            <h2 className="font-display-lg text-display-lg text-on-surface leading-tight">
              Empower your multi-unit <br/>
              <span className="text-primary-fixed">restaurant empire</span> with <br/>
              precision data.
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl glass-card">
                <span className="material-symbols-outlined text-primary mb-2">analytics</span>
                <h3 className="font-headline-sm text-headline-sm mb-1">Unified Insights</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Real-time performance metrics across all locations.</p>
              </div>
              <div className="p-4 rounded-xl glass-card">
                <span className="material-symbols-outlined text-primary mb-2">auto_awesome</span>
                <h3 className="font-headline-sm text-headline-sm mb-1">AI Marketing</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Automated campaigns powered by behavioral trends.</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 opacity-60">
            <div className="flex -space-x-2">
              <img 
                alt="User 1" 
                className="w-8 h-8 rounded-full border-2 border-surface object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCok-L1p6WAO8TCxzqSTBMNxtXMO1v7niRL8Pa7fSjNHE92d__Meu0LnI3qE1IRso0vUK4I1I9zefNn7Dz4qyOcF3dsjJH07jrBZ5ZjImRll7xj0eT102zTJgArqpITKuJt6dw_iJKAsPe-gjPPEw1FZODPiEpiwQhTg7NECsVPY3KzrkyRNx0sdhynAZt1JwGtDIj3Syz6yuuD19w46rLYbXzE9T4lcySusLZYTK4KLBkWQZhVNDdJSBhmj20b9DAF5Vw0iaXP1COR"
              />
              <img 
                alt="User 2" 
                className="w-8 h-8 rounded-full border-2 border-surface object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG2fsxYtq2FgKqwx39NL9g-OcG1owEFLcD7FDNEVa-STB0-8v9iUaasv4NMQKFwUQT3tf8Wy6ZnucI5x_hAT-GxeMieO6ERaSEo45bYN1m37aoIZfGAX9OK1geWEFC3ky0iThfXybvz0eHDOBlY4d1Jihx_cxJnbll4F-ESXN_37KXKwlJ4uve318-liFzYEXtPWd9lpr9nSATw2oBbUcOEHVH4ySaF1or9m0iYZKcXu-iP8GJn82WPmNKmXlD5lPArZxe5MB605cx"
              />
              <img 
                alt="User 3" 
                className="w-8 h-8 rounded-full border-2 border-surface object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZyt3uXCvmW4CTO3BxbdXuALp4M_-s0AS9-qU4OTtzgQvYBwQ1JrgDlbSyRp31_GlqJNsPV261U9gmMX6WtQMEM9362BYZHnl-0vPYBB7DHCoTjHCkJYQqCvmKbwuNKPZh39iXF-50s-xQpsV-GtfjcBkii-XxrQXi00u1SQOqmJdXJk8oMxNXtSDxjZpIjW8RKgUqbGa_9hFXpsHvZZt8A7Al55eZjaiKwkQSweaG5TK_G4kgHRzS_T2GupUOxBTC2AYdNjhMaamH"
              />
            </div>
            <p className="font-data-sub text-data-sub">Trusted by 500+ Multi-unit Owners</p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-6 w-full max-w-[520px] mx-auto text-left">
          <div className="glass-card rounded-xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent"></div>
            
            <div className="mb-8">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Create Executive Account</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Begin your journey to operational excellence.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Error Message Alert */}
              {error && (
                <div className="p-3 rounded bg-error-container/20 border border-error/30 text-error flex items-center gap-2 text-xs font-medium">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Restaurant Name */}
              <div className="space-y-1.5">
                <label className={`font-label-caps text-label-caps ml-1 transition-colors duration-200 ${getFocusClasses('restaurantName')}`}>
                  Restaurant Name
                </label>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${getFocusClasses('restaurantName')}`}>
                    restaurant
                  </span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 pl-11 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200" 
                    placeholder="e.g. Emerald Bistro Group" 
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    onFocus={() => setFocusedField('restaurantName')}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className={`font-label-caps text-label-caps ml-1 transition-colors duration-200 ${getFocusClasses('fullName')}`}>
                  Full Name
                </label>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${getFocusClasses('fullName')}`}>
                    person
                  </span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 pl-11 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200" 
                    placeholder="Executive Name" 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className={`font-label-caps text-label-caps ml-1 transition-colors duration-200 ${getFocusClasses('email')}`}>
                  Work Email
                </label>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${getFocusClasses('email')}`}>
                    mail
                  </span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 pl-11 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200" 
                    placeholder="name@company.com" 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Passwords Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Password */}
                <div className="space-y-1.5">
                  <label className={`font-label-caps text-label-caps ml-1 transition-colors duration-200 ${getFocusClasses('password')}`}>
                    Password
                  </label>
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${getFocusClasses('password')}`}>
                      lock
                    </span>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 pl-11 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200" 
                      placeholder="••••••••" 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className={`font-label-caps text-label-caps ml-1 transition-colors duration-200 ${getFocusClasses('confirmPassword')}`}>
                    Confirm
                  </label>
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${getFocusClasses('confirmPassword')}`}>
                      verified_user
                    </span>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 pl-11 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200" 
                      placeholder="••••••••" 
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm py-4 rounded-lg mt-4 transition-all duration-200 active:scale-[0.98] flex items-center justify-center group shadow-lg shadow-primary/20 disabled:opacity-75 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined ml-2 transition-transform duration-200 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Navigation back to login */}
            <div className="mt-8 pt-6 border-t border-outline-variant text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?{' '}
                <a 
                  className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToLogin();
                  }}
                >
                  Login here
                </a>
              </p>
            </div>

            {/* Subtle AI indicator at bottom */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-primary opacity-40">
              <span className="material-symbols-outlined text-[14px]">security</span>
              <span className="font-label-caps text-[10px]">ENTERPRISE GRADE ENCRYPTION ACTIVE</span>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 flex justify-between px-4">
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#privacy">Privacy Policy</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#terms">Terms of Service</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#support">Support</a>
          </div>
        </div>
      </div>
    </div>
  )
}
