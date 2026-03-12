import { useNavigate } from 'react-router';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Heart, Search, Users, MapPin, Clock, Shield, PhoneCall } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navigation transparent={true} />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-red-100 text-red-600 rounded-full mb-4">
                AI-Enabled Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Save Lives with <span className="text-red-600">Smart Blood Donation</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect donors and patients instantly with AI-powered matching. Make every donation count.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700 text-lg px-8"
                  onClick={() => navigate('/patient-dashboard')}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find Donors
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => navigate('/donor-dashboard')}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Become a Donor
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1728988914134-c14e15f91d8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9vZCUyMGRvbmF0aW9uJTIwaGVhbHRoY2FyZSUyMGlsbHVzdHJhdGlvbnxlbnwxfHx8fDE3NzI4MDc3OTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Blood donation healthcare"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How LifeFlow Works</h2>
            <p className="text-xl text-gray-600">Simple steps to save lives</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Register</h3>
              <p className="text-gray-600">Sign up as a donor or patient</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Matching</h3>
              <p className="text-gray-600">Smart algorithm finds best matches</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneCall className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect</h3>
              <p className="text-gray-600">Communicate in real-time</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-600 fill-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Save Lives</h3>
              <p className="text-gray-600">Make a difference today</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600">Everything you need for seamless blood donation</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <MapPin className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Nearby Donors</h3>
              <p className="text-gray-600">Find donors within 5km radius instantly with real-time location tracking</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <Clock className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Emergency Requests</h3>
              <p className="text-gray-600">Critical blood request mode with instant notifications to all nearby donors</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <Shield className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Verified Profiles</h3>
              <p className="text-gray-600">All donors are verified with health eligibility checks and secure profiles</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 text-red-100">Join thousands of donors and help save lives in your community</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8"
              onClick={() => navigate('/signup')}
            >
              Get Started Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 border-white text-white hover:bg-red-700"
              onClick={() => navigate('/role-selection')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="font-bold text-xl text-white">LifeFlow</span>
              </div>
              <p className="text-sm">AI-enabled blood donation platform connecting donors and patients</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate('/')} className="text-sm text-left hover:text-red-400">Home</button>
                <button onClick={() => navigate('/donor-dashboard')} className="text-sm text-left hover:text-red-400">For Donors</button>
                <button onClick={() => navigate('/patient-dashboard')} className="text-sm text-left hover:text-red-400">For Patients</button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <div className="flex flex-col gap-2">
                <button className="text-sm text-left hover:text-red-400">Help Center</button>
                <button className="text-sm text-left hover:text-red-400">FAQ</button>
                <button className="text-sm text-left hover:text-red-400">Contact Us</button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <p className="text-sm mb-2">Email: support@lifeflow.com</p>
              <p className="text-sm mb-2">Phone: 1-800-BLOOD-HELP</p>
              <p className="text-sm">Emergency: 911</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 LifeFlow. All rights reserved. Saving lives together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
