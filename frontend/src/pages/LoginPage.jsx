import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';

function FieldLabel({ children }) {
  return (
    <label className="block text-[11px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['JetBrains_Mono',monospace] mb-1.5">
      {children}
    </label>
  );
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.7-1.28-1.7-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .32.2.67.8.56A10.53 10.53 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" {...props}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send login credentials to the backend
      const response = await api.post('/auth/login', { email, password });

      const { token, user } = response.data;

      // Store the token so the user stays logged in
      // Use localStorage for persistent login, or sessionStorage if "remember" is off
      if (remember) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      console.log('Logged in:', user);

      // Redirect to the dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      // Extract a readable error message from the backend response,
      // or fall back to a generic message if something unexpected happens
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-7">
        <h2 className="text-2xl text-center font-semibold text-[#1B1E29] font-['Space_Grotesk',sans-serif] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-center text-sm text-[#6B6558]">
          Manage tasks, projects, and teamwork with AI
        </p>
      </div>

      <div className="space-y-3 mb-7">
        <button
          type="button"
          onClick={() => toast('GitHub sign-in coming soon', {
            icon: (
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#7C82B8" strokeWidth="1.4" />
                <path d="M8 4.5V8l2.5 1.5" stroke="#7C82B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
          })}
          className="w-full flex items-center justify-center gap-2.5 rounded-md border border-[#1B1E29]/12 bg-white/70 py-2.5 text-sm font-medium text-[#1B1E29] hover:bg-white hover:border-[#1B1E29]/20 transition-colors"
        >
          <GithubIcon /> Continue with GitHub
        </button>
        <button
          type="button"
          onClick={() => toast('Google sign-in coming soon', {
            icon: (
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#7C82B8" strokeWidth="1.4" />
                <path d="M8 4.5V8l2.5 1.5" stroke="#7C82B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
          })}
          className="w-full flex items-center justify-center gap-2.5 rounded-md border border-[#1B1E29]/12 bg-white/70 py-2.5 text-sm font-medium text-[#1B1E29] hover:bg-white hover:border-[#1B1E29]/20 transition-colors"
        >
          <GoogleIcon /> Continue with Google
        </button>
      </div>

      <div className="flex items-center gap-3 mb-7">
        <span className="h-px flex-1 bg-[#1B1E29]/10" />
        <span className="text-[11px] tracking-[0.15em] text-[#8a8272] uppercase font-['JetBrains_Mono',monospace]">
          or email
        </span>
        <span className="h-px flex-1 bg-[#1B1E29]/10" />
      </div>

      {/* Show a backend or network error message, if any */}
      {error && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b-2 border-[#1B1E29]/15 py-2.5 px-3 text-base text-[#1B1E29] placeholder:text-[#1B1E29]/30 focus:outline-none focus:border-[#7C82B8] transition-colors"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel>Password</FieldLabel>
            <Link to="/forgot-password" className="text-[11px] text-[#7C82B8] hover:text-[#565c7e] font-medium">
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b-2 border-[#1B1E29]/15 py-2.5 px-3 text-base text-[#1B1E29] placeholder:text-[#1B1E29]/30 focus:outline-none focus:border-[#7C82B8] transition-colors"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <label className="flex items-center gap-2.5 -mt-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded accent-[#101946] cursor-pointer"
          />
          <span className="text-sm text-[#6B6558]">Remember me</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-md bg-[#101946] py-3.5 px-6 text-sm font-semibold tracking-wide text-[#fafbfb] hover:bg-[#0D1438] hover:shadow-[0_8px_24px_-8px_rgba(16,25,70,0.4)] active:bg-[#0D1438] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-9 text-center text-sm text-[#6B6558]">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-[#1B1E29] hover:text-[#565c7e] transition-colors">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}