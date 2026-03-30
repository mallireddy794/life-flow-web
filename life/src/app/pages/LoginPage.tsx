import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';
import { validateEmail } from '../utils/validation';


export function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setRole: setGlobalRole } = useUser();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialRole = (searchParams.get('role') as 'donor' | 'patient') || 'donor';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'donor' | 'patient'>(initialRole);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Only validate as email if it contains '@' or if the user is typing
    if (value && value.includes('@')) {
      if (!validateEmail(value)) {
        setEmailError('Invalid email format');
      } else {
        setEmailError(null);
      }
    } else {
      setEmailError(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (email.includes('@') && !validateEmail(email)) {
      setEmailError('Enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const result = await apiRequest('/login', 'POST', {
        email,
        password,
        role
      });

      const userData = { ...result.user, email };
      setUser(userData);
      setGlobalRole(result.user.role);

      if (result.user.role === 'patient') {
        navigate('/patient-dashboard');
      } else {
        navigate('/donor-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Illustration */}
      <div className="hidden md:block bg-gradient-to-br from-red-600 to-red-800 p-12">
        <div className="h-full flex flex-col justify-center items-center text-white">
          <div className="mb-8">
            <div className="bg-white p-4 rounded-2xl inline-block">
              <Heart className="w-16 h-16 text-red-600 fill-red-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4 text-center">Welcome Back to LifeFlow</h2>
          <p className="text-xl text-red-100 text-center max-w-md">
            Continue your journey in saving lives and making a difference in your community
          </p>
          <div className="mt-12 rounded-2xl overflow-hidden shadow-2xl max-w-md">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758691461516-7e716e0ca135?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwaGVhbHRoY2FyZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzI3Njk4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Healthcare professional"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden text-center">
            <div className="bg-red-600 p-3 rounded-xl inline-block mb-4">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LifeFlow</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email or Phone Number</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email or phone"
                value={email}
                onChange={handleEmailChange}
                className={`mt-1 ${emailError ? 'border-red-500' : ''}`}
                required
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Login as</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setRole('donor')}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition ${role === 'donor'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                >
                  Donor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition ${role === 'patient'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                >
                  Patient
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Sign up here
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              By logging in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}