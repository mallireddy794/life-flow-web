import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { Heart, Shield } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

export function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get role from URL search params
  const searchParams = new URLSearchParams(location.search);
  const role = (searchParams.get('role') as 'donor' | 'patient') || 'donor';
  const { setRole } = useUser();

  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    // store role in context before continuing
    setRole(role);
    // Mock verification - navigate based on role
    if (role === 'patient') {
      navigate('/patient-dashboard');
    } else {
      navigate('/donor-profile-setup');
    }
  };

  const handleResend = () => {
    // Mock resend OTP
    alert('OTP resent to your phone number');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
              <Shield className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Phone</h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to<br />
              <span className="font-semibold">+1 (555) 123-4567</span>
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
            >
              Verify & Continue
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <button 
                onClick={handleResend}
                className="text-red-600 hover:text-red-700 font-semibold text-sm"
              >
                Resend OTP
              </button>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 text-center">
              <strong>Tip:</strong> The code will expire in 10 minutes
            </p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/signup')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Change phone number
          </button>
        </div>
      </div>
    </div>
  );
}