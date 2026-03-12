import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { Shield, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { apiRequest } from '../services/api';

export function ForgotPasswordOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const role = location.state?.role as 'donor' | 'patient' | 'hospital' | undefined;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiRequest('/verify-otp', 'POST', { email, otp });
      // Navigate to reset password and pass email
      navigate('/reset-password', { state: { email, role } });
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest('/send-otp', 'POST', { email, role });
      alert('Verification code resent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
              <Shield className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Code</h1>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to<br />
              <span className="font-semibold text-red-600">{email || 'your registered email'}</span>
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 text-center">
              <strong>Tip:</strong> The code will expire in 5 minutes
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Change email/phone number
          </button>
        </div>
      </div>
    </div>
  );
}
