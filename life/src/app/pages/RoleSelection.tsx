import { useNavigate } from 'react-router';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Heart, UserCircle } from 'lucide-react';

export function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h1>
            <p className="text-xl text-gray-600">How would you like to use LifeFlow?</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Donor Card */}
            <Card className="p-8 hover:shadow-xl transition cursor-pointer border-2 hover:border-red-600">
              <div className="text-center">
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-red-600 fill-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Donor</h2>
                <p className="text-gray-600 mb-6">
                  Register as a blood donor and help save lives in your community. Receive notifications for nearby blood requests.
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Donate blood and make a difference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Get matched with patients in need</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Track your donation history</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                  onClick={() => navigate('/signup?role=donor')}
                >
                  Continue as Donor
                </Button>
              </div>
            </Card>
            
            {/* Patient Card */}
            <Card className="p-8 hover:shadow-xl transition cursor-pointer border-2 hover:border-red-600">
              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserCircle className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">I Need Blood</h2>
                <p className="text-gray-600 mb-6">
                  Register as a patient to find blood donors quickly. Connect with verified donors in your area instantly.
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Find donors with AI-powered matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Send emergency blood requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>View nearby hospitals and donors</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  onClick={() => navigate('/signup?role=patient')}
                >
                  Continue as Patient
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="text-center mt-8">
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
      </div>
    </div>
  );
}