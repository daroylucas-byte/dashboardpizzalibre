import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  MessageSquare,
  Sparkles,
  Smartphone,
  CheckCircle2,
  LogOut
} from 'lucide-react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [screen, setScreen] = useState('login') // 'login' or 'register'

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem('pizza_libre_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Failed to parse saved user session', e)
      }
    }
    setCheckingAuth(false)
  }, [])

  const handleLogin = (loginData) => {
    const userData = { 
      email: loginData.email, 
      loggedInAt: new Date().toISOString() 
    }
    setUser(userData)
    if (loginData.remember) {
      localStorage.setItem('pizza_libre_user', JSON.stringify(userData))
    }
  }

  const handleRegister = (registerData) => {
    const userData = { 
      email: registerData.email, 
      fullName: registerData.fullName,
      restaurantName: registerData.restaurantName,
      loggedInAt: new Date().toISOString() 
    }
    setUser(userData)
    // By default, save session since they just created it
    localStorage.setItem('pizza_libre_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('pizza_libre_user')
    setScreen('login') // Reset screen to login on signout
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0e1511] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#4edea3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (!user) {
    if (screen === 'register') {
      return (
        <Register 
          onRegister={handleRegister} 
          onNavigateToLogin={() => setScreen('login')} 
        />
      )
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onNavigateToRegister={() => setScreen('register')} 
      />
    )
  }


  return (
    <Dashboard user={user} onLogout={handleLogout} />
  )
}

export default App

