import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { CheckCircle2, Calendar, Clock, MapPin, MessageCircle, Home } from 'lucide-react';

export function AppointmentConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <Card className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Appointment Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for choosing to save lives. Your appointment has been scheduled successfully.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Appointment Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">
                    Monday, March 10, 2026
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="font-semibold text-gray-900">10:00 AM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Hospital</p>
                  <p className="font-semibold text-gray-900">City General Hospital</p>
                  <p className="text-sm text-gray-500 mt-1">123 Medical Center Dr, New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">What to Bring:</h3>
            <ul className="text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Valid government-issued ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Donor card (if you have one)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>List of current medications</span>
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/chat')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat with Patient
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/donor-dashboard')}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              A confirmation has been sent to your email and phone number
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/live-tracking')}
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            Track Request Status →
          </button>
        </div>
      </div>
    </div>
  );
}
