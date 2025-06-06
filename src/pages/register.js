import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

const ParticlesBackground = dynamic(
  () => {
    return Promise.resolve(() => {
      useEffect(() => {
        const initializeParticles = (attempt = 1, maxAttempts = 5) => {
          if (typeof window !== 'undefined' && window.particlesJS) {
            window.particlesJS('particles-js', {
              particles: {
                number: { 
                  value: 400,
                  density: { enable: true, value_area: 1000 }
                },
                color: { value: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'] },
                shape: {
                  type: 'circle',
                  stroke: { width: 0, color: '#000000' },
                },
                opacity: {
                  value: 0.9,
                  random: true,
                  anim: {
                    enable: true,
                    speed: 0.5,
                    opacity_min: 0.2,
                    sync: false
                  },
                },
                size: {
                  value: 1.8,
                  random: true,
                  anim: {
                    enable: true,
                    speed: 1.5,
                    size_min: 0.3,
                    sync: false
                  },
                },
                line_linked: { 
                  enable: false
                },
                move: {
                  enable: true,
                  speed: 0.5,
                  direction: 'none',
                  random: true,
                  straight: false,
                  out_mode: 'out',
                  bounce: false,
                },
              },
              interactivity: {
                detect_on: 'canvas',
                events: {
                  onhover: { enable: false },
                  onclick: { enable: false },
                  resize: true,
                },
              },
              retina_detect: true,
            });
          } else if (attempt <= maxAttempts) {
            setTimeout(() => initializeParticles(attempt + 1, maxAttempts), 500);
          }
        };

        initializeParticles();
      }, []);

      return (
        <div 
          id="particles-js" 
          className="absolute inset-0 z-0 opacity-60"
          style={{
            background: 'radial-gradient(circle at center, var(--background) 0%, var(--card-bg) 100%)'
          }}
        />
      );
    });
  },
  { ssr: false }
);

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage(data.message)
        // Clear form on success
        setForm({ name: '', email: '', password: '' })
      } else {
        setError(data.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Register | Task Manager</title>
        <meta name="description" content="Create your Task Manager account" />
        <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js" async />
      </Head>

      <ParticlesBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Task Manager</h1>
            <p className="text-foreground/60">Join us to organize your tasks</p>
          </div>

          {/* Register Card */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-center mb-6">Create Account</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input w-full"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input w-full"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input w-full"
                  placeholder="Create a password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/60">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="text-primary text-2xl mb-2">📱</div>
              <p className="text-sm text-foreground/60">Access Anywhere</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="text-primary text-2xl mb-2">🔒</div>
              <p className="text-sm text-foreground/60">Secure & Private</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}