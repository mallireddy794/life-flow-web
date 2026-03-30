import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { validateEmail, validatePassword, validatePhone } from '../utils/validation';
import { useUser } from '../contexts/UserContext';


export function SignupPage() {
  const navigate = useNavigate();
  const { setUser, setRole: setGlobalRole } = useUser();
  const location = useLocation();

  // Get role from URL search params
  const searchParams = new URLSearchParams(location.search);
  const roleFromUrl = searchParams.get('role') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: roleFromUrl,
    bloodGroup: '',
  });

  useEffect(() => {
    if (roleFromUrl) {
      setFormData(prev => ({ ...prev, role: roleFromUrl }));
    }
  }, [roleFromUrl]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });

    if (value && !validateEmail(value)) {
      setEmailError('Invalid email format (e.g., user@example.com)');
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });

    if (value && !validatePassword(value)) {
      setPasswordError('Password must be 8+ chars, with an uppercase, a number, and a special char');
    } else {
      setPasswordError(null);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setFormData({ ...formData, phone: cleaned });
      
      if (cleaned.length > 0 && !validatePhone(cleaned)) {
        setPhoneError('Phone number must be exactly 10 digits');
      } else {
        setPhoneError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Enter a valid email');
      return;
    }

    if (!validatePassword(formData.password)) {
      setPasswordError('Password does not meet requirements');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setPhoneError('Enter a 10-digit phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiRequest('/signup', 'POST', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        blood_group: formData.bloodGroup
      });

      // Signup successful, try to auto-login
      const loginResult = await apiRequest('/login', 'POST', {
        email: formData.email,
        password: formData.password
      });

      // Update context with user info and include bloodGroup since signup knows it
      const userData = { ...loginResult.user, email: formData.email, blood_group: formData.bloodGroup };
      setUser(userData);
      setGlobalRole(loginResult.user.role);

      // Redirect based on role
      if (loginResult.user.role === 'patient') {
        navigate('/patient-dashboard');
      } else {
        navigate('/donor-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="bg-red-600 p-3 rounded-xl inline-block mb-4">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join LifeFlow and start saving lives</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={`mt-1 ${emailError ? 'border-red-500' : ''}`}
                  required
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`mt-1 ${phoneError ? 'border-red-500' : ''}`}
                  required
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className={`mt-1 ${passwordError ? 'border-red-500' : ''}`}
                  required
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">I want to register as</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor">Blood Donor</SelectItem>
                  <SelectItem value="patient">Patient (Need Blood)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.role === 'donor' || formData.role === 'patient') && (
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300" required />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the Terms of Service and Privacy Policy. I understand that my information will be used to connect with blood donors or patients.
              </label>
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Login here
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}