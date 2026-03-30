import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { apiRequest } from '../services/api';
import { validatePassword } from '../utils/validation';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const role = location.state?.role as 'donor' | 'patient' | 'hospital' | undefined;

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    if (!validatePassword(formData.newPassword)) {
      setPasswordError('Password must be at least 8 characters, include one uppercase, one number, and one special character.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (!email) {
      setError('Email session lost. Please start over.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/reset-password', 'POST', {
        email,
        new_password: formData.newPassword,
        role
      });

      alert('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Create a new password and select your role to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Create a strong password"
                value={formData.newPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, newPassword: val });
                  if (val && !validatePassword(val)) {
                    setPasswordError('Password must be 8+ chars, with an uppercase, a number, and a special char');
                  } else {
                    setPasswordError(null);
                  }
                }}
                className={`mt-1 ${passwordError ? 'border-red-500' : ''}`}
                required
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
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

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 mb-4 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password & Continue'}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900 mb-1">Password Requirements:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include at least one number</li>
                  <li>• Include at least one special character</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}